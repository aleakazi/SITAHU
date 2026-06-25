"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { CreditCard, Send, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface AlertState {
  type: "success" | "error";
  message: string;
}

export default function InputPelunasanPage() {
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [alert, setAlert] = useState<AlertState | null>(null);

  useEffect(() => {
    if (alert) {
      const timer = setTimeout(() => setAlert(null), 6000);
      return () => clearTimeout(timer);
    }
  }, [alert]);

  const getTodayDateString = () => new Date().toISOString().split("T")[0];

  const initialPelunasan = {
    tanggal: getTodayDateString(),
    namaPelanggan: "",
    nominal: "",
    keterangan: "",
  };

  const [formPelunasan, setFormPelunasan] = useState(initialPelunasan);

  const formatDateToMDY = (dateStr: string): string => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[1]}/${parts[2]}/${parts[0]}`;
    }
    return dateStr;
  };

  const handlePelunasanSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formPelunasan.namaPelanggan || !formPelunasan.nominal) {
      setAlert({ type: "error", message: "Nama Pelanggan dan Nominal wajib diisi!" });
      return;
    }

    setIsSubmitting(true);
    setAlert(null);

    try {
      const payload = {
        action: "insertPelunasan",
        data: {
          "Tanggal": formatDateToMDY(formPelunasan.tanggal || getTodayDateString()),
          "Nama Pelanggan": formPelunasan.namaPelanggan,
          "Nominal": Number(formPelunasan.nominal) || 0,
          "Keterangan": formPelunasan.keterangan || "-",
        },
      };

      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Gagal menyimpan data pelunasan");
      }

      setAlert({ type: "success", message: "Data pelunasan/cicilan berhasil disimpan ke Google Sheets!" });
      setFormPelunasan({
        ...initialPelunasan,
        tanggal: getTodayDateString(),
      });
    } catch (err: any) {
      console.error(err);
      setAlert({ type: "error", message: err.message || "Koneksi API gagal" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-900 w-full">
      <Sidebar />

      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto max-w-4xl mx-auto w-full">
        <header className="bg-white p-6 rounded-2xl border border-slate-200">
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
            Form Pengisian Data
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Kirim data pelunasan langsung ke database spreadsheet pusat.
          </p>
        </header>

        {alert && (
          <div
            className={`p-4 rounded-xl border flex items-start gap-3.5 animate-fadeIn ${
              alert.type === "success"
                ? "bg-emerald-50 border-emerald-100 text-emerald-800"
                : "bg-red-50 border-red-100 text-red-800"
            }`}
          >
            {alert.type === "success" ? (
              <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-bold text-sm">
                {alert.type === "success" ? "Proses Berhasil" : "Gagal Menyimpan Data"}
              </p>
              <p className="text-xs mt-0.5 opacity-90">{alert.message}</p>
            </div>
          </div>
        )}

        <form
          onSubmit={handlePelunasanSubmit}
          className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 space-y-6"
        >
          <h2 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-blue-900" />
            Entri Pelunasan / Cicilan Piutang Pelanggan
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Tanggal Transaksi <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={formPelunasan.tanggal}
                onChange={(e) => setFormPelunasan({ ...formPelunasan, tanggal: e.target.value })}
                disabled={isSubmitting}
                required
                className="w-full bg-white border border-slate-200 focus:border-blue-900 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900/20 transition-colors disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Nama Pelanggan <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Contoh: Toko Budi"
                value={formPelunasan.namaPelanggan}
                onChange={(e) => setFormPelunasan({ ...formPelunasan, namaPelanggan: e.target.value })}
                disabled={isSubmitting}
                required
                className="w-full bg-white border border-slate-200 focus:border-blue-900 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900/20 transition-colors disabled:opacity-60 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Nominal Pembayaran (Rp) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Contoh: 500000"
                min="1"
                value={formPelunasan.nominal}
                onChange={(e) => setFormPelunasan({ ...formPelunasan, nominal: e.target.value })}
                disabled={isSubmitting}
                required
                className="w-full bg-white border border-slate-200 focus:border-blue-900 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900/20 transition-colors disabled:opacity-60 placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                Keterangan
              </label>
              <input
                type="text"
                placeholder="Contoh: Cicilan ke-2"
                value={formPelunasan.keterangan}
                onChange={(e) => setFormPelunasan({ ...formPelunasan, keterangan: e.target.value })}
                disabled={isSubmitting}
                className="w-full bg-white border border-slate-200 focus:border-blue-900 rounded-xl px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-1 focus:ring-blue-900/20 transition-colors disabled:opacity-60 placeholder-slate-400"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-900 hover:bg-blue-950 disabled:opacity-50 text-white font-bold px-8 py-3.5 rounded-xl transition-all active:scale-95 cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  <span>Submit Pelunasan</span>
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
