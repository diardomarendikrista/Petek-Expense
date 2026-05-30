import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

async function main() {
  const backupFilePath = path.join(__dirname, "..", "backup.json");

  console.log("==========================================");
  console.log("   Petek Expense - Data Restore Tool   ");
  console.log("==========================================");

  if (!fs.existsSync(backupFilePath)) {
    console.error("Error: File backup.json tidak ditemukan!");
    console.log("Silakan unduh file backup dari Google Drive, ganti namanya menjadi 'backup.json',");
    console.log("lalu letakkan di folder utama proyek (sejajar dengan package.json).");
    process.exit(1);
  }

  console.log("Membaca file backup.json...");
  let backupData;
  try {
    const fileContent = fs.readFileSync(backupFilePath, "utf-8");
    backupData = JSON.parse(fileContent);
  } catch (error) {
    console.error("Error membaca file JSON:", error);
    process.exit(1);
  }

  const { users, expenses } = backupData.data;

  if (!users || !expenses) {
    console.error("Error: Format file backup tidak valid. Pastikan ini adalah file backup dari sistem Petek Expense.");
    process.exit(1);
  }

  console.log(`Ditemukan ${users.length} data User dan ${expenses.length} data Expense.`);
  console.log("Memulai proses restore ke database...\n");

  try {
    // 1. Restore Users
    if (users.length > 0) {
      console.log("Memulihkan tabel Users...");
      const userResult = await prisma.user.createMany({
        data: users.map((u: any) => ({
          ...u,
          createdAt: new Date(u.createdAt),
          updatedAt: new Date(u.updatedAt),
        })),
        skipDuplicates: true, // Abaikan jika id/email sudah ada di database
      });
      console.log(`-> Berhasil menambahkan ${userResult.count} User baru.`);
    }

    // 2. Restore Expenses
    if (expenses.length > 0) {
      console.log("Memulihkan tabel Expenses...");
      const expenseResult = await prisma.expense.createMany({
        data: expenses.map((e: any) => ({
          ...e,
          expenseDate: new Date(e.expenseDate),
          createdAt: new Date(e.createdAt),
          updatedAt: new Date(e.updatedAt),
        })),
        skipDuplicates: true, // Abaikan jika id sudah ada
      });
      console.log(`-> Berhasil menambahkan ${expenseResult.count} Expense baru.`);
    }

    console.log("\n==========================================");
    console.log("Proses Restore Selesai dengan Sukses! 🎉");
    console.log("==========================================");

  } catch (error) {
    console.error("\nTerjadi kesalahan saat memulihkan data:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
