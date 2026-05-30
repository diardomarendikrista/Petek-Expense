"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { getSettings } from "./settingsActions";
import { startOfWeek, endOfWeek } from "date-fns";

export async function saveExpense(data: {
  amount: number;
  category: string;
  description?: string;
  date?: string;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const expenseDate = data.date ? new Date(data.date) : new Date();

  await db.expense.create({
    data: {
      userId: session.user.id,
      amount: data.amount,
      category: data.category,
      description: data.description,
      expenseDate,
      type: "expense",
    },
  });

  revalidatePath("/");
  revalidatePath("/history");
  return { success: true };
}

export async function getDashboardData() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return {
      weeklyTotal: 0,
      weeklyByCategory: [],
      monthlyTotal: 0,
      monthlyByCategory: [],
      recentTransactions: [],
      cycle: { monthStart: "", monthEnd: "", weekStart: "", weekEnd: "" }
    };
  }

  const userId = session.user.id;
  const now = new Date();
  const settings = await getSettings();
  
  // Custom Month calculation based on paydayDate
  let startMonth = now.getMonth();
  let startYear = now.getFullYear();
  if (now.getDate() < settings.paydayDate) {
    startMonth -= 1;
    if (startMonth < 0) {
      startMonth = 11;
      startYear -= 1;
    }
  }
  const startOfMonth = new Date(startYear, startMonth, settings.paydayDate);
  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(endOfMonth.getDate() - 1);
  endOfMonth.setHours(23, 59, 59, 999);

  // Custom Week calculation based on weekStartDay (0 = Sunday, 1 = Monday)
  const weekStart = startOfWeek(now, { weekStartsOn: settings.weekStartDay as any });
  const weekEnd = endOfWeek(now, { weekStartsOn: settings.weekStartDay as any });
  weekEnd.setHours(23, 59, 59, 999);

  // 1. Weekly total and by category
  const weeklyExpenses = await db.expense.groupBy({
    by: ['category'],
    where: {
      userId,
      expenseDate: { gte: weekStart, lte: weekEnd },
      type: "expense",
    },
    _sum: { amount: true },
    orderBy: { _sum: { amount: 'desc' } },
  });

  const weeklyTotal = weeklyExpenses.reduce(
    (sum, item) => sum + Number(item._sum.amount || 0),
    0
  );

  // 2. Recent transactions (last 5)
  const recentTransactions = await db.expense.findMany({
    where: { userId },
    orderBy: { expenseDate: 'desc' },
    take: 5,
  });

  // 3. Monthly total and by category
  const monthlyExpenses = await db.expense.groupBy({
    by: ['category'],
    where: {
      userId,
      expenseDate: { gte: startOfMonth, lte: endOfMonth },
      type: "expense",
    },
    _sum: { amount: true },
    orderBy: {
      _sum: { amount: 'desc' },
    },
  });

  const monthlyTotal = monthlyExpenses.reduce(
    (sum, item) => sum + Number(item._sum.amount || 0),
    0
  );

  return {
    weeklyTotal,
    weeklyByCategory: weeklyExpenses.map(item => ({
      category: item.category,
      total: Number(item._sum.amount || 0),
    })),
    monthlyTotal,
    monthlyByCategory: monthlyExpenses.map(item => ({
      category: item.category,
      total: Number(item._sum.amount || 0),
    })),
    recentTransactions: recentTransactions.map(t => ({
      ...t,
      amount: Number(t.amount),
    })),
    cycle: {
      monthStart: startOfMonth.toISOString(),
      monthEnd: endOfMonth.toISOString(),
      weekStart: weekStart.toISOString(),
      weekEnd: weekEnd.toISOString(),
    }
  };
}

export async function deleteExpense(id: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Ensure the user owns the expense
  await db.expense.delete({
    where: {
      id,
      userId: session.user.id,
    },
  });

  revalidatePath("/");
  revalidatePath("/history");
  return { success: true };
}

export async function updateExpense(id: string, data: {
  amount: number;
  category: string;
  description?: string;
  date?: string;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const expenseDate = data.date ? new Date(data.date) : new Date();

  await db.expense.update({
    where: {
      id,
      userId: session.user.id,
    },
    data: {
      amount: data.amount,
      category: data.category,
      description: data.description,
      expenseDate,
    },
  });

  revalidatePath("/");
  revalidatePath("/history");
  return { success: true };
}

export async function getExpensesByDateRange(startDateStr: string, endDateStr: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const userId = session.user.id;
  const startDate = new Date(startDateStr);
  const endDate = new Date(endDateStr);
  endDate.setHours(23, 59, 59, 999);

  const expenses = await db.expense.findMany({
    where: {
      userId,
      expenseDate: {
        gte: startDate,
        lte: endDate,
      },
      type: "expense",
    },
    orderBy: {
      expenseDate: 'desc',
    },
  });

  const total = expenses.reduce((sum, item) => sum + Number(item.amount), 0);

  const grouped = expenses.reduce((acc: any, item) => {
    acc[item.category] = (acc[item.category] || 0) + Number(item.amount);
    return acc;
  }, {});

  const byCategory = Object.keys(grouped).map(cat => ({
    category: cat,
    total: grouped[cat]
  })).sort((a, b) => b.total - a.total);

  return {
    expenses: expenses.map(t => ({
      ...t,
      amount: Number(t.amount),
    })),
    total,
    byCategory,
  };
}
