"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { createAnnouncement, updateAnnouncement } from "@/app/actions";

type Props = {
  mode?: "create" | "edit";
  initial?: { id: number; title: string; body: string } | null;
  onSuccess?: () => void;
};

type ActionResult = {
  ok: boolean;
  fieldErrors?: {
    title?: string[];
    body?: string[];
    id?: string[];
  };
  error?: string;
  id?: number;
} | undefined;

export default function AnnouncementForm({
  mode = "create",
  initial = null,
  onSuccess,
}: Props) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  async function action(prevState: ActionResult, formData: FormData): Promise<ActionResult> {
    if (mode === "edit") {
      return await updateAnnouncement(formData);
    }
    return await createAnnouncement(formData);
  }

  const [state, formAction, isPending] = useActionState<ActionResult, FormData>(action, undefined);

  useEffect(() => {
    if (state?.ok) {
      router.refresh();
      if (mode === "create") formRef.current?.reset();
      if (mode === "edit" && onSuccess) onSuccess();
    }
  }, [state?.ok, mode, onSuccess, router]);

  return (
    <form ref={formRef} action={formAction} className="space-y-2 border rounded-lg p-4">
      {mode === "edit" && <input type="hidden" name="id" defaultValue={initial?.id} />}

      <div className="space-y-1">
        <input
          name="title"
          placeholder="Título"
          defaultValue={initial?.title}
          className="w-full border rounded px-3 py-2"
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
          defaultValue={initial?.body}
          className="w-full border rounded px-3 py-2 h-24"
          required
        />
        {!!state?.fieldErrors?.body?.length && (
          <p className="text-sm text-red-600">{state.fieldErrors.body[0]}</p>
        )}
      </div>

      {!state?.ok && state?.error && (
        <p className="text-sm text-red-600">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="px-4 py-2 rounded bg-black text-white disabled:opacity-50"
      >
        {isPending ? "Guardando..." : mode === "edit" ? "Actualizar" : "Publicar"}
      </button>
    </form>
  );
}
