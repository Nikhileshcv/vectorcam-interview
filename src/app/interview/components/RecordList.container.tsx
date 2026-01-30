"use client";

import { useMemo, useState } from "react";
import { useRecords } from "../context/RecordsContext";
import type { RecordItem } from "../types";

import RecordDetailDialog from "./RecordDetailDialog";
import RecordListView from "./RecordList.view";

import {
  useFilteredRecords,
  type RecordStatusFilter,
} from "../hooks/useFilteredRecords";

export default function RecordListContainer() {
  const { records, isLoading, error, refresh, updateRecord, isUpdating } =
    useRecords();

  const [selected, setSelected] = useState<RecordItem | null>(null);
  const [filter, setFilter] = useState<RecordStatusFilter>("all");

  const filteredRecords = useFilteredRecords(records, filter);

  const selectedIsSaving = selected ? isUpdating(selected.id) : false;

  // Keep dialog record fresh if list updates
  const selectedLive = useMemo(() => {
    if (!selected) return null;
    return records.find((r) => r.id === selected.id) ?? selected;
  }, [records, selected]);

  return (
    <>
      <RecordListView
        records={filteredRecords}
        totalCount={records.length}
        filter={filter}
        onFilterChange={setFilter}
        isLoading={isLoading}
        error={error}
        onRefresh={refresh}
        onSelect={setSelected}
      />

      {selectedLive ? (
        <RecordDetailDialog
          record={selectedLive}
          onClose={() => setSelected(null)}
          isSaving={selectedIsSaving}
          error={error}
          onSave={(updates) => updateRecord(selectedLive.id, updates)}
        />
      ) : null}
    </>
  );
}
