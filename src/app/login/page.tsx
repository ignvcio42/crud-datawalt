"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { login } from "@/app/actions";


export const runtime = "nodejs";

type Result = { ok: boolean; error?: string; fieldErrors?: Record<string, string[]> } | undefined;

export default function LoginPage() {
  const router = useRouter();

  async function act(_prev: Result, fd: FormData): Promise<Result> {
    const res = await login(fd);
    if (res.ok) router.push("/");
    return res;
  }
  const [state, formAction, pending] = useActionState<Result, FormData>(act, undefined);

  return (
    <main className="max-w-md mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Iniciar sesión</h1>
      <form action={formAction} className="border rounded-2xl p-4 space-y-3">
        <div>
          <input name="email" type="email" placeholder="Email" className="w-full border rounded-2xl px-3 py-2" required />
          {!!state?.fieldErrors?.email && <p className="text-sm text-red-600">{state.fieldErrors.email[0]}</p>}
        </div>
        <div>
          <input name="password" type="password" placeholder="Contraseña" className="w-full border rounded-2xl px-3 py-2" required />
        </div>
        {!!state?.error && <p className="text-sm text-red-600">{state.error}</p>}
        <button disabled={pending} className="px-4 py-2 rounded bg-black text-white w-full">
          {pending ? "Entrando..." : "Entrar"}
        </button>
      </form>
    </main>
  );
}
