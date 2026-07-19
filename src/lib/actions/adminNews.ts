"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/adminAuth";

export interface NewsPostInput {
  title: string;
  body: string;
}

export async function createNewsPost(data: NewsPostInput) {
  await requireAdmin();
  await prisma.newsPost.create({ data });
  revalidatePath("/admin/news");
  revalidatePath("/news");
  redirect("/admin/news");
}

export async function updateNewsPost(id: string, data: NewsPostInput) {
  await requireAdmin();
  await prisma.newsPost.update({ where: { id }, data });
  revalidatePath("/admin/news");
  revalidatePath("/news");
  redirect("/admin/news");
}

export async function deleteNewsPost(id: string) {
  await requireAdmin();
  await prisma.newsPost.delete({ where: { id } });
  revalidatePath("/admin/news");
  revalidatePath("/news");
}
