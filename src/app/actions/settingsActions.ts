"use server";

import { db } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";

export async function getSettings() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
    select: { preferences: true },
  });

  const defaultPreferences = {
    paydayDate: 1,
    weekStartDay: 1, // 1 = Monday
  };

  if (!user?.preferences) {
    return defaultPreferences;
  }

  return {
    ...defaultPreferences,
    ...(user.preferences as any),
  };
}

export async function updateSettings(data: { paydayDate?: number; weekStartDay?: number }) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { preferences: true },
  });

  const currentPrefs = currentUser?.preferences ? (currentUser.preferences as any) : {};

  const updatedPrefs = {
    ...currentPrefs,
    ...data,
  };

  await db.user.update({
    where: { id: session.user.id },
    data: {
      preferences: updatedPrefs,
    },
  });

  revalidatePath("/");
  revalidatePath("/history");
  revalidatePath("/settings");
  
  return { success: true };
}

export async function changePassword(oldPassword: string, newPassword: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const user = await db.user.findUnique({
    where: { id: session.user.id },
  });

  if (!user || !user.password) {
    throw new Error("User not found or no password set");
  }

  const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
  
  if (!isPasswordValid) {
    throw new Error("Password lama tidak sesuai");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await db.user.update({
    where: { id: session.user.id },
    data: {
      password: hashedPassword,
    },
  });

  return { success: true };
}
