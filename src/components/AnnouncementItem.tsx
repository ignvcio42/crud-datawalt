"use client";

import { useState, useTransition } from "react";
import { deleteAnnouncement, togglePin } from "@/app/actions";
import AnnouncementForm from "./AnnouncementForm";

type Item = {
  id: number;
  title: string;
  body: string;
  pinned: boolean;
  createdAt: string;
};

export default function AnnouncementItem({
  item,
  authorName,
  owned,
}: {
  item: Item;
  authorName: string;
  owned: boolean;
}) {
  const [edit, setEdit] = useState(false);
  const [isPending, start] = useTransition();

  return (
    <div className="border rounded-2xl p-4 space-y-2">
      {edit ? (
        <AnnouncementForm
          mode="edit"
          initial={{ id: item.id, title: item.title, body: item.body }}
          onSuccess={() => setEdit(false)}
        />
      ) : (
        <>
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">
              {item.title} {item.pinned && <span>📌</span>}
            </h3>
            <small className="text-gray-500">{new Date(item.createdAt).toLocaleString()}</small>
          </div>
          <p className="text-sm opacity-70">por {authorName}</p>
          <p className="whitespace-pre-wrap">{item.body}</p>

          {owned && (
            <div className="flex gap-2">
              <button onClick={() => setEdit((v) => !v)} className="px-3 py-1.5 border rounded-2xl">
                {edit ? "Cancelar" : "Editar"}
              </button>
              <button
                onClick={() => start(async () => { await togglePin(item.id); })}
                className="px-3 py-1.5 border rounded-2xl"
                disabled={isPending}
              >
                {item.pinned ? "Desfijar" : "Fijar"}
              </button>
              <button
                onClick={() => start(async () => { await deleteAnnouncement(item.id); })}
                className="px-3 py-1.5 border rounded-2xl text-red-600"
                disabled={isPending}
              >
                Eliminar
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
