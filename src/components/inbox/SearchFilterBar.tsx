"use client";

import { useState } from "react";

export type SearchFilters = {
  from?: string;
  hasAttachment?: boolean;
  dateRange?: "today" | "week" | "month" | "year" | "";
};

type SearchFilterBarProps = {
  filters: SearchFilters;
  onChange: (filters: SearchFilters) => void;
};

export function SearchFilterBar({ filters, onChange }: SearchFilterBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const hasActiveFilters =
    filters.from || filters.hasAttachment || filters.dateRange;

  const clearFilters = () => {
    onChange({});
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors ${
          hasActiveFilters
            ? "border-accent bg-accent/10 text-accent"
            : "border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
        }`}
      >
        <i className="fa-solid fa-sliders h-4 w-4" aria-hidden />
        Filters
        {hasActiveFilters && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-xs text-white">
            {Object.values(filters).filter(Boolean).length}
          </span>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-10 z-50 w-72 rounded-xl border border-slate-200 bg-white p-4 shadow-lg dark:border-neutral-700 dark:bg-neutral-800">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-900 dark:text-neutral-100">
                Search filters
              </h3>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="text-xs text-accent hover:underline"
                >
                  Clear all
                </button>
              )}
            </div>

            <div className="space-y-4">
              {/* From filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-neutral-400">
                  From
                </label>
                <input
                  type="text"
                  value={filters.from ?? ""}
                  onChange={(e) =>
                    onChange({ ...filters, from: e.target.value || undefined })
                  }
                  placeholder="Sender name or email"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-colors focus:border-accent dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                />
              </div>

              {/* Date range filter */}
              <div>
                <label className="mb-1.5 block text-xs font-medium text-slate-600 dark:text-neutral-400">
                  Date range
                </label>
                <select
                  value={filters.dateRange ?? ""}
                  onChange={(e) =>
                    onChange({
                      ...filters,
                      dateRange: (e.target.value as SearchFilters["dateRange"]) || undefined,
                    })
                  }
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none transition-colors focus:border-accent dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                >
                  <option value="">Any time</option>
                  <option value="today">Today</option>
                  <option value="week">This week</option>
                  <option value="month">This month</option>
                  <option value="year">This year</option>
                </select>
              </div>

              {/* Has attachment filter */}
              <div className="flex items-center justify-between">
                <label className="text-sm text-slate-700 dark:text-neutral-300">
                  Has attachment
                </label>
                <button
                  type="button"
                  role="switch"
                  aria-checked={filters.hasAttachment ?? false}
                  onClick={() =>
                    onChange({
                      ...filters,
                      hasAttachment: !filters.hasAttachment,
                    })
                  }
                  className={`relative h-5 w-9 shrink-0 rounded-full transition-colors ${
                    filters.hasAttachment
                      ? "bg-accent"
                      : "bg-slate-300 dark:bg-neutral-700"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${
                      filters.hasAttachment ? "left-[18px]" : "left-0.5"
                    }`}
                  />
                </button>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 w-full rounded-lg bg-accent py-2 text-sm font-medium text-white transition-colors hover:bg-accent-dark"
            >
              Apply filters
            </button>
          </div>
        </>
      )}
    </div>
  );
}
