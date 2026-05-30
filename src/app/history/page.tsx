import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { HistoryClient } from "@/components/HistoryClient";
import { BottomNav } from "@/components/BottomNav";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <>
      <main className="h-full w-full relative z-10">
        <HistoryClient />
      </main>
      <BottomNav />
    </>
  );
}
