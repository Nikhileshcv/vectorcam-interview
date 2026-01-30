import type { RecordStatus } from "../types";

export function requiresNote(status: RecordStatus) {
    return status === "flagged" || status === "needs_revision";
}

export function validateReview(status: RecordStatus, note: string) {
    if (requiresNote(status) && !note.trim()) {
        return "A note is required when setting status to Flagged or Needs Revision.";
    }
    return null;
}
