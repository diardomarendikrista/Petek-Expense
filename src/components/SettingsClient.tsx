"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { updateSettings, changePassword } from "@/app/actions/settingsActions";
import { signOut } from "next-auth/react";

interface SettingsClientProps {
  user: any;
  initialSettings: any;
}

export function SettingsClient({ user, initialSettings }: SettingsClientProps) {
  const router = useRouter();
  
  const [paydayDate, setPaydayDate] = useState(initialSettings.paydayDate || 1);
  const [weekStartDay, setWeekStartDay] = useState(initialSettings.weekStartDay || 1);
  
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [isSavingPrefs, setIsSavingPrefs] = useState(false);
  const [isSavingPwd, setIsSavingPwd] = useState(false);
  
  const [prefsMessage, setPrefsMessage] = useState("");
  const [pwdMessage, setPwdMessage] = useState("");

  const handleSavePreferences = async () => {
    setIsSavingPrefs(true);
    setPrefsMessage("");
    try {
      await updateSettings({ paydayDate: Number(paydayDate), weekStartDay: Number(weekStartDay) });
      setPrefsMessage("Pengaturan berhasil disimpan.");
      setTimeout(() => setPrefsMessage(""), 3000);
    } catch (e) {
      setPrefsMessage("Gagal menyimpan pengaturan.");
    } finally {
      setIsSavingPrefs(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwdMessage("");
    
    if (newPassword !== confirmPassword) {
      setPwdMessage("Password baru tidak cocok.");
      return;
    }
    
    if (newPassword.length < 6) {
      setPwdMessage("Password baru minimal 6 karakter.");
      return;
    }

    setIsSavingPwd(true);
    try {
      await changePassword(oldPassword, newPassword);
      setPwdMessage("Password berhasil diubah!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPwdMessage(""), 3000);
    } catch (e: any) {
      setPwdMessage(e.message || "Gagal mengubah password.");
    } finally {
      setIsSavingPwd(false);
    }
  };

  const handleLogout = async () => {
    if (confirm("Apakah Anda yakin ingin keluar?")) {
      await signOut({ callbackUrl: "/login" });
    }
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar">
      {/* Header */}
      <header className="flex items-center p-6 border-b border-border bg-card">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2 -ml-2 rounded-full"
          onClick={() => router.push("/")}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold tracking-tight">Pengaturan</h1>
      </header>

      <div className="p-6 space-y-8">
        
        {/* Profil Section */}
        <section>
          <h2 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">Profil</h2>
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-1">
            <p className="font-semibold text-lg">{user.name}</p>
            <p className="text-muted-foreground text-sm">{user.email}</p>
          </div>
        </section>

        {/* Siklus Keuangan Section */}
        <section>
          <h2 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">Siklus Keuangan</h2>
          <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-4">
            
            <div>
              <label className="mb-2 block text-sm font-medium">Tanggal Gajian (Bulan Baru)</label>
              <div className="flex items-center gap-2">
                <select 
                  value={paydayDate}
                  onChange={(e) => setPaydayDate(e.target.value)}
                  className="flex h-12 flex-1 rounded-xl border border-border bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%23a1a1aa'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                >
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                    <option key={day} value={day} className="bg-background text-foreground">
                      Tanggal {day}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs text-muted-foreground mt-2">Ringkasan bulanan akan dihitung mulai tanggal ini.</p>
            </div>

            <div className="pt-2 border-t border-border">
              <label className="mb-2 block text-sm font-medium mt-2">Awal Minggu</label>
              <div className="flex items-center gap-2">
                <select 
                  value={weekStartDay}
                  onChange={(e) => setWeekStartDay(e.target.value)}
                  className="flex h-12 flex-1 rounded-xl border border-border bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%23a1a1aa'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
                >
                  <option value={0} className="bg-background text-foreground">Minggu</option>
                  <option value={1} className="bg-background text-foreground">Senin</option>
                  <option value={6} className="bg-background text-foreground">Sabtu</option>
                </select>
              </div>
            </div>

            <Button onClick={handleSavePreferences} disabled={isSavingPrefs} className="mt-2 w-full">
              {isSavingPrefs ? "Menyimpan..." : "Simpan Preferensi"}
            </Button>
            {prefsMessage && (
              <p className="text-sm text-center text-brand-500 font-medium">{prefsMessage}</p>
            )}
          </div>
        </section>

        {/* Keamanan Section */}
        <section>
          <h2 className="text-sm font-bold text-muted-foreground mb-4 uppercase tracking-wider">Keamanan</h2>
          <div className="bg-card border border-border rounded-2xl p-4">
            <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium">Password Lama</label>
                <Input 
                  type="password" 
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Password Baru</label>
                <Input 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Konfirmasi Password</label>
                <Input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              
              <Button type="submit" disabled={isSavingPwd} variant="outline" className="mt-2 w-full">
                {isSavingPwd ? "Mengubah..." : "Ubah Password"}
              </Button>
              {pwdMessage && (
                <p className={`text-sm text-center font-medium ${pwdMessage.includes("berhasil") ? "text-green-500" : "text-red-500"}`}>
                  {pwdMessage}
                </p>
              )}
            </form>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="pt-4 pb-8">
          <Button variant="destructive" onClick={handleLogout} className="w-full h-14 rounded-2xl text-base font-bold shadow-lg">
            Keluar Akun (Logout)
          </Button>
        </section>

      </div>
    </div>
  );
}
