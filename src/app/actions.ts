"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser, setUserSession, clearSession } from "@/lib/auth";

export const runtime = "nodejs";

/* -------- Validaciones -------- */
const RegisterSchema = z.object({
  name: z.string().min(2, "Nombre muy corto"),
  email: z.string().email("Email inválido"),
  password: z.string().min(4, "Mínimo 4 caracteres"),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const CreateSchema = z.object({
  title: z.string().min(3, "Mínimo 3 caracteres").max(120, "Máximo 120"),
  body: z.string().min(1, "El contenido es obligatorio"),
});

const UpdateSchema = z.object({
  id: z.coerce.number().int(),
  title: z.string().min(3, "Mínimo 3 caracteres").max(120, "Máximo 120"),
  body: z.string().min(1, "El contenido es obligatorio"),
});

/* -------- AUTH -------- */
export async function register(fd: FormData) {
  const parsed = RegisterSchema.safeParse({
    name: fd.get("name"),
    email: fd.get("email"),
    password: fd.get("password"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

  const { name, email, password } = parsed.data;
  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists) return { ok: false, error: "Ese email ya está registrado" };

  const user = await prisma.user.create({ data: { name, email, password } });
  await setUserSession(user.id);
  revalidatePath("/");
  return { ok: true };
}

export async function login(fd: FormData) {
  const parsed = LoginSchema.safeParse({
    email: fd.get("email"),
    password: fd.get("password"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.password !== password) {
    return { ok: false, error: "Credenciales inválidas" };
  }

  await setUserSession(user.id);
  revalidatePath("/");
  return { ok: true };
}

export async function logout(_fd: FormData): Promise<void> { // 👈 firma compatible
  await clearSession();
  revalidatePath("/");
}

/* -------- CRUD -------- */
export async function createAnnouncement(fd: FormData) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión" };

  const parsed = CreateSchema.safeParse({
    title: fd.get("title"),
    body: fd.get("body"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

  const { title, body } = parsed.data;
  await prisma.announcement.create({ data: { title, body, authorId: user.id } });
  revalidatePath("/");
  return { ok: true };
}

export async function updateAnnouncement(fd: FormData) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión" };

  const parsed = UpdateSchema.safeParse({
    id: fd.get("id"),
    title: fd.get("title"),
    body: fd.get("body"),
  });
  if (!parsed.success) return { ok: false, fieldErrors: parsed.error.flatten().fieldErrors };

  const { id, title, body } = parsed.data;

  const owned = await prisma.announcement.findFirst({ where: { id, authorId: user.id } });
  if (!owned) return { ok: false, error: "No autorizado" };

  await prisma.announcement.update({ where: { id }, data: { title, body } });
  revalidatePath("/");
  return { ok: true };
}

export async function deleteAnnouncement(id: number) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión" };

  const owned = await prisma.announcement.findFirst({ where: { id, authorId: user.id } });
  if (!owned) return { ok: false, error: "No autorizado" };

  await prisma.announcement.delete({ where: { id } });
  revalidatePath("/");
  return { ok: true };
}

export async function togglePin(id: number) {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Debes iniciar sesión" };

  const item = await prisma.announcement.findUnique({ where: { id } });
  if (!item) return { ok: false, error: "No existe" };

  await prisma.announcement.update({ where: { id }, data: { pinned: !item.pinned } });
  revalidatePath("/");
  return { ok: true };
}
