"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { RecordHistoryEntry, RecordItem, RecordStatus } from "../types";
import { fetchRecords, patchRecord } from "../services/records.service";

type RecordUpdates = { status?: RecordStatus; note?: string };

interface RecordsContextValue {
  // paged list
  records: RecordItem[];
  totalCount: number;
  page: number;
  limit: number;
  setPage: (page: number) => void;

  isLoading: boolean;
  error: string | null;

  refresh: () => Promise<void>;

  updateRecord: (id: string, updates: RecordUpdates) => Promise<void>;
  isUpdating: (id: string) => boolean;

  history: RecordHistoryEntry[];
  clearHistory: () => void;
}

const RecordsContext = createContext<RecordsContextValue | undefined>(
  undefined,
);

export function RecordsProvider({ children }: { children: React.ReactNode }) {
  const [records, setRecords] = useState<RecordItem[]>([]);
  const [totalCount, setTotalCount] = useState(0);

  const [page, setPage] = useState(1);
  const [limit] = useState(12);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [history, setHistory] = useState<RecordHistoryEntry[]>([]);
  const [updatingIds, setUpdatingIds] = useState<Set<string>>(new Set());

  const isUpdating = useCallback(
    (id: string) => updatingIds.has(id),
    [updatingIds],
  );

  const refresh = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { records: pageRecords, totalCount: tc } = await fetchRecords({
        page,
        limit,
      });
      setRecords(pageRecords);
      setTotalCount(tc);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setIsLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const updateRecord = useCallback(
    async (id: string, updates: RecordUpdates) => {
      setError(null);
      setUpdatingIds((prev) => new Set(prev).add(id));

      try {
        // find current record in current page slice
        const prevRecord = records.find((r) => r.id === id);
        if (!prevRecord) {
          // record might not be on this page; safest is refresh
          await refresh();
          return;
        }

        const updated = await patchRecord({
          id,
          ...updates,
          version: prevRecord.version,
        });

        // update paged list
        setRecords((prev) => prev.map((r) => (r.id === id ? updated : r)));

        // history entry only when status changes
        if (updates.status && prevRecord.status !== updates.status) {
          const entry: RecordHistoryEntry = {
            id,
            previousStatus: prevRecord.status,
            newStatus: updates.status,
            note: updates.note,
            timestamp: new Date().toISOString(),
          };
          // most recent first
          setHistory((h) => [entry, ...h]);
        }
      } catch (e: unknown) {
        if (
          e instanceof Error &&
          e.message === "version_conflict" &&
          (e as Error & { conflict?: { serverRecord?: RecordItem } }).conflict
            ?.serverRecord
        ) {
          const serverRecord = (
            e as Error & {
              conflict: { serverRecord: RecordItem };
            }
          ).conflict.serverRecord;

          setRecords((prev) =>
            prev.map((r) => (r.id === serverRecord.id ? serverRecord : r)),
          );

          setError(
            "This record was updated elsewhere. We refreshed it with the latest server version.",
          );
          return;
        }

        setError(e instanceof Error ? e.message : "Unknown error");
        throw e;
      } finally {
        setUpdatingIds((prev) => {
          const next = new Set(prev);
          next.delete(id);
          return next;
        });
      }
    },
    [records, refresh],
  );

  const clearHistory = useCallback(() => setHistory([]), []);

  const value = useMemo<RecordsContextValue>(
    () => ({
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

      history,
      clearHistory,
    }),
    [
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
      history,
      clearHistory,
    ],
  );

  return (
    <RecordsContext.Provider value={value}>{children}</RecordsContext.Provider>
  );
}

export function useRecords() {
  const ctx = useContext(RecordsContext);
  if (!ctx) throw new Error("useRecords must be used within a RecordsProvider");
  return ctx;
}
