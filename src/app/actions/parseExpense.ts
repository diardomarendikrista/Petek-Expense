"use server";

import { z } from "zod";
import OpenAI from "openai";
import { GoogleGenAI, Type } from "@google/genai";
import { EXPENSE_CATEGORIES } from "@/lib/categories";

const expenseSchema = z.object({
  type: z.enum(["expense", "income"]),
  amount: z.number(),
  category: z.string(),
  description: z.string(),
  currency: z.string().default("IDR"),
});

export type ParsedExpense = z.infer<typeof expenseSchema>;

const SYSTEM_PROMPT = `
You are an AI that extracts expense information from natural language.
The user will provide a sentence in Indonesian.
Extract the transaction details into JSON format.
Rules:
1. 'type' must be 'expense' (pengeluaran) or 'income' (pemasukan).
2. 'amount' must be a number. Interpret words like "ribu" (thousand), "juta" (million), "k" (thousand). Example: "18k" = 18000, "50 ribu" = 50000.
3. 'category' MUST be strictly chosen from one of the following exact strings:
   ${EXPENSE_CATEGORIES.map(c => `"${c}"`).join(', ')}
   Map the user's input intelligently to the closest category.
   Examples: 
   - "Bayar listrik", "kos", "internet" -> "Tempat Tinggal & Tagihan"
   - "Beli beras", "sayur", "galon" -> "Makan Harian & Dapur"
   - "Isi bensin", "tiket krl", "tol" -> "Transportasi Harian"
   - "Obat", "ke dokter", "bpjs" -> "Kesehatan"
   - "Buku sekolah", "spp", "kursus" -> "Pendidikan"
   - "Cicilan motor", "bayar utang", "pajak" -> "Kewajiban & Cicilan"
   - "Beli bakso", "ngopi", "mixue", "mcd" -> "Jajan & Makan di Luar"
   - "Baju baru", "sepatu", "skincare" -> "Belanja & Gaya Hidup"
   - "Nonton bioskop", "netflix", "game" -> "Hiburan & Hobi"
   - "Grab", "gocar", "gojek", "parkir valet" -> "Transportasi Ekstra"
   - "Tiket pesawat", "hotel", "oleh-oleh" -> "Liburan & Jalan-jalan"
   - "Potong rambut", "salon", "pijat" -> "Perawatan Diri"
   - "Nabung", "beli emas", "reksa dana" -> "Tabungan & Investasi"
   - "Zakat", "kondangan", "kado", "sedekah" -> "Sosial & Sedekah"
4. 'description' must be a short summary of what was bought or paid for, in Indonesian.
5. 'currency' is 'IDR' by default.

Example Input: "Beli bakso dua puluh ribu rupiah"
Example Output: {"type": "expense", "amount": 20000, "category": "Jajan & Makan di Luar", "description": "Bakso", "currency": "IDR"}

Example Input: "Isi bensin 40 ribu"
Example Output: {"type": "expense", "amount": 40000, "category": "Transportasi Harian", "description": "Bensin", "currency": "IDR"}

Example Input: "Sumbangan kondangan 100 ribu"
Example Output: {"type": "expense", "amount": 100000, "category": "Sosial & Sedekah", "description": "Kondangan", "currency": "IDR"}
`;

export async function parseExpense(text: string): Promise<ParsedExpense> {
  // Use Gemini if API key is provided
  if (process.env.GEMINI_API_KEY) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite",
      contents: text,
      config: {
        systemInstruction: SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            amount: { type: Type.NUMBER },
            category: { type: Type.STRING, enum: [...EXPENSE_CATEGORIES] },
            description: { type: Type.STRING },
            currency: { type: Type.STRING },
          },
          required: ["type", "amount", "category", "description", "currency"],
        },
      },
    });

    try {
      const jsonText = response.text;
      if (!jsonText) throw new Error("No text returned from Gemini");
      const parsed = JSON.parse(jsonText);
      return expenseSchema.parse(parsed);
    } catch (e) {
      console.error("Gemini parse error", e);
      throw new Error("Failed to parse expense from Gemini");
    }
  }

  // Fallback to Deepseek (or any OpenAI compatible API)
  if (process.env.DEEPSEEK_API_KEY) {
    const openai = new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: "https://api.deepseek.com", // Deepseek API base URL
    });

    const completion = await openai.chat.completions.create({
      model: "deepseek-chat",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: text },
      ],
      response_format: { type: "json_object" },
    });

    try {
      const content = completion.choices[0].message.content;
      if (!content) throw new Error("No content returned");
      const parsed = JSON.parse(content);
      return expenseSchema.parse(parsed);
    } catch (e) {
      console.error("Deepseek parse error", e);
      throw new Error("Failed to parse expense from Deepseek");
    }
  }

  throw new Error("No AI provider configured. Please set GEMINI_API_KEY or DEEPSEEK_API_KEY.");
}
