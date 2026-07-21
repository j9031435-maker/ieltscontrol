"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export interface CreateUserInput {
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface UpdateUserInput {
  name: string;
  role: Role;
  password?: string;
}

export async function createUser(data: CreateUserInput): Promise<{ error?: string } | void> {
  await requireAdmin();

  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) {
    return { error: "Bu email bilan foydalanuvchi allaqachon mavjud." };
  }

  const passwordHash = await bcrypt.hash(data.password, 10);
  await prisma.user.create({
    data: { name: data.name, email: data.email, passwordHash, role: data.role },
  });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function updateUser(
  userId: string,
  data: UpdateUserInput
): Promise<{ error?: string } | void> {
  const session = await requireAdmin();

  if (userId === session.user.id && data.role !== "ADMIN") {
    return { error: "O'zingizning admin darajangizni bu yerdan pasaytira olmaysiz." };
  }

  const updateData: { name: string; role: Role; passwordHash?: string } = {
    name: data.name,
    role: data.role,
  };
  if (data.password) {
    updateData.passwordHash = await bcrypt.hash(data.password, 10);
  }

  await prisma.user.update({ where: { id: userId }, data: updateData });

  revalidatePath("/admin/users");
  redirect("/admin/users");
}

export async function deleteUser(userId: string): Promise<{ error?: string } | void> {
  const session = await requireAdmin();
  if (userId === session.user.id) {
    return { error: "O'zingizni o'chira olmaysiz." };
  }
  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/users");
}
