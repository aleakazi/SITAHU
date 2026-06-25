"use client";

import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Package,
  Receipt,
  Database,
  History,
  Users,
  BarChart3,
  TrendingUp,
  Factory,
  Menu,
  X,
  PlusCircle,
  ShoppingCart,
  Coins,
  Layers,
  CreditCard,
  LayoutDashboard,
} from "lucide-react";
import { SheetName, SidebarItem, sheetToSlugMap } from "./types";

interface SidebarProps {
  selectedSheet?: SheetName | null;
  onSelectSheet?: (sheet: SheetName) => void;
}

const sidebarItems: SidebarItem[] = [
  { name: "Produk", label: "Daftar Produk", icon: Package },
  { name: "Pengeluaran Operasional", label: "Pengeluaran Operasional", icon: Receipt },
  { name: "Log Bahan Baku", label: "Log Bahan Baku", icon: Database },
  { name: "Log Transaksi", label: "Log Transaksi", icon: History },
  { name: "Piutang Pelanggan", label: "Piutang Pelanggan", icon: Users },
  { name: "Stok Harian", label: "Stok Harian", icon: BarChart3 },
  { name: "Cashflow", label: "Cashflow Keuangan", icon: TrendingUp },
];

const inputItems = [
  { name: "transaksi", label: "Entri Transaksi", icon: ShoppingCart, path: "/input/transaksi" },
  { name: "pengeluaran", label: "Entri Pengeluaran", icon: Coins, path: "/input/pengeluaran" },
  { name: "stok", label: "Entri Stok Harian", icon: Layers, path: "/input/stok" },
  { name: "pelunasan", label: "Entri Pelunasan", icon: CreditCard, path: "/input/pelunasan" },
];

export default function Sidebar({ selectedSheet, onSelectSheet }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const toggleSidebar = () => setIsOpen(!isOpen);

  const isInputPage = pathname === "/input";

  const handleSheetClick = (sheetName: SheetName) => {
    const slug = sheetToSlugMap[sheetName];
    router.push(`/${slug}`);
    setIsOpen(false);
  };

  const handleInputClick = () => {
    router.push("/input");
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <div className="flex items-center justify-between bg-white border-b border-slate-200 p-4 md:hidden text-slate-900 w-full sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0">
            <img src="/logo.png" alt="SITAHU logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-bold text-lg tracking-tight text-blue-900">
            SITAHU Macro
          </span>
        </div>
        <button
          onClick={toggleSidebar}
          aria-label="Toggle Navigation Menu"
          className="p-2 text-slate-500 hover:text-blue-900 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
        >
          {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden transition-opacity duration-300"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 md:w-72 bg-white border-r border-slate-200 flex flex-col justify-between transform transition-transform duration-300 ease-in-out md:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"
          } md:sticky h-screen`}
      >
        {/* Header/Logo Section */}
        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0">
              <img src="/logo.png" alt="SITAHU logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight text-blue-900">
                SITAHU Macro
              </h1>
              <p className="text-xs text-slate-500">Home Industry Tahu SM Bp. Aco Mojosongo</p>
            </div>
          </div>

          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-4" />

          {/* Navigation Links */}
          <nav className="space-y-6 mt-6">
            {/* Ringkasan Category */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">
                Ringkasan
              </div>
              <div className="space-y-1">
                <button
                  onClick={() => {
                    router.push("/dashboard");
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${pathname === "/dashboard"
                      ? "bg-blue-50 text-blue-900 border border-blue-100/50"
                      : "text-slate-600 hover:text-blue-900 hover:bg-slate-50 border border-transparent"
                    }`}
                >
                  <LayoutDashboard
                    className={`h-4.5 w-4.5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${pathname === "/dashboard" ? "text-blue-900" : "text-slate-400 group-hover:text-blue-900"
                      }`}
                  />
                  <span className="truncate">Dashboard Ringkasan</span>
                  {pathname === "/dashboard" && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-900" />
                  )}
                </button>
              </div>
            </div>

            {/* Database Sheets Category */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">
                Database Sheets
              </div>
              <div className="space-y-1">
                {sidebarItems.map((item) => {
                  const Icon = item.icon;
                  const slug = sheetToSlugMap[item.name];
                  const isActive = !isInputPage && pathname === `/${slug}`;
                  return (
                    <button
                      key={item.name}
                      onClick={() => handleSheetClick(item.name)}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${isActive
                        ? "bg-blue-50 text-blue-900 border border-blue-100/50"
                        : "text-slate-600 hover:text-blue-900 hover:bg-slate-50 border border-transparent"
                        }`}
                    >
                      <Icon
                        className={`h-4.5 w-4.5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-blue-900" : "text-slate-400 group-hover:text-blue-900"
                          }`}
                      />
                      <span className="truncate">{item.label}</span>
                      {isActive && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-900" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Input Data Forms Category */}
            <div>
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-4 mb-2">
                Entri Data
              </div>
              <div className="space-y-1">
                {inputItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.path;
                  return (
                    <button
                      key={item.name}
                      onClick={() => {
                        router.push(item.path);
                        setIsOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative ${isActive
                        ? "bg-blue-50 text-blue-900 border border-blue-100/50"
                        : "text-slate-600 hover:text-blue-900 hover:bg-slate-50 border border-transparent"
                        }`}
                    >
                      <Icon
                        className={`h-4.5 w-4.5 flex-shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-blue-900" : "text-slate-400 group-hover:text-blue-900"
                          }`}
                      />
                      <span className="truncate">{item.label}</span>
                      {isActive && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-blue-900" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
