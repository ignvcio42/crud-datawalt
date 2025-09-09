import { prisma } from "@/lib/prisma";
import AnnouncementForm from "@/components/AnnouncementForm";
import AnnouncementItem from "@/components/AnnouncementItem";

export const dynamic = "force-dynamic";

export default async function Home() {
  const items = await prisma.announcement.findMany({
    orderBy: [{ pinned: "desc" }, { createdAt: "desc" }],
  });

  return (
    <main className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Tablón de Anuncios</h1>
      <AnnouncementForm />

      <div className="space-y-4">
        {items.map((it) => (
          <AnnouncementItem
            key={it.id}
            item={{
              ...it,
              createdAt: it.createdAt.toISOString(),
            }}
          />
        ))}
      </div>
    </main>
  );
}
