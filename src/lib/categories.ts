export const GROUPED_CATEGORIES = {
  "Wajib (Needs)": [
    "Tempat Tinggal & Tagihan",
    "Makan Harian & Dapur",
    "Transportasi Harian",
    "Kesehatan",
    "Pendidikan",
    "Kewajiban & Cicilan",
  ],
  "Keinginan (Wants)": [
    "Jajan & Makan di Luar",
    "Belanja & Gaya Hidup",
    "Hiburan & Hobi",
    "Transportasi Ekstra",
    "Liburan & Jalan-jalan",
    "Perawatan Diri",
  ],
  "Masa Depan & Sosial": [
    "Tabungan & Investasi",
    "Sosial & Sedekah",
  ],
  "Lainnya": [
    "Lain-lain"
  ]
} as const;

export const EXPENSE_CATEGORIES = Object.values(GROUPED_CATEGORIES).flat() as unknown as readonly string[];

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];
