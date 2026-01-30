Project Structure
src/interview/
├── components/ # UI components (container + presentational)
├── context/ # Shared application state and actions
├── hooks/ # Derived state and reusable logic
├── services/ # API access (service / repository layer)
├── types/ # Shared domain types
└── utils/ # Stateless helper utilities

The interview module is organized as a self-contained feature, making responsibilities clear and the codebase easy to navigate.

1. Responsibility Boundaries
   Context

Owns shared, long-lived application state and exposes intent-based actions.

In this implementation:

RecordsContext manages records, isLoading, error, and history.

Exposes actions such as refresh() and updateRecord().

API calls and UI concerns are intentionally kept out of Context.

Hooks

Encapsulate derived state and reusable logic.

Used for:

Filtering records by status

Computing summary counts

Hooks derive values from existing state instead of owning it.

Components

Responsible for rendering UI and handling user interaction.

RecordList acts as a container that wires context, hooks, and UI together.

RecordCard, RecordDetailDialog, HistoryLog, and RecordFilter are presentational components focused on display and interaction.

Utilities

Contain pure, stateless helper logic with no React dependency.

Used sparingly for:

Status → label / badge mappings

Validation and formatting helpers

Kept minimal to avoid over-engineering.

2. State, Derived State, and Side-Effects
   Before refactoring

Context mixed state, API side-effects, and derived logic.

Components recomputed summaries and duplicated history rendering.

Dialog state was synchronized via useEffect, causing unnecessary re-renders.

After refactoring

State lives in Context.

Side-effects (API access) are isolated in a service layer.

Derived state (filters, counts) is computed in hooks.

Dialog state is reset via key-based remounting instead of effects.

This separation makes data flow predictable and avoids cascading renders.

3. Design Patterns Applied
   Service / Repository Pattern

API access is isolated in records.service.ts.

Context coordinates data flow without managing HTTP logic.

Container / Presenter Separation

Container components orchestrate data and actions.

Presentational components focus purely on UI.

This reduces duplication and clarifies ownership.

Derived-State Hooks

Filtering and summary logic moved out of components.

Improves reuse and keeps components simple.

These patterns improve clarity without introducing unnecessary abstraction.

4. Feature-Based Folder Structure

All interview-related code lives under a single feature directory:

src/interview/
├── components/
├── context/
├── hooks/
├── services/
├── types/

This makes the module self-contained and easier to reason about during reviews or interviews.

Phase 2 – Extend & Design
Overview

Phase 2 extends the review workflow with validated status updates, filtering, summary counts, history tracking, and optional pagination and concurrency handling. The focus is on clear reasoning, predictable data flow, and pragmatic design tradeoffs.

Review Actions

Status updates are performed via the detail dialog dropdown.

A non-empty note is required for Flagged and Needs Revision.

Updates are persisted via PATCH and reflected immediately in:

Record list

Summary counts

History log

Optimistic Updates & Concurrency

Updates are applied optimistically for better perceived responsiveness.

Each PATCH request includes a monotonically increasing version.

On a 409 Conflict, the UI reverts to the server’s version and displays a clear message.

This balances user experience with data integrity.

Filtering

Status filtering is implemented as derived state using useMemo.

Records automatically enter or leave the filtered view when their status changes.

Filter state is preserved across updates and pagination.

Summary

Counts per status are computed reactively from the current records slice.

Zero counts and empty states are handled gracefully.

History

Each status change appends an in-memory history entry containing:

Record ID

Previous → new status

Timestamp

Optional note

Entries are displayed most-recent first in a scrollable list.

Production note: for large logs, history should be persisted server-side and paginated or virtualized.

Pagination

The server supports page (1-based) and limit.

The client renders Prev/Next controls with correct disabling.

Filtering and summary remain consistent across pages.

Design Tradeoffs

Context owns source-of-truth state and coordinates side-effects.

Hooks handle derived state such as filters and summaries.

Components focus on rendering and interaction.

Utilities isolate pure validation and formatting logic.

Changes are intentionally small, reversible, and easy to reason about.
