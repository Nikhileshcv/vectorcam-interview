"use client";

import { useMemo, useState } from "react";
import type { RecordItem, RecordStatus } from "../types";
import { validateReview, requiresNote } from "../utilis/validation";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";

interface RecordDetailDialogProps {
  record: RecordItem;
  onClose: () => void;
  onSave: (updates: { status: RecordStatus; note?: string }) => Promise<void>;
  isSaving?: boolean;
  error?: string | null;
}

export default function RecordDetailDialog({
  record,
  onClose,
  onSave,
  isSaving = false,
  error = null,
}: RecordDetailDialogProps) {
  const [status, setStatus] = useState<RecordStatus>(record.status);
  const [note, setNote] = useState<string>(record.note ?? "");
  const [localError, setLocalError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const statusOptions: RecordStatus[] = useMemo(
    () => ["pending", "approved", "flagged", "needs_revision"],
    [],
  );

  const validationError = validateReview(status, note);
  const canSave =
    !isSaving &&
    !validationError &&
    (status !== record.status || (note ?? "") !== (record.note ?? ""));

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg tracking-tight">
            {record.name}
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {record.description}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select
              value={status}
              onValueChange={(value) => {
                setStatus(value as RecordStatus);
                setLocalError(null);
                setSuccessMsg(null);
              }}
              disabled={isSaving}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Reviewer note{" "}
              {requiresNote(status) ? (
                <span className="text-destructive">*</span>
              ) : null}
            </label>

            <Textarea
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setLocalError(null);
                setSuccessMsg(null);
              }}
              placeholder="Add a note..."
              className="min-h-24"
              disabled={isSaving}
            />

            {validationError ? (
              <p className="mt-1 text-sm text-destructive">{validationError}</p>
            ) : (
              <p className="mt-1 text-xs text-muted-foreground">
                Notes are required for Flagged / Needs Revision.
              </p>
            )}
          </div>

          {localError ? (
            <p className="text-sm text-destructive">Error: {localError}</p>
          ) : null}
          {error ? (
            <p className="text-sm text-destructive">Error: {error}</p>
          ) : null}
          {successMsg ? (
            <p className="text-sm text-green-600">{successMsg}</p>
          ) : null}
        </div>

        <DialogFooter className="mt-6">
          <Button variant="secondary" onClick={onClose} disabled={isSaving}>
            Close
          </Button>
          <Button
            variant="default"
            disabled={!canSave}
            onClick={async () => {
              const vErr = validateReview(status, note);
              if (vErr) {
                setLocalError(vErr);
                return;
              }

              try {
                await onSave({ status, note: note.trim() ? note : undefined });
                setSuccessMsg("Saved successfully.");
                onClose(); // close ONLY on success
              } catch (e) {
                setLocalError(
                  e instanceof Error ? e.message : "Failed to save changes.",
                );
              }
            }}
          >
            {isSaving ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
