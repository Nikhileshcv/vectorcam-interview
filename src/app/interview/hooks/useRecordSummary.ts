import { useMemo } from "react";
import type { RecordItem, RecordStatus } from "../types";

export function useRecordSummary(records: RecordItem[]) {
    return useMemo(() => {
        const counts: Record<RecordStatus, number> = {
            pending: 0,
            approved: 0,
            flagged: 0,
            needs_revision: 0,
        };

        for (const r of records) counts[r.status] += 1;
        return counts;
    }, [records]);
}
