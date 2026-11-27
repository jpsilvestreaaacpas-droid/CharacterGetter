"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface PaginationProps {
  page: number;
  totalPages: number;
  pageSize: number;
  pageSizes?: number[];
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  /** Optional extra className for the wrapper */
  className?: string;
}

/**
 * Reusable client-side pagination bar.
 * Uses Teyvat Archive palette.
 */
export function Pagination({
  page,
  totalPages,
  pageSize,
  pageSizes = [12, 24, 36, 48],
  totalItems,
  onPageChange,
  onPageSizeChange,
  className = "",
}: PaginationProps) {
  if (totalPages <= 1 && totalItems <= (pageSizes[0] ?? 12)) return null;

  const from = Math.min(totalItems, (page - 1) * pageSize + 1);
  const to = Math.min(totalItems, page * pageSize);

  // Build a compact window of page numbers
  const pageNums: (number | "…")[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pageNums.push(i);
  } else {
    pageNums.push(1);
    if (page > 3) pageNums.push("…");
    for (let i = Math.max(2, page - 1); i <= Math.min(totalPages - 1, page + 1); i++) {
      pageNums.push(i);
    }
    if (page < totalPages - 2) pageNums.push("…");
    pageNums.push(totalPages);
  }

  return (
    <div
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-[#D6CFBF]/70 ${className}`}
    >
      {/* Count */}
      <p className="text-sm text-[#777367] shrink-0">
        {totalItems === 0
          ? "No items"
          : `Showing ${from}–${to} of ${totalItems}`}
      </p>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Page size selector */}
        {onPageSizeChange && (
          <label className="flex items-center gap-1.5 text-sm text-[#777367]">
            Per page
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="h-8 rounded-md border border-[#D6CFBF] bg-[#F3EFE6] px-2 text-sm text-[#343D36] focus:outline-none focus:ring-2 focus:ring-[#A68B61]"
            >
              {pageSizes.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </label>
        )}

        {/* Prev / page numbers / Next */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-[#D6CFBF] bg-[#F3EFE6] text-[#343D36] hover:bg-[#E5DFD2] disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {pageNums.map((n, idx) =>
            n === "…" ? (
              <span key={`ellipsis-${idx}`} className="px-1 text-sm text-[#777367] select-none">
                …
              </span>
            ) : (
              <Button
                key={n}
                variant={n === page ? "default" : "outline"}
                size="sm"
                className={`h-8 min-w-[2rem] px-2 text-sm border-[#D6CFBF] ${
                  n === page
                    ? "bg-[#343D36] text-[#F3EFE6] border-[#343D36] font-bold"
                    : "bg-[#F3EFE6] text-[#343D36] hover:bg-[#E5DFD2]"
                }`}
                onClick={() => onPageChange(n as number)}
                aria-label={`Page ${n}`}
                aria-current={n === page ? "page" : undefined}
              >
                {n}
              </Button>
            )
          )}

          <Button
            variant="outline"
            size="sm"
            className="h-8 w-8 p-0 border-[#D6CFBF] bg-[#F3EFE6] text-[#343D36] hover:bg-[#E5DFD2] disabled:opacity-40"
            disabled={page >= totalPages}
            onClick={() => onPageChange(page + 1)}
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
