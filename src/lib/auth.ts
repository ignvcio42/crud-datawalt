import { cookies } from "next/headers";
import { prisma } from "./prisma";

const COOKIE = "uid";
export const runtime = "nodejs";


/** Devuelve el usuario actual (o null) leyendo la cookie uid */
export async function getCurrentUser() {
  const cookieStore = await cookies(); 
  const raw = cookieStore.get(COOKIE)?.value;
  if (!raw) return null;
  const id = Number(raw);
  if (!Number.isInteger(id)) return null;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true },
  });
  return user ?? null;
}

/** Guarda cookie de sesión con el id del usuario (demo) */
export async function setUserSession(userId: number) {
  const cookieStore = await cookies(); 
  cookieStore.set(COOKIE, String(userId), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

/** Elimina la cookie de sesión */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE);
}
