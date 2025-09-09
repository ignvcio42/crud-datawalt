"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const CreateSchema = z.object({
  title: z.string().min(3, "Mínimo 3 caracteres").max(120, "Máximo 120"),
  body: z.string().min(1, "El contenido es obligatorio"),
});

export async function createAnnouncement(formData: FormData) {
  const parsed = CreateSchema.safeParse({
    title: formData.get("title"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();
    return { ok: false, fieldErrors };
  }

  const { title, body } = parsed.data;
  await prisma.announcement.create({ data: { title, body } });

  revalidatePath("/");
  return { ok: true };
}

export async function deleteAnnouncement(id: number) {
  await prisma.announcement.delete({ where: { id } });
  revalidatePath("/");
  return { ok: true };
}

export async function togglePin(id: number) {
  const item = await prisma.announcement.findUnique({ where: { id } });
  if (!item) return { ok: false, error: "No existe" };

  await prisma.announcement.update({
    where: { id },
    data: { pinned: !item.pinned },
  });

  revalidatePath("/");
  return { ok: true };
}

const UpdateSchema = z.object({
  id: z.number().int(),
  title: z.string().min(3, "Mínimo 3 caracteres").max(120, "Máximo 120"),
  body: z.string().min(1, "El contenido es obligatorio"),
});

export async function updateAnnouncement(formData: FormData) {
  const parsed = UpdateSchema.safeParse({
    id: Number(formData.get("id")),
    title: formData.get("title"),
    body: formData.get("body"),
  });

  if (!parsed.success) {
    const { fieldErrors } = parsed.error.flatten();
    return { ok: false, fieldErrors };
  }

  const { id, title, body } = parsed.data;
  await prisma.announcement.update({
    where: { id },
    data: { title, body },
  });

  revalidatePath("/");
  return { ok: true, id };
}
