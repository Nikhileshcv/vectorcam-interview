"use client";

import { useMemo, useState } from "react";
import { useRecords } from "../context/RecordsContext";
import type { RecordItem, RecordStatus } from "../types";

import RecordCard from "./RecordCard";
import RecordDetailDialog from "./RecordDetailDialog";
import RecordFilter from "./RecordFilter";
import RecordSummary from "./RecordSummary";
import HistoryLog from "./HistoryLog";
import { Button } from "@/components/ui/button";

export default function RecordList() {
  const {
    records,
    totalCount,
    page,
    limit,
    setPage,
    isLoading,
    error,
    refresh,
    updateRecord,
    isUpdating,
  } = useRecords();

  const [selected, setSelected] = useState<RecordItem | null>(null);
  const [filter, setFilter] = useState<"all" | RecordStatus>("all");

  const filtered = useMemo(() => {
    if (filter === "all") return records;
    return records.filter((r) => r.status === filter);
  }, [records, filter]);

  const canPrev = page > 1;
  const canNext = page * limit < totalCount;

  return (
    <div className="space-y-6">
      {/* Header + Controls */}
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Records
          </h2>
          <p className="text-sm text-muted-foreground">
            {totalCount} total • {filtered.length} showing (page {page})
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-end">
          <RecordFilter value={filter} onChange={setFilter} />
          <Button variant="ghost" onClick={refresh} disabled={isLoading}>
            {isLoading ? "Loading..." : "Reload"}
          </Button>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive">Error: {error}</p>
      ) : null}

      {/* Summary */}
      <RecordSummary />

      {/* Pagination */}
      <div className="flex items-center gap-2">
        <Button
          variant="secondary"
          onClick={() => setPage(page - 1)}
          disabled={!canPrev || isLoading}
        >
          Prev
        </Button>
        <Button
          variant="secondary"
          onClick={() => setPage(page + 1)}
          disabled={!canNext || isLoading}
        >
          Next
        </Button>
        <span className="text-sm text-muted-foreground ml-2">
          Page {page} • Showing {filtered.length} of {totalCount}
        </span>
      </div>

      {/* List */}
      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading records...</p>
      ) : filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No records match this filter.
        </p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((record) => (
            <RecordCard
              key={record.id}
              record={record}
              onSelect={setSelected}
            />
          ))}
        </div>
      )}

      {/* Dialog */}
      {selected ? (
        <RecordDetailDialog
          key={selected.id}
          record={selected}
          onClose={() => setSelected(null)}
          isSaving={isUpdating(selected.id)}
          error={error}
          onSave={(updates) => updateRecord(selected.id, updates)}
        />
      ) : null}

      {/* History */}
      <HistoryLog />
    </div>
  );
}
