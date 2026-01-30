import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import RecordDetailDialog from "./RecordDetailDialog";
import type { RecordItem } from "../types";

const baseRecord: RecordItem = {
  id: "1",
  name: "Specimen A",
  description: "desc",
  status: "pending",
  version: 1,
};

describe("RecordDetailDialog", () => {
  it("blocks save when flagged without note", async () => {
    const onSave = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <RecordDetailDialog
        record={baseRecord}
        onSave={onSave}
        onClose={onClose}
      />,
    );

    fireEvent.keyDown(screen.getByRole("combobox"), { key: "ArrowDown" });
    fireEvent.click(screen.getByText("flagged"));
    fireEvent.click(screen.getByText("Save"));

    expect(onSave).not.toHaveBeenCalled();
    expect(screen.getByText(/note is required/i)).toBeInTheDocument();
  });
});
