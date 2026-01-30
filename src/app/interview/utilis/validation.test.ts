import { validateReview } from "./validation";

test("requires note for flagged", () => {
    expect(validateReview("flagged", "")).toBeTruthy();
    expect(validateReview("flagged", "  ")).toBeTruthy();
    expect(validateReview("flagged", "reason")).toBeNull();
});

test("note optional for approved", () => {
    expect(validateReview("approved", "")).toBeNull();
});
