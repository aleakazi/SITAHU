"use client";

import React, { useState, useEffect, Suspense, use } from "react";
import Sidebar from "@/components/Sidebar";
import {
  RefreshCw,
  TrendingUp,
  Coins,
  Users,
  Layers,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Inbox,
  AlertCircle,
  TrendingDown,
} from "lucide-react";

interface KPIValues {
  produkKeluarHariIni?: number;
  uangMasukHariIni?: number;
  totalPiutangBerjalan?: number;
  pengeluaranHariIni?: number;
  estimasiLabaBersihHariIni?: number;
  totalStokFisikAktual?: number;
}

interface StokRow {
  jenisTahu: string;
  stokAwal?: number;
  produksi?: number;
  stokSistem?: number;
  fisikAktual?: number;
  sinyalSelisih?: string;
}

interface PiutangRow {
  namaPelanggan: string;
  totalTagihan?: number;
  totalBayar?: number;
  sisaPiutang?: number;
}

interface FinansialRow {
  tipe: string; // Pemasukan or Pengeluaran
  tanggal?: string;
  kategori?: string;
  nominal?: number;
}

interface PenjualanRow {
  jenisTahu: string;
  jumlahTerjual?: number;
  jumlahLoyang?: number;
}

interface DashboardData {
  kpis: KPIValues;
  tabelStok: StokRow[];
  tabelPiutang: PiutangRow[];
  chartFinansialHarian: FinansialRow[];
  chartPenjualanTahu: PenjualanRow[];
}

const defaultDashboardData: DashboardData = {
  kpis: {},
  tabelStok: [],
  tabelPiutang: [],
  chartFinansialHarian: [],
  chartPenjualanTahu: [],
};

function DashboardContent() {
  const [data, setData] = useState<DashboardData>(defaultDashboardData);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/sheets/dashboard");
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result || defaultDashboardData);
    } catch (err: any) {
      console.error("Error loading dashboard data:", err);
      setError(err.message || "Gagal mengambil data ringkasan dashboard. Pastikan server aktif.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const kpis = data.kpis || {};
  const tabelStok = data.tabelStok || [];
  const tabelPiutang = data.tabelPiutang || [];
  const chartFinansialHarian = data.chartFinansialHarian || [];
  const chartPenjualanTahu = data.chartPenjualanTahu || [];

  const formatRupiah = (value: any): string => {
    if (value === null || value === undefined || value === "") return "-";
    const num = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(num)) return String(value);
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  const formatNumber = (value: any): string => {
    if (value === null || value === undefined || value === "") return "-";
    const num = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(num)) return String(value);
    return new Intl.NumberFormat("id-ID").format(num);
  };

  const renderSinyalSelisih = (text: string) => {
    const val = String(text || "").trim();
    const lower = val.toLowerCase();
    if (lower.includes("selisih") && !lower.includes("0 loyang")) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200/50">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          {val}
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        {val || "0 Loyang"}
      </span>
    );
  };

  const totalPemasukan = chartFinansialHarian
    .filter((item) => item.tipe === "Pemasukan")
    .reduce((sum, item) => sum + (item.nominal || 0), 0);

  const totalPengeluaran = chartFinansialHarian
    .filter((item) => item.tipe === "Pengeluaran")
    .reduce((sum, item) => sum + (item.nominal || 0), 0);

  const totalFinansial = totalPemasukan + totalPengeluaran;
  const pctPemasukan = totalFinansial > 0 ? (totalPemasukan / totalFinansial) * 100 : 100;
  const pctPengeluaran = totalFinansial > 0 ? (totalPengeluaran / totalFinansial) * 100 : 0;

  const maxSales = Math.max(...chartPenjualanTahu.map((item) => item.jumlahTerjual ?? item.jumlahLoyang ?? 0), 1);
  const isNegativeLaba = (kpis.estimasiLabaBersihHariIni || 0) < 0;

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 text-slate-900 w-full">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Dashboard Content Area */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto max-w-7xl mx-auto w-full">
        {/* Top Header Card */}
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 bg-white p-6 rounded-2xl border border-slate-200">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Dashboard Ringkasan
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Ringkasan data operasional dan finansial hari ini secara realtime.
            </p>
          </div>

          {/* Quick controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={fetchDashboardData}
              disabled={isLoading}
              className="flex items-center gap-2 bg-blue-900 hover:bg-blue-950 active:scale-95 disabled:opacity-55 text-white font-semibold text-xs rounded-xl px-4 py-2.5 transition-all cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {/* Error State */}
        {error && (
          <div className="p-8 text-center flex flex-col items-center justify-center bg-white rounded-2xl border border-slate-200">
            <div className="p-3 bg-red-50 text-red-500 rounded-2xl border border-red-200 mb-4 animate-bounce">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Terjadi Kesalahan</h3>
            <p className="text-slate-500 text-sm max-w-md mt-1">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="mt-4 px-4 py-2 bg-blue-900 text-white rounded-xl font-semibold text-sm hover:bg-blue-950 transition-colors"
            >
              Coba Lagi
            </button>
          </div>
        )}

        {/* Loading state */}
        {!error && isLoading && kpis.produkKeluarHariIni === undefined && (
          <div className="space-y-8 animate-pulse">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-white p-5 border border-slate-200 rounded-2xl h-24" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white p-6 border border-slate-200 rounded-2xl h-80" />
              <div className="bg-white p-6 border border-slate-200 rounded-2xl h-80" />
            </div>
          </div>
        )}

        {/* Dashboard Content */}
        {!error && (kpis.produkKeluarHariIni !== undefined || !isLoading) && (
          <>
            {/* KPI Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Card 1: Produk Keluar */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Produk Keluar Hari Ini</p>
                  <p className="text-2xl font-black text-slate-900">
                    {formatNumber(kpis.produkKeluarHariIni ?? 0)} Loyang
                  </p>
                </div>
                <div className="p-3 bg-blue-50 text-blue-900 rounded-xl border border-blue-100/50">
                  <Package className="h-6 w-6" />
                </div>
              </div>

              {/* Card 2: Uang Masuk */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Uang Masuk Hari Ini</p>
                  <p className="text-2xl font-black text-slate-900">
                    {formatRupiah(kpis.uangMasukHariIni ?? 0)}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100/50">
                  <ArrowUpRight className="h-6 w-6" />
                </div>
              </div>

              {/* Card 3: Total Piutang Berjalan */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Piutang Berjalan</p>
                  <p className="text-2xl font-black text-slate-900">
                    {formatRupiah(kpis.totalPiutangBerjalan ?? 0)}
                  </p>
                </div>
                <div className="p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-100/50">
                  <Users className="h-6 w-6" />
                </div>
              </div>

              {/* Card 4: Pengeluaran Hari Ini */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pengeluaran Hari Ini</p>
                  <p className="text-2xl font-black text-slate-900">
                    {formatRupiah(kpis.pengeluaranHariIni ?? 0)}
                  </p>
                </div>
                <div className="p-3 bg-red-50 text-red-600 rounded-xl border border-red-100/50">
                  <ArrowDownRight className="h-6 w-6" />
                </div>
              </div>

              {/* Card 5: Estimasi Laba Bersih */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Estimasi Laba Bersih Hari Ini</p>
                  <p className={`text-2xl font-black ${isNegativeLaba ? "text-red-600" : "text-slate-900"}`}>
                    {formatRupiah(kpis.estimasiLabaBersihHariIni ?? 0)}
                  </p>
                </div>
                <div className={`p-3 rounded-xl border ${
                  isNegativeLaba 
                    ? "bg-red-50 text-red-600 border-red-100/50" 
                    : "bg-blue-900 text-white border-blue-900/50"
                }`}>
                  {isNegativeLaba ? <TrendingDown className="h-6 w-6" /> : <TrendingUp className="h-6 w-6" />}
                </div>
              </div>

              {/* Card 6: Total Stok Fisik */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Stok Fisik Aktual</p>
                  <p className="text-2xl font-black text-slate-900">
                    {formatNumber(kpis.totalStokFisikAktual ?? 0)} Loyang
                  </p>
                </div>
                <div className="p-3 bg-purple-50 text-purple-700 rounded-xl border border-purple-100/50">
                  <Layers className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Financial Progress chart */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-2">Finansial Harian (Cashflow)</h2>
                  <p className="text-xs text-slate-500 mb-4">Perbandingan pemasukan dan pengeluaran hari ini.</p>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between text-xs font-semibold text-slate-600">
                      <span>Pemasukan: {formatRupiah(totalPemasukan)} ({pctPemasukan.toFixed(0)}%)</span>
                      <span>Pengeluaran: {formatRupiah(totalPengeluaran)} ({pctPengeluaran.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full h-3.5 bg-slate-100 rounded-full overflow-hidden flex border border-slate-200">
                      <div
                        style={{ width: `${pctPemasukan}%` }}
                        className="h-full bg-emerald-500 transition-all duration-500"
                      />
                      <div
                        style={{ width: `${pctPengeluaran}%` }}
                        className="h-full bg-red-500 transition-all duration-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-6 space-y-2 max-h-56 overflow-y-auto pr-1">
                  {chartFinansialHarian.length === 0 ? (
                    <div className="text-center py-8">
                      <Inbox className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                      <p className="text-xs text-slate-400">Tidak ada log finansial hari ini</p>
                    </div>
                  ) : (
                    chartFinansialHarian.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100/50 transition-colors"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-800">{item.kategori || "Transaksi"}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{item.tanggal || "-"}</p>
                        </div>
                        <div className="text-right">
                          <span
                            className={`text-xs font-bold ${
                              item.tipe === "Pemasukan" ? "text-emerald-600" : "text-red-600"
                            }`}
                          >
                            {item.tipe === "Pemasukan" ? "+" : "-"} {formatRupiah(item.nominal || 0)}
                          </span>
                          <p className="text-[9px] text-slate-400 font-medium uppercase tracking-wider">
                            {item.tipe}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Tofu Sales volume chart */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200 flex flex-col justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 mb-2">Volume Penjualan Tahu</h2>
                  <p className="text-xs text-slate-500 mb-4">Jumlah penjualan tahu hari ini dalam satuan loyang.</p>
                  
                  <div className="space-y-4">
                    {chartPenjualanTahu.length === 0 ? (
                      <div className="text-center py-12">
                        <Inbox className="h-6 w-6 text-slate-400 mx-auto mb-2" />
                        <p className="text-xs text-slate-400">Belum ada penjualan tahu hari ini</p>
                      </div>
                    ) : (
                      chartPenjualanTahu.map((item, idx) => {
                        const qty = item.jumlahTerjual ?? item.jumlahLoyang ?? 0;
                        const pct = (qty / maxSales) * 100;
                        return (
                          <div key={idx} className="space-y-1.5">
                            <div className="flex justify-between text-xs font-semibold">
                              <span className="text-slate-800">{item.jenisTahu}</span>
                              <span className="text-blue-900">{qty} Loyang</span>
                            </div>
                            <div className="w-full h-3 bg-slate-100 rounded-full border border-slate-200 overflow-hidden">
                              <div
                                style={{ width: `${pct}%` }}
                                className="h-full bg-blue-900 rounded-full transition-all duration-500"
                              />
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Tables Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Daily stock variance table */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h2 className="text-lg font-bold text-slate-900 mb-1">Stok Harian (Selisih & Fisik)</h2>
                <p className="text-xs text-slate-500 mb-4">Pemantauan selisih antara sistem dengan fisik aktual.</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">Jenis Tahu</th>
                        <th className="px-4 py-3 font-semibold text-slate-900 text-center whitespace-nowrap">Stok Awal</th>
                        <th className="px-4 py-3 font-semibold text-slate-900 text-center whitespace-nowrap">Produksi</th>
                        <th className="px-4 py-3 font-semibold text-slate-900 text-center whitespace-nowrap">Sistem</th>
                        <th className="px-4 py-3 font-semibold text-slate-900 text-center whitespace-nowrap">Fisik</th>
                        <th className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">Sinyal Selisih</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tabelStok.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-slate-400">
                            Tidak ada data stok harian hari ini
                          </td>
                        </tr>
                      ) : (
                        tabelStok.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3.5 font-semibold text-slate-900 whitespace-nowrap">{row.jenisTahu}</td>
                            <td className="px-4 py-3.5 text-center whitespace-nowrap">{formatNumber(row.stokAwal ?? 0)}</td>
                            <td className="px-4 py-3.5 text-center whitespace-nowrap">{formatNumber(row.produksi ?? 0)}</td>
                            <td className="px-4 py-3.5 text-center whitespace-nowrap">{formatNumber(row.stokSistem ?? 0)}</td>
                            <td className="px-4 py-3.5 text-center whitespace-nowrap font-bold text-slate-900">{formatNumber(row.fisikAktual ?? 0)}</td>
                            <td className="px-4 py-3.5 whitespace-nowrap">
                              {renderSinyalSelisih(row.sinyalSelisih || "")}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Client accounts / receivables table */}
              <div className="bg-white p-6 rounded-2xl border border-slate-200">
                <h2 className="text-lg font-bold text-slate-900 mb-1">Piutang Pelanggan</h2>
                <p className="text-xs text-slate-500 mb-4">Daftar saldo piutang berjalan per pelanggan hari ini.</p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50">
                        <th className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">Pelanggan</th>
                        <th className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">Total Tagihan</th>
                        <th className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">Total Bayar</th>
                        <th className="px-4 py-3 font-semibold text-slate-900 whitespace-nowrap">Sisa Piutang</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {tabelPiutang.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-8 text-slate-400">
                            Tidak ada data piutang berjalan
                          </td>
                        </tr>
                      ) : (
                        tabelPiutang.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-3.5 font-semibold text-slate-900 whitespace-nowrap">{row.namaPelanggan}</td>
                            <td className="px-4 py-3.5 whitespace-nowrap">{formatRupiah(row.totalTagihan ?? 0)}</td>
                            <td className="px-4 py-3.5 whitespace-nowrap text-emerald-600 font-medium">{formatRupiah(row.totalBayar ?? 0)}</td>
                            <td className="px-4 py-3.5 font-bold text-slate-900 whitespace-nowrap">{formatRupiah(row.sisaPiutang ?? 0)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-slate-50 text-slate-600">
          <div className="flex flex-col items-center gap-3">
            <RefreshCw className="h-8 w-8 animate-spin text-blue-900" />
            <p className="text-sm font-medium">Memuat Dashboard...</p>
          </div>
        </div>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
