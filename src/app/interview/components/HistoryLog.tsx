import { useRecords } from "../context/RecordsContext";
import { Button } from "@/components/ui/button";

export default function HistoryLog() {
  const { history, clearHistory } = useRecords();

  return (
    <div className="space-y-3 mt-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">History</h3>
        {history.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearHistory}>
            Clear
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <p className="text-muted-foreground text-sm">No status changes yet.</p>
      ) : (
        <ul className="space-y-2 max-h-60 overflow-y-auto pr-2">
          {history.map((entry, idx) => (
            <li key={idx} className="text-sm border rounded-md p-2 bg-card">
              <div className="flex justify-between items-center">
                <span className="font-medium">Record {entry.id}</span>
                <span className="text-xs text-muted-foreground">
                  {new Date(entry.timestamp).toLocaleString()}
                </span>
              </div>
              <div className="mt-1 text-xs">
                {entry.previousStatus} → {entry.newStatus}
              </div>
              {entry.note && (
                <p className="text-xs text-muted-foreground mt-1">
                  Note: {entry.note}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-muted-foreground">
        Production note: for very large logs, store entries server-side (DB),
        paginate/virtualize the UI, and index by record id + timestamp.
      </p>
    </div>
  );
}
