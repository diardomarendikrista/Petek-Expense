import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "Test User",
      password: hashedPassword,
    },
  });

  console.log("Created test user:", user.email);

  // Add some sample expenses
  await prisma.expense.createMany({
    data: [
      {
        userId: user.id,
        amount: 25000,
        category: "Makanan",
        description: "Nasi Goreng",
        expenseDate: new Date(),
      },
      {
        userId: user.id,
        amount: 15000,
        category: "Minuman",
        description: "Kopi",
        expenseDate: new Date(),
      },
      {
        userId: user.id,
        amount: 40000,
        category: "Transportasi",
        description: "Bensin",
        expenseDate: new Date(),
      },
    ],
  });

  console.log("Created sample expenses");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
