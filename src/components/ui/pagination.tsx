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
      className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-border/70 dark:border-[#D7B66D]/25 ${className}`}
    >
      {/* Count */}
      <p className="text-sm text-muted-foreground dark:text-[#AEBBD0] shrink-0">
        {totalItems === 0
          ? "No items"
          : `Showing ${from}–${to} of ${totalItems}`}
      </p>

      <div className="flex items-center gap-3 flex-wrap">
        {/* Page size selector */}
        {onPageSizeChange && (
          <label className="flex items-center gap-1.5 text-sm text-muted-foreground dark:text-[#AEBBD0]">
            Per page
            <select
              value={pageSize}
              onChange={(e) => {
                onPageSizeChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="h-8 rounded-md border border-border dark:border-[#D7B66D]/30 bg-card dark:bg-[#172746] px-2 text-sm text-foreground dark:text-[#EAEAF0] focus:outline-none focus:ring-2 focus:ring-[#F2D38A]"
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
            className="h-8 w-8 p-0 border-border dark:border-[#D7B66D]/30 bg-card dark:bg-[#172746] text-foreground dark:text-[#EAEAF0] hover:bg-muted dark:hover:bg-[#243F6B] disabled:opacity-40"
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {pageNums.map((n, idx) =>
            n === "…" ? (
              <span key={`ellipsis-${idx}`} className="px-1 text-sm text-muted-foreground select-none">
                …
              </span>
            ) : (
              <Button
                key={n}
                variant={n === page ? "default" : "outline"}
                size="sm"
                className={`h-8 min-w-[2rem] px-2 text-sm border-border dark:border-[#D7B66D]/30 ${
                  n === page
                    ? "bg-primary text-primary-foreground dark:bg-[#D7B66D] dark:text-[#101B35] dark:border-[#F2D38A] font-bold"
                    : "bg-card dark:bg-[#172746] text-foreground dark:text-[#EAEAF0] hover:bg-muted dark:hover:bg-[#243F6B]"
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
            className="h-8 w-8 p-0 border-border dark:border-[#D7B66D]/30 bg-card dark:bg-[#172746] text-foreground dark:text-[#EAEAF0] hover:bg-muted dark:hover:bg-[#243F6B] disabled:opacity-40"
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
