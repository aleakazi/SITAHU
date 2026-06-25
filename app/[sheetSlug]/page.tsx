"use client";

import React, { useState, useEffect, Suspense, use } from "react";
import { notFound } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import DataTable from "@/components/DataTable";
import { SheetName, slugToSheetMap } from "@/components/types";
import { RefreshCw } from "lucide-react";

interface PageProps {
  params: Promise<{ sheetSlug: string }>;
}

function DashboardContent({ sheetSlug }: { sheetSlug: string }) {
  const selectedSheet = slugToSheetMap[sheetSlug as keyof typeof slugToSheetMap];
  
  if (!selectedSheet) {
    notFound();
  }

  const [data, setData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (sheetName: SheetName) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/sheets/${encodeURIComponent(sheetName)}`);
      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result || []);
    } catch (err: any) {
      console.error("Error loading sheet data:", err);
      setError(err.message || "Gagal mengambil data dari server. Pastikan koneksi internet stabil.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData(selectedSheet);
  }, [selectedSheet]);

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
              Dashboard Operasional
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              Data terintegrasi langsung dari spreadsheet utama secara realtime.
            </p>
          </div>

          {/* Quick controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchData(selectedSheet)}
              disabled={isLoading}
              className="flex items-center gap-2 bg-blue-900 hover:bg-blue-950 active:scale-95 disabled:opacity-55 text-white font-semibold text-xs rounded-xl px-4 py-2.5 transition-all cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>
          </div>
        </header>

        {/* Dynamic Table Visualization */}
        <section className="transition-all duration-300">
          <DataTable
            sheetName={selectedSheet}
            data={data}
            isLoading={isLoading}
            error={error}
          />
        </section>
      </main>
    </div>
  );
}

export default function DashboardPage({ params }: PageProps) {
  const { sheetSlug } = use(params);

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
      <DashboardContent sheetSlug={sheetSlug} />
    </Suspense>
  );
}
