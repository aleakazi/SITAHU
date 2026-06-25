"use client";

import React, { useState } from "react";
import { Search, ExternalLink, Inbox, AlertCircle } from "lucide-react";

interface DataTableProps {
  sheetName: string;
  data: any[];
  isLoading: boolean;
  error: string | null;
}

export default function DataTable({ sheetName, data, isLoading, error }: DataTableProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Helper: Format to Indonesian Rupiah (IDR)
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

  // Helper: Format standard numbers with thousands separators
  const formatNumber = (value: any): string => {
    if (value === null || value === undefined || value === "") return "-";
    const num = typeof value === "number" ? value : parseFloat(value);
    if (isNaN(num)) return String(value);
    return new Intl.NumberFormat("id-ID").format(num);
  };

  // Helper: Format Date strings to MM/DD/YYYY
  const formatDate = (val: any): string => {
    if (!val) return "-";
    const dateStr = String(val).trim();
    
    // Check if it's already MM/DD/YYYY
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
      return dateStr;
    }

    // Matches YYYY-MM-DD or standard ISO date string
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr) || /^\d{4}-\d{2}-\d{2}T/.test(dateStr)) {
      try {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) {
          const month = String(d.getMonth() + 1).padStart(2, "0");
          const day = String(d.getDate()).padStart(2, "0");
          const year = d.getFullYear();
          return `${month}/${day}/${year}`;
        }
      } catch (e) {}
    }

    // Attempt parsing other valid date formats
    try {
      const d = new Date(dateStr);
      if (!isNaN(d.getTime())) {
        const month = String(d.getMonth() + 1).padStart(2, "0");
        const day = String(d.getDate()).padStart(2, "0");
        const year = d.getFullYear();
        return `${month}/${day}/${year}`;
      }
    } catch (e) {}

    return dateStr;
  };

  // Helper: Check if the column is a currency field
  const isCurrencyColumn = (header: string): boolean => {
    const h = header.toLowerCase();
    return (
      h.includes("harga") ||
      h.includes("nominal") ||
      h.includes("tagihan") ||
      h.includes("bayar") ||
      h.includes("piutang") ||
      h.includes("saldo")
    );
  };

  // Helper: Detect URLs
  const isUrl = (value: any): boolean => {
    if (typeof value !== "string") return false;
    return value.startsWith("http://") || value.startsWith("https://");
  };

  // Helper: Render beautiful status badges based on values
  const renderStatusBadge = (value: any) => {
    const text = String(value).trim();
    const lower = text.toLowerCase();

    // Success / Healthy / Paid statuses
    if (["lunas", "aman", "aktif", "success", "selesai", "masuk"].includes(lower)) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200/50">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          {text}
        </span>
      );
    }

    // Warning / Attention / Partially Paid / Process statuses
    if (
      ["perlu perhatian", "dp", "sebagian", "proses", "pending", "selisih"].includes(lower) ||
      lower.includes("perhatian")
    ) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/50">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          {text}
        </span>
      );
    }

    // Danger / Unpaid / Out / Cancelled statuses
    if (
      ["belum lunas", "kritis", "kosong", "batal", "error", "keluar"].includes(lower) ||
      lower.includes("belum")
    ) {
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200/50">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
          {text}
        </span>
      );
    }

    // Fallback status badge
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">
        {text}
      </span>
    );
  };

  // Helper: Format and render cells dynamically based on the header configurations
  const renderCell = (header: string, value: any) => {
    if (value === null || value === undefined || value === "") {
      return <span className="text-slate-400">-</span>;
    }

    if (isUrl(value)) {
      return (
        <a
          href={value}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-blue-900 hover:text-blue-800 hover:underline font-medium transition-colors"
        >
          <span>Lihat Bukti</span>
          <ExternalLink className="h-3 w-3" />
        </a>
      );
    }

    if (header.toLowerCase().includes("status")) {
      return renderStatusBadge(value);
    }

    if (isCurrencyColumn(header)) {
      return <span className="font-semibold text-slate-900">{formatRupiah(value)}</span>;
    }

    if (header.toLowerCase().includes("tanggal")) {
      return <span className="text-slate-700">{formatDate(value)}</span>;
    }

    // Numeric matching
    const numHeaders = ["jumlah", "stok", "loyang", "sisa", "masuk", "terjual", "selisih", "awal", "produksi", "keluar", "fisik"];
    if (numHeaders.some((h) => header.toLowerCase().includes(h))) {
      const isSelisih = header.toLowerCase().includes("selisih");
      const num = typeof value === "number" ? value : parseFloat(value);
      if (!isNaN(num)) {
        if (isSelisih) {
          if (num > 0) {
            return <span className="text-emerald-600 font-medium">+{formatNumber(num)}</span>;
          } else if (num < 0) {
            return <span className="text-red-600 font-medium">{formatNumber(num)}</span>;
          }
        }
        return <span className="text-slate-700 font-medium">{formatNumber(num)}</span>;
      }
    }

    return <span className="text-slate-700">{String(value)}</span>;
  };

  // Headers are resolved from the keys of the first object dynamically
  const headers = data.length > 0 ? Object.keys(data[0]) : [];

  // Client-side quick filter logic
  const filteredData = data.filter((row) =>
    Object.values(row).some((val) =>
      String(val).toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  return (
    <div className="w-full space-y-6">
      {/* Table Top Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Data {sheetName}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isLoading
              ? "Menghubungkan ke Google Sheets..."
              : `Ditemukan ${filteredData.length} records ${
                  searchQuery ? `(filter dari ${data.length})` : ""
                }`}
          </p>
        </div>

        {/* Search bar */}
        {!error && data.length > 0 && (
          <div className="relative max-w-sm w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-450" />
            <input
              type="text"
              placeholder={`Cari di sheet ${sheetName}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white border border-slate-200 hover:border-slate-350 focus:border-blue-900 text-sm text-slate-900 pl-10 pr-4 py-2.5 rounded-xl transition-colors placeholder-slate-400 outline-none focus:ring-1 focus:ring-blue-900/20"
            />
          </div>
        )}
      </div>

      {/* Main Table Content */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {/* Error State */}
        {error && (
          <div className="p-8 text-center flex flex-col items-center justify-center">
            <div className="p-3 bg-red-50 text-red-550 rounded-2xl border border-red-200 mb-4 animate-bounce">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Terjadi Kesalahan</h3>
            <p className="text-slate-500 text-sm max-w-md mt-1">{error}</p>
          </div>
        )}

        {/* Loading / Skeleton State */}
        {!error && isLoading && (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <th key={i} className="px-6 py-4">
                      <div className="h-4 bg-slate-200 rounded-md w-24 animate-pulse" />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6].map((rowIdx) => (
                  <tr key={rowIdx} className="border-b border-slate-100">
                    {[1, 2, 3, 4, 5].map((colIdx) => (
                      <td key={colIdx} className="px-6 py-4">
                        <div className="h-4 bg-slate-100 rounded-md w-full animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Data Presentation State */}
        {!error && !isLoading && (
          <>
            {filteredData.length === 0 ? (
              // Empty State
              <div className="py-16 text-center flex flex-col items-center justify-center">
                <div className="p-4 bg-slate-50 border border-slate-100 text-slate-450 rounded-3xl mb-4">
                  <Inbox className="h-8 w-8" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg">Tidak Ada Data</h3>
                <p className="text-slate-500 text-sm mt-1 max-w-xs">
                  {searchQuery
                    ? "Tidak ada data yang cocok dengan kata kunci pencarian Anda."
                    : `Belum ada record data untuk sheet "${sheetName}".`}
                </p>
              </div>
            ) : (
              // Table Render
              <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-sm text-slate-700">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      {headers.map((header) => (
                        <th
                          key={header}
                          className="px-6 py-4 font-semibold text-slate-900 tracking-wider whitespace-nowrap"
                        >
                          {header}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredData.map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className="hover:bg-slate-50 transition-colors duration-150"
                      >
                        {headers.map((header) => (
                          <td
                            key={header}
                            className="px-6 py-4 align-middle whitespace-nowrap"
                          >
                            {renderCell(header, row[header])}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
