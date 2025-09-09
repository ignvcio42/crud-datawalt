
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { logout } from "@/app/actions";

export const runtime = "nodejs";

export default async function Navbar() {
  const user = await getCurrentUser();
  

  return (
    <nav className="border-b sticky top-0 z-10 bg-background/80 backdrop-blur">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        <Link href="/" className="font-semibold">Tablón Datawalt</Link>
        <div className="flex items-center gap-3">
          {!user ? (
            <>
              <Link href="/login" className="px-3 py-1.5 rounded border">Login</Link>
              <Link href="/register" className="px-3 py-1.5 rounded bg-black text-white">Registro</Link>
            </>
          ) : (
            <form action={logout} className="flex items-center gap-2">
              <span className="text-sm opacity-80">Hola, {user.name}</span>
              <button className="px-3 py-1.5 rounded border">Salir</button>
            </form>
          )}
        </div>
      </div>
    </nav>
  );
}
