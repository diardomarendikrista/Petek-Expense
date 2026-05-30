"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MicButton } from "./MicButton";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { parseExpense, ParsedExpense } from "@/app/actions/parseExpense";
import { saveExpense, updateExpense, deleteExpense } from "@/app/actions/expenseActions";
import { ExpenseConfirmation } from "./ExpenseConfirmation";
import { ExpenseFormDrawer } from "./ExpenseFormDrawer";
import { ConfirmModal } from "./ConfirmModal";
import { AlertModal } from "./AlertModal";
import { Card, CardHeader, CardTitle } from "./Card";
import { Button } from "./ui/button";
import { Plus, Settings } from "lucide-react";

interface DashboardClientProps {
  weeklyTotal: number;
  weeklyByCategory: any[];
  monthlyTotal: number;
  monthlyByCategory: any[];
  recentTransactions: any[];
}

export function DashboardClient({
  weeklyTotal,
  weeklyByCategory,
  monthlyTotal,
  monthlyByCategory,
  recentTransactions,
}: DashboardClientProps) {
  const router = useRouter();
  const { isRecording, startRecording, stopRecording, transcript, isSupported } =
    useSpeechRecognition({ lang: "id-ID" });

  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedExpense | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);
  const [activeTab, setActiveTab] = useState<"week" | "month">("month");
  const [alertConfig, setAlertConfig] = useState<{title: string, desc: string, isError?: boolean} | null>(null);

  const currentTotal = activeTab === "month" ? monthlyTotal : weeklyTotal;
  const currentCategories = activeTab === "month" ? monthlyByCategory : weeklyByCategory;

  const handleMicClick = () => {
    if (!isSupported) {
      setAlertConfig({
        title: "Fitur Tidak Didukung",
        desc: "Browser Anda tidak mendukung fitur rekam suara (Web Speech API). Silakan gunakan Chrome/Edge/Safari terbaru, atau gunakan input manual.",
        isError: true,
      });
      return;
    }

    if (isRecording) {
      stopRecording();
      processTranscript(transcript);
    } else {
      startRecording();
    }
  };

  const processTranscript = async (text: string) => {
    if (!text.trim()) return;
    setIsProcessing(true);
    try {
      const result = await parseExpense(text);
      setParsedData(result);
      setIsConfirmationOpen(true);
    } catch (error) {
      console.error("Failed to parse", error);
      setAlertConfig({ title: "Terjadi Kesalahan", desc: "Gagal memproses suara. Silakan coba lagi atau input manual.", isError: true });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveExpense = async (data: any) => {
    setIsSaving(true);
    try {
      if (selectedExpense) {
        await updateExpense(selectedExpense.id, data);
      } else {
        await saveExpense(data);
      }
      setIsConfirmationOpen(false);
      setIsManualOpen(false);
      setParsedData(null);
      setSelectedExpense(null);
    } catch (error) {
      console.error("Failed to save", error);
      setAlertConfig({ title: "Terjadi Kesalahan", desc: "Gagal menyimpan transaksi.", isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  const handleEditClick = (expense: any) => {
    // format date back to yyyy-mm-dd for the input
    const dateStr = expense.expenseDate ? new Date(expense.expenseDate).toISOString().split('T')[0] : undefined;
    setSelectedExpense({
      ...expense,
      date: dateStr
    });
    setIsManualOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setExpenseToDelete(id);
    setIsDeleteModalOpen(true);
    setIsManualOpen(false);
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;
    setIsSaving(true);
    try {
      await deleteExpense(expenseToDelete);
      setIsDeleteModalOpen(false);
      setExpenseToDelete(null);
      setSelectedExpense(null);
    } catch (error) {
      console.error("Failed to delete", error);
      setAlertConfig({ title: "Terjadi Kesalahan", desc: "Gagal menghapus transaksi.", isError: true });
    } finally {
      setIsSaving(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar pb-24">
      {/* Header */}
      <header className="flex items-center justify-between p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Petek Expense</h1>
        </div>
        <Button variant="ghost" size="icon" className="rounded-full" onClick={() => router.push('/settings')}>
          <Settings className="h-6 w-6" />
        </Button>
      </header>

      {/* Main Stats */}
      <div className="px-6 pb-6 pt-4">
        <p className="text-sm font-medium text-muted-foreground mb-1">
          Total {activeTab === "month" ? "Bulan" : "Minggu"} Ini
        </p>
        <p className="text-5xl font-bold tracking-tighter">
          {formatCurrency(currentTotal)}
        </p>
      </div>

      {/* Mic Button Area */}
      <div className="flex flex-col items-center justify-center py-8">
        <MicButton isRecording={isRecording} onClick={handleMicClick} />
        <p className="mt-6 text-sm text-muted-foreground font-medium h-6">
          {isRecording ? "Mendengarkan..." : isProcessing ? "Memproses..." : "Tap untuk merekam"}
        </p>
        {isRecording && transcript && (
          <p className="mt-2 text-center text-xs text-muted-foreground max-w-[80%] italic">
            "{transcript}"
          </p>
        )}
      </div>

      {/* Content Tabs / Summaries */}
      <div className="flex-1 px-6 space-y-6 rounded-t-3xl bg-card pt-8 pb-12 shadow-inner min-h-[50vh]">
        
        {/* Recent Transactions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Transaksi Terakhir</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedExpense(null);
                setIsManualOpen(true);
              }}
              className="text-brand-500 font-medium"
            >
              <Plus className="h-4 w-4 mr-1" />
              Manual
            </Button>
          </div>
          
          <div className="space-y-3">
            {recentTransactions.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">
                Belum ada transaksi
              </p>
            ) : (
              recentTransactions.map((tx) => (
                <div 
                  key={tx.id} 
                  className="flex items-center justify-between p-3 rounded-2xl bg-background border border-border cursor-pointer active:scale-[0.98] transition-transform"
                  onClick={() => handleEditClick(tx)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-brand-600">
                      <span className="font-bold text-xs">{tx.category.substring(0,2).toUpperCase()}</span>
                    </div>
                    <div>
                      <p className="font-medium text-sm leading-none mb-1">{tx.category}</p>
                      <p className="text-xs text-muted-foreground">{tx.description || "Pengeluaran"}</p>
                    </div>
                  </div>
                  <p className="font-bold text-sm">
                    {formatCurrency(tx.amount)}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Summary Card with Tabs */}
        <div className="pt-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Ringkasan</h2>
            
            <div className="flex bg-muted p-1 rounded-lg">
              <button
                onClick={() => setActiveTab("week")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === "week" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Minggu Ini
              </button>
              <button
                onClick={() => setActiveTab("month")}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                  activeTab === "month" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Bulan Ini
              </button>
            </div>
          </div>
          
          <Card className="bg-gradient-to-br from-brand-600 to-brand-900 border-none text-white">
            <div className="p-4">
              <p className="text-white/80 text-sm mb-1">Total {activeTab === "month" ? "Bulan" : "Minggu"} Ini</p>
              <p className="text-3xl font-bold mb-4">{formatCurrency(currentTotal)}</p>
              
              {currentCategories.length > 0 ? (
                <div className="space-y-2 mt-4 pt-4 border-t border-white/10">
                  {(showAllCategories ? currentCategories : currentCategories.slice(0, 3)).map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center text-sm">
                      <span className="text-white/90">{item.category}</span>
                      <span className="font-semibold">{formatCurrency(item.total)}</span>
                    </div>
                  ))}
                  
                  {currentCategories.length > 3 && (
                    <button 
                      onClick={() => setShowAllCategories(!showAllCategories)}
                      className="w-full text-xs text-white/60 hover:text-white/90 transition-colors text-center mt-2 pt-1 pb-1 font-medium"
                    >
                      {showAllCategories ? "Sembunyikan" : `+${currentCategories.length - 3} kategori lainnya`}
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-white/60 text-sm mt-4 pt-4 border-t border-white/10">Belum ada pengeluaran</p>
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Drawers */}
      <ExpenseConfirmation
        isOpen={isConfirmationOpen}
        onClose={() => setIsConfirmationOpen(false)}
        parsedData={parsedData}
        onConfirm={handleSaveExpense}
        isLoading={isSaving}
      />

      <ExpenseFormDrawer
        isOpen={isManualOpen}
        onClose={() => {
          setIsManualOpen(false);
          setSelectedExpense(null);
        }}
        onSave={handleSaveExpense}
        onDelete={handleDeleteClick}
        isLoading={isSaving}
        initialData={selectedExpense}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmDelete}
        title="Hapus Transaksi?"
        description="Apakah Anda yakin ingin menghapus transaksi ini? Data yang dihapus tidak dapat dikembalikan."
        confirmText="Hapus"
        isDestructive={true}
        isLoading={isSaving}
      />

      <AlertModal
        isOpen={!!alertConfig}
        onClose={() => setAlertConfig(null)}
        title={alertConfig?.title || ""}
        description={alertConfig?.desc || ""}
        isError={alertConfig?.isError}
      />
    </div>
  );
}
