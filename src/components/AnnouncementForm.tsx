"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createAnnouncement, updateAnnouncement } from "@/app/actions";

export const runtime = "nodejs";

type ActionResult = {
  ok: boolean;
  fieldErrors?: { title?: string[]; body?: string[]; id?: string[] };
  error?: string;
} | undefined;

type Props = {
  mode?: "create" | "edit";
  initial?: { id: number; title: string; body: string } | null;
  onSuccess?: () => void;
};

export default function AnnouncementForm({ mode = "create", initial = null, onSuccess }: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  async function action(_prev: ActionResult, fd: FormData): Promise<ActionResult> {
    return mode === "edit" ? updateAnnouncement(fd) : createAnnouncement(fd);
  }

  const [state, formAction, pending] = useActionState<ActionResult, FormData>(action, undefined);

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
      if (mode === "create") formRef.current?.reset();
      if (mode === "edit" && onSuccess) onSuccess();
    }
  }, [state?.ok, mode, onSuccess, router]);

  return (
    <form ref={formRef} action={formAction} className="border rounded-2xl p-4 space-y-3">
      {mode === "edit" && <input type="hidden" name="id" defaultValue={initial?.id} />}

      <div className="space-y-1">
        <input
          name="title"
          placeholder="Título"
          defaultValue={initial?.title ?? ""}
          className="w-full border rounded-2xl px-3 py-2"
          required
        />
        {!!state?.fieldErrors?.title?.length && (
          <p className="text-sm text-red-600">{state.fieldErrors.title[0]}</p>
        )}
      </div>

      <div className="space-y-1">
        <textarea
          name="body"
          placeholder="Contenido..."
          defaultValue={initial?.body ?? ""}
          className="w-full border rounded-2xl px-3 py-2 h-28"
          required
        />
        {!!state?.fieldErrors?.body?.length && (
          <p className="text-sm text-red-600">{state.fieldErrors.body[0]}</p>
        )}
      </div>

      {!state?.ok && state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <button type="submit" disabled={pending} className="px-4 py-2 rounded bg-black text-white disabled:opacity-50">
        {pending ? "Guardando..." : mode === "edit" ? "Actualizar" : "Publicar"}
      </button>
    </form>
  );
}
