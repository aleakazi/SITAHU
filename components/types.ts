import React from "react";

export type SheetName =
  | "Produk"
  | "Pengeluaran Operasional"
  | "Log Bahan Baku"
  | "Log Transaksi"
  | "Piutang Pelanggan"
  | "Stok Harian"
  | "Cashflow";

export interface SidebarItem {
  name: SheetName;
  label: string;
  icon: React.ComponentType<any>;
}

export interface RowProduk {
  "No": number;
  "Nama Produk": string;
  "Harga Jual": number;
  "Stok Masuk": number;
  "Stok Terjual": number;
  "Stok Sisa": number;
  "Status Stok": string;
}

export interface RowPengeluaranOperasional {
  "No Pengeluaran": string;
  "Tanggal": string;
  "Kategori": string;
  "Keterangan": string;
  "Nominal": number;
  "Dibayar Oleh": string;
  "Bukti Pembayaran": string;
  "Metode Pembayaran": string;
}

export interface RowLogBahanBaku {
  "Tanggal": string;
  "Bahan Baku": string;
  "Jumlah": number;
  "Satuan": string;
  "Harga Satuan": number;
  "Total Harga": number;
  "Supplier": string;
  "Keterangan": string;
}

export interface RowLogTransaksi {
  "No Transaksi": string;
  "Tanggal": string;
  "Nama Pelanggan": string;
  "Lokasi / Tujuan": string;
  "Jenis Transaksi": string;
  "Jenis Tahu": string;
  "Jumlah Loyang": number;
  "Request Potongan": string;
  "Total Tagihan": number;
  "Nominal Bayar": number;
  "Status Pembayaran": string;
  "Sisa Bayar": number;
  "Metode Pengiriman": string;
  "Driver / Pengambil": string;
  "Keterangan": string;
}

export interface RowPiutangPelanggan {
  "Nama Pelanggan": string;
  "Lokasi": string;
  "Total Tagihan Keseluruhan": number;
  "Total Sudah Dibayar": number;
  "Sisa Piutang": number;
  "Status": string;
  "Keterangan": string;
}

export interface RowStokHarian {
  "Tanggal": string;
  "Jenis Tahu": string;
  "Stok Awal": number;
  "Jumlah Produksi": number;
  "Produk Keluar": number;
  "Stok Sistem": number;
  "Stok Fisik Aktual": number;
  "Selisih": number;
  "Keterangan": string;
}

export interface RowCashflow {
  "Tipe": string;
  "Tanggal": string;
  "Kategori": string;
  "Keterangan": string;
  "Nominal": number;
  "Saldo": number;
}

export const slugToSheetMap = {
  "daftar-produk": "Produk",
  "pengeluaran-operasional": "Pengeluaran Operasional",
  "log-bahan-baku": "Log Bahan Baku",
  "log-transaksi": "Log Transaksi",
  "piutang-pelanggan": "Piutang Pelanggan",
  "stok-harian": "Stok Harian",
  "cashflow": "Cashflow",
} as const;

export const sheetToSlugMap = {
  "Produk": "daftar-produk",
  "Pengeluaran Operasional": "pengeluaran-operasional",
  "Log Bahan Baku": "log-bahan-baku",
  "Log Transaksi": "log-transaksi",
  "Piutang Pelanggan": "piutang-pelanggan",
  "Stok Harian": "stok-harian",
  "Cashflow": "cashflow",
} as const;
