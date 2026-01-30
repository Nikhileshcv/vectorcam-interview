"use client";

import type { RecordItem } from "../types";
import type { RecordStatusFilter } from "../hooks/useFilteredRecords";

import { Button } from "@/components/ui/button";
import RecordCard from "./RecordCard";
import RecordFilter from "./RecordFilter";
import HistoryLog from "./HistoryLog";
import RecordSummary from "./RecordSummary";

interface RecordListViewProps {
  records: RecordItem[];
  totalCount: number;

  filter: RecordStatusFilter;
  onFilterChange: (value: RecordStatusFilter) => void;

  isLoading: boolean;
  error: string | null;

  onRefresh: () => void;

  onSelect: (record: RecordItem) => void;
}

export default function RecordListView({
  records,
  totalCount,
  filter,
  onFilterChange,
  isLoading,
  error,
  onRefresh,
  onSelect,
}: RecordListViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold tracking-tight">
            Records
          </h2>
          <p className="text-sm text-muted-foreground">
            {totalCount} total • {records.length} showing
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <RecordFilter value={filter} onChange={onFilterChange} />
          <Button variant="ghost" onClick={onRefresh} disabled={isLoading}>
            {isLoading ? "Loading..." : "Reload"}
          </Button>
        </div>
      </div>

      {error ? (
        <p className="text-sm text-destructive">Error: {error}</p>
      ) : null}

      <RecordSummary />

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading records...</p>
      ) : null}

      {!isLoading && records.length === 0 ? (
        <p className="text-sm text-muted-foreground">No records found.</p>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {records.map((record) => (
            <RecordCard key={record.id} record={record} onSelect={onSelect} />
          ))}
        </div>
      )}

      <HistoryLog />
    </div>
  );
}
