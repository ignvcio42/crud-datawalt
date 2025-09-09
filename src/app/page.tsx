import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import AnnouncementForm from "@/components/AnnouncementForm";
import AnnouncementItem from "@/components/AnnouncementItem";

export const runtime = "nodejs";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [items, user] = await Promise.all([
    prisma.announcement.findMany({
      include: { author: { select: { id: true, name: true } } },
      orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
    }),
    getCurrentUser(),
  ]);

  return (
    <main className="space-y-6">
      <header className="flex items-end justify-between">
        <h1 className="text-3xl font-bold">Tablón de Anuncios</h1>
        {user ? (
          <span className="text-sm opacity-70">Conectado como {user.name}</span>
        ) : null}
      </header>

      {user ? (
        <AnnouncementForm />
      ) : (
        <p className="text-sm opacity-75">Inicia sesión para publicar.</p>
      )}

      <div className="space-y-4">
        {items.map((it) => (
          <AnnouncementItem
            key={it.id}
            item={{
              id: it.id,
              title: it.title,
              body: it.body,
              pinned: it.pinned,
              createdAt: it.createdAt.toISOString(),
            }}
            authorName={it.author?.name ?? "Anónimo"}
            owned={user?.id === it.authorId}
          />
        ))}
      </div>
    </main>
  );
}
