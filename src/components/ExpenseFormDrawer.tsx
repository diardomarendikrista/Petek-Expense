"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Drawer } from "./ui/drawer";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { EXPENSE_CATEGORIES, GROUPED_CATEGORIES } from "@/lib/categories";

const expenseFormSchema = z.object({
  id: z.string().optional(),
  amount: z.number().min(1, "Jumlah harus lebih dari 0"),
  category: z.string().min(1, "Kategori tidak boleh kosong"),
  description: z.string().optional(),
  date: z.string().min(1, "Tanggal tidak boleh kosong"),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

interface ExpenseFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ExpenseFormValues) => void;
  onDelete?: (id: string) => void;
  isLoading: boolean;
  initialData?: ExpenseFormValues | null;
}

export function ExpenseFormDrawer({
  isOpen,
  onClose,
  onSave,
  onDelete,
  isLoading,
  initialData,
}: ExpenseFormDrawerProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      amount: 0,
      category: EXPENSE_CATEGORIES[0],
      description: "",
      date: new Date().toISOString().split("T")[0],
    },
  });

  useEffect(() => {
    if (initialData && isOpen) {
      reset({
        id: initialData.id,
        amount: initialData.amount,
        category: initialData.category,
        description: initialData.description || "",
        date: initialData.date || new Date().toISOString().split("T")[0],
      });
    } else if (!initialData && isOpen) {
      reset({
        amount: 0,
        category: EXPENSE_CATEGORIES[0],
        description: "",
        date: new Date().toISOString().split("T")[0],
      });
    }
  }, [initialData, isOpen, reset]);

  const isEditing = !!initialData?.id;

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={isEditing ? "Edit Pengeluaran" : "Input Manual"}>
      <form onSubmit={handleSubmit(onSave)} className="flex flex-col gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground">
            Jumlah (Rp)
          </label>
          <Input
            type="number"
            {...register("amount", { valueAsNumber: true })}
            className="text-2xl font-bold"
          />
          {errors.amount && (
            <p className="mt-1 text-sm text-red-500">{errors.amount.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground">
            Kategori
          </label>
          <select 
            {...register("category")} 
            className="flex h-12 w-full rounded-xl border border-border bg-transparent px-3 py-1 text-base shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 disabled:cursor-not-allowed disabled:opacity-50 appearance-none"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke-width='1.5' stroke='%23a1a1aa'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19.5 8.25l-7.5 7.5-7.5-7.5' /%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1.5em 1.5em', paddingRight: '2.5rem' }}
          >
            {Object.entries(GROUPED_CATEGORIES).map(([groupName, categories]) => (
              <optgroup key={groupName} label={groupName} className="bg-background text-muted-foreground font-semibold">
                {categories.map(cat => (
                  <option key={cat} value={cat} className="bg-background text-foreground font-normal">
                    {cat}
                  </option>
                ))}
              </optgroup>
            ))}
            {/* Support for legacy categories that might exist in old data */}
            {initialData?.category && !EXPENSE_CATEGORIES.includes(initialData.category as any) && (
              <option key={initialData.category} value={initialData.category} className="bg-background text-foreground">
                {initialData.category} (Lama)
              </option>
            )}
          </select>
          {errors.category && (
            <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground">
            Deskripsi
          </label>
          <Input type="text" {...register("description")} />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-muted-foreground">
            Tanggal
          </label>
          <Input type="date" {...register("date")} />
          {errors.date && (
            <p className="mt-1 text-sm text-red-500">{errors.date.message}</p>
          )}
        </div>

        <div className="mt-4 flex gap-3">
          {isEditing && onDelete && (
            <Button
              type="button"
              variant="destructive"
              onClick={() => onDelete(initialData.id!)}
              disabled={isLoading}
            >
              Hapus
            </Button>
          )}
          <Button
            type="button"
            variant="outline"
            className="flex-1"
            onClick={onClose}
            disabled={isLoading}
          >
            Batal
          </Button>
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? "Menyimpan..." : "Simpan"}
          </Button>
        </div>
      </form>
    </Drawer>
  );
}
