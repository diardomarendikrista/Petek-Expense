import { getDashboardData } from "@/app/actions/expenseActions";
import { DashboardClient } from "@/components/DashboardClient";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { BottomNav } from "@/components/BottomNav";

export const dynamic = "force-dynamic";

export default async function Home() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const data = await getDashboardData();

  return (
    <>
      <main className="h-full w-full relative z-10">
        <DashboardClient
          weeklyTotal={data.weeklyTotal}
          weeklyByCategory={data.weeklyByCategory}
          monthlyTotal={data.monthlyTotal}
          monthlyByCategory={data.monthlyByCategory}
          recentTransactions={data.recentTransactions}
        />
      </main>
      <BottomNav />
    </>
  );
}
