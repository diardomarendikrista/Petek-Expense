# Petek Expense

A frictionless, voice-first expense capture tool. Petek Expense allows you to record your daily expenses in under 5 seconds simply by speaking. Designed as a mobile-first PWA, it leverages AI to automatically parse natural language into structured expense data.

## Features

- **Voice-first Entry:** Use the microphone to record expenses (e.g., "Beli bakso dua puluh ribu rupiah").
- **AI Parsing:** Automatically categorizes and formats your expenses using Gemini or Deepseek APIs.
- **Offline / PWA Ready:** Installable on Android/iOS.
- **Dashboard:** Instantly view today's total, recent transactions, and monthly summaries.
- **Manual Entry Fallback:** If you can't speak, you can always enter expenses manually.

## Stack

- Next.js 15 (App Router)
- Tailwind CSS v4 & Framer Motion
- Prisma & PostgreSQL
- NextAuth.js (Email/Password)
- Web Speech API + AI Parsing (Gemini / Deepseek)

## Installation

1. **Clone & Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/petek_expense?schema=public"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"

   # Uncomment and add ONE of the following API keys for the AI parser:
   # GEMINI_API_KEY="your-gemini-api-key"
   # DEEPSEEK_API_KEY="your-deepseek-api-key"
   ```

3. **Database Setup**
   Ensure your PostgreSQL instance is running. Then run:
   ```bash
   npx prisma db push
   ```

4. **Seed the Database (Optional)**
   ```bash
   npx prisma db seed
   ```

5. **Run the Development Server**
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Testing

For testing, you can use the seeded user account:
- **Email:** test@example.com
- **Password:** password123
