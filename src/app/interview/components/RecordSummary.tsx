import { useRecords } from "../context/RecordsContext";
import type { RecordStatus } from "../types";
import { useRecordSummary } from "../hooks/useRecordSummary";

/**
 * RecordSummary computes derived counts by status from the current record set.
 * Derived logic lives in a hook for reuse and clarity.
 */
export default function RecordSummary() {
  const { records } = useRecords();
  const counts = useRecordSummary(records);

  const statuses: RecordStatus[] = [
    "pending",
    "approved",
    "flagged",
    "needs_revision",
  ];

  return (
    <section aria-label="Record status summary" className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h3 className="text-base sm:text-lg font-semibold tracking-tight">
          Summary
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Counts by review status
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {statuses.map((status) => {
          const count = counts[status] ?? 0;
          return (
            <div
              key={status}
              className="rounded-lg border bg-card/50 p-3 sm:p-4 flex flex-col items-center justify-center shadow-sm hover:bg-card transition-colors"
            >
              <span className="text-xs sm:text-sm font-medium capitalize text-muted-foreground">
                {status.replace("_", " ")}
              </span>
              <span
                className="text-xl sm:text-2xl font-bold mt-1 tracking-tight"
                aria-label={`${status} count`}
              >
                {count}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
