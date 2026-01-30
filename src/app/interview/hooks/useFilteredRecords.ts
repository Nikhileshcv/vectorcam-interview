import { useMemo } from "react";
import type { RecordItem, RecordStatus } from "../types";

export type RecordStatusFilter = "all" | RecordStatus;

export function useFilteredRecords(records: RecordItem[], filter: RecordStatusFilter) {
    return useMemo(() => {
        if (filter === "all") return records;
        return records.filter((r) => r.status === filter);
    }, [records, filter]);
}
