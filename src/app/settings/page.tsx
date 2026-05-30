import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { SettingsClient } from "@/components/SettingsClient";
import { getSettings } from "@/app/actions/settingsActions";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect("/login");
  }

  const settings = await getSettings();

  return (
    <main className="h-full w-full pb-16 relative z-10">
      <SettingsClient user={session.user} initialSettings={settings} />
    </main>
  );
}
