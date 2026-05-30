"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { DateRange } from "react-day-picker";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import { Calendar, Settings } from "lucide-react";
import { Button } from "./ui/button";
import { Card } from "./Card";
import { DateRangeDrawer } from "./DateRangeDrawer";
import { ExpenseFormDrawer } from "./ExpenseFormDrawer";
import { ConfirmModal } from "./ConfirmModal";
import {
  getExpensesByDateRange,
  updateExpense,
  deleteExpense,
} from "@/app/actions/expenseActions";

export function HistoryClient() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<DateRange | undefined>(() => {
    const now = new Date();
    return {
      from: new Date(now.getFullYear(), now.getMonth(), 1),
      to: new Date(now.getFullYear(), now.getMonth() + 1, 0),
    };
  });

  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState<any>({
    expenses: [],
    total: 0,
    byCategory: [],
  });

  const [isDateDrawerOpen, setIsDateDrawerOpen] = useState(false);
  const [isEditDrawerOpen, setIsEditDrawerOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<string | null>(null);
  const [showAllCategories, setShowAllCategories] = useState(false);

  const fetchData = async (range: DateRange | undefined) => {
    setIsLoading(true);
    try {
      // Default to far past and future if no range is selected
      const fromStr = range?.from
        ? range.from.toISOString()
        : new Date("2000-01-01").toISOString();
      const toStr = range?.to
        ? range.to.toISOString()
        : new Date("2100-01-01").toISOString();

      const result = await getExpensesByDateRange(fromStr, toStr);
      setData(result);
    } catch (error) {
      console.error("Failed to fetch history", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(dateRange);
  }, [dateRange]);

  const handleApplyDateRange = (range: DateRange | undefined) => {
    setDateRange(range);
  };

  const handleEditClick = (expense: any) => {
    const dateStr = expense.expenseDate
      ? new Date(expense.expenseDate).toISOString().split("T")[0]
      : undefined;
    setSelectedExpense({
      ...expense,
      date: dateStr,
    });
    setIsEditDrawerOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setExpenseToDelete(id);
    setIsDeleteModalOpen(true);
    setIsEditDrawerOpen(false);
  };

  const handleSaveExpense = async (formData: any) => {
    if (!selectedExpense) return;
    setIsSaving(true);
    try {
      await updateExpense(selectedExpense.id, formData);
      setIsEditDrawerOpen(false);
      setSelectedExpense(null);
      fetchData(dateRange);
    } catch (error) {
      console.error("Failed to update", error);
      alert("Gagal menyimpan transaksi.");
    } finally {
      setIsSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!expenseToDelete) return;
    setIsSaving(true);
    try {
      await deleteExpense(expenseToDelete);
      setIsDeleteModalOpen(false);
      setExpenseToDelete(null);
      setSelectedExpense(null);
      fetchData(dateRange);
    } catch (error) {
      console.error("Failed to delete", error);
      alert("Gagal menghapus transaksi.");
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

  const getDateLabel = () => {
    if (!dateRange?.from) return "Semua Waktu";
    const fromStr = format(dateRange.from, "d MMM yyyy", { locale: localeId });
    if (!dateRange.to) return fromStr;
    const toStr = format(dateRange.to, "d MMM yyyy", { locale: localeId });
    return `${fromStr} - ${toStr}`;
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto no-scrollbar pb-24">
      <header className="flex items-center justify-between p-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Riwayat</h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => router.push("/settings")}
        >
          <Settings className="h-6 w-6" />
        </Button>
      </header>

      <div className="px-6 pb-6 space-y-6">
        <Button
          variant="outline"
          className="w-full flex items-center justify-between font-normal bg-card"
          onClick={() => setIsDateDrawerOpen(true)}
        >
          <span className="flex items-center text-muted-foreground">
            <Calendar className="mr-2 h-4 w-4" />
            {getDateLabel()}
          </span>
          <span className="text-xs font-bold text-brand-500">UBAH</span>
        </Button>

        <Card className="bg-gradient-to-br from-brand-600 to-brand-900 border-none text-white">
          <div className="p-4">
            <p className="text-white/80 text-sm mb-1">Total Pengeluaran</p>
            {isLoading ? (
              <div className="h-9 w-48 bg-white/20 animate-pulse rounded-md mb-4" />
            ) : (
              <p className="text-3xl font-bold mb-4">
                {formatCurrency(data.total)}
              </p>
            )}

            {isLoading ? (
              <div className="space-y-3 mt-4 pt-4 border-t border-white/10">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="h-5 w-24 bg-white/20 animate-pulse rounded-md" />
                    <div className="h-5 w-20 bg-white/20 animate-pulse rounded-md" />
                  </div>
                ))}
                <div className="flex justify-center mt-3 pt-2">
                  <div className="h-4 w-32 bg-white/20 animate-pulse rounded-md" />
                </div>
              </div>
            ) : data.byCategory.length > 0 && (
              <div className="space-y-2 mt-4 pt-4 border-t border-white/10">
                {(showAllCategories
                  ? data.byCategory
                  : data.byCategory.slice(0, 3)
                ).map((item: any, idx: number) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-sm"
                  >
                    <span className="text-white/90">{item.category}</span>
                    <span className="font-semibold">
                      {formatCurrency(item.total)}
                    </span>
                  </div>
                ))}
                {data.byCategory.length > 3 && (
                  <button
                    onClick={() => setShowAllCategories(!showAllCategories)}
                    className="w-full text-xs text-white/60 hover:text-white/90 transition-colors text-center mt-2 pt-1 pb-1 font-medium"
                  >
                    {showAllCategories
                      ? "Sembunyikan"
                      : `+${data.byCategory.length - 3} kategori lainnya`}
                  </button>
                )}
              </div>
            )}
          </div>
        </Card>

        <div>
          <h2 className="text-lg font-semibold mb-4">Daftar Transaksi</h2>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted animate-pulse" />
                    <div className="space-y-2">
                      <div className="h-4 w-24 bg-muted animate-pulse rounded-md" />
                      <div className="h-3 w-16 bg-muted animate-pulse rounded-md" />
                    </div>
                  </div>
                  <div className="h-5 w-20 bg-muted animate-pulse rounded-md" />
                </div>
              ))}
            </div>
          ) : data.expenses.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">
              Tidak ada transaksi pada rentang waktu ini.
            </p>
          ) : (
            <div className="space-y-3">
              {data.expenses.map((tx: any) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 rounded-2xl bg-card border border-border cursor-pointer active:scale-[0.98] transition-transform shadow-sm"
                  onClick={() => handleEditClick(tx)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500/10 text-brand-600">
                      <span className="font-bold text-xs">
                        {tx.category.substring(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm leading-none mb-1">
                        {tx.category}
                      </p>
                      <div className="flex gap-2 items-center">
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(tx.expenseDate), "d MMM", {
                            locale: localeId,
                          })}
                        </span>
                        {tx.description && (
                          <>
                            <span className="text-xs text-muted-foreground">
                              •
                            </span>
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {tx.description}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="font-bold text-sm">
                    {formatCurrency(tx.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <DateRangeDrawer
        isOpen={isDateDrawerOpen}
        onClose={() => setIsDateDrawerOpen(false)}
        onApply={handleApplyDateRange}
        initialRange={dateRange}
      />

      <ExpenseFormDrawer
        isOpen={isEditDrawerOpen}
        onClose={() => {
          setIsEditDrawerOpen(false);
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
    </div>
  );
}
