"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Drawer } from "./ui/drawer";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useEffect } from "react";
import type { ParsedExpense } from "@/app/actions/parseExpense";

const expenseFormSchema = z.object({
  amount: z.number().min(1, "Jumlah harus lebih dari 0"),
  category: z.string().min(1, "Kategori tidak boleh kosong"),
  description: z.string().optional(),
});

type ExpenseFormValues = z.infer<typeof expenseFormSchema>;

interface ExpenseConfirmationProps {
  isOpen: boolean;
  onClose: () => void;
  parsedData: ParsedExpense | null;
  onConfirm: (data: ExpenseFormValues) => void;
  isLoading: boolean;
}

export function ExpenseConfirmation({
  isOpen,
  onClose,
  parsedData,
  onConfirm,
  isLoading,
}: ExpenseConfirmationProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      amount: 0,
      category: "",
      description: "",
    },
  });

  useEffect(() => {
    if (parsedData) {
      reset({
        amount: parsedData.amount,
        category: parsedData.category,
        description: parsedData.description,
      });
    }
  }, [parsedData, reset]);

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title="Konfirmasi Transaksi">
      <form onSubmit={handleSubmit(onConfirm)} className="flex flex-col gap-4">
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
          <Input type="text" {...register("category")} />
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

        <div className="mt-4 flex gap-3">
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
