# Interview Review & Annotation Dashboard

## Project Structure

The src/interview/ folder is organized as a feature-based module, meaning everything related to the interview task lives in one place.

```txt
src/interview/
├── components/     # UI components (container + presentational)
├── context/        # Shared application state and actions
├── hooks/          # Derived state and reusable logic
├── services/       # API access (service / repository layer)
├── types/          # Shared domain types
└── utils/          # Stateless helper utilities
```

This structure makes the codebase:

- Easier to navigate
- Easier to review in an interview
- Easier to extend without touching unrelated areas

1. Responsibility Boundaries
Context — What lives here and why?
The Context is responsible for shared, long-lived application state and for exposing intent-based actions that describe what the app can do, not how it does it.

In this implementation, **RecordsContext** owns:
- records
- isLoading
- error
- history

It exposes actions such as:
- refresh()
- updateRecord()

Why this is correct:
- Multiple components need access to the same record data
- State must stay consistent across list, summary, history, and dialog
- Context acts as the single source of truth
- 
API calls and UI concerns are intentionally kept out of Context to avoid tight coupling and make the logic easier to test and evolve.

**Hooks — What problem do hooks solve here?**

Hooks encapsulate derived state and reusable logic that can be computed from existing data.
In this project, hooks are used for:
- Filtering records by status
- Computing summary counts

Key principle:
- Hooks do not own state — they derive it.
This keeps components simple and prevents duplication of logic across the UI.

**Components — What is their responsibility?**
Components focus on rendering UI and handling user interaction.
In this implementation:
- RecordList
  - acts as a container component
  - Wires Context, hooks, and UI together
- RecordCard, RecordDetailDialog, HistoryLog, and RecordFilter
  - Are presentational components
  - Receive data and callbacks via props
  - Do not manage global state
This separation improves readability and makes components easier to reason about and reuse.

**Utilities — Why keep them minimal?**
Utilities contain pure, stateless helper logic with no React dependency.

Examples include:
- Status → label or badge mappings
- Validation and formatting helpers

They are intentionally kept minimal to avoid unnecessary abstraction and keep the codebase pragmatic.

**2. State, Derived State, and Side-Effects**
Before Refactoring

Several concerns were mixed together:
- Context handled state, API calls, and derived logic
- Components recomputed summary counts and duplicated history UI
- Dialog synchronized props to local state using useEffect, causing warnings and unnecessary re-renders
This made the data flow harder to follow and increased the risk of bugs.

**After Refactoring**
Responsibilities are clearly separated:
- State lives in Context
- Side-effects (API calls) are isolated in the service layer
- Derived state (filters, counts) is computed in hooks
- Dialog state is reset via key-based remounting, not effects

Result:
- Predictable data flow
- Fewer re-renders
- No cascading updates
- Easier debugging

**3. Design Patterns Applied**
Service / Repository Pattern
- All API access lives in records.service.ts
- Context coordinates data flow without knowing HTTP details

**Benefit:**
- Clear separation between business logic and infrastructure.

**Container / Presenter Separation**
- Container components orchestrate data and actions
- Presentational components focus purely on UI

**Benefit:**
- Reduces duplication, clarifies ownership, and simplifies components.

**Derived-State Hooks**
- Filtering and summary logic moved out of components
- Logic is reusable and consistent across the UI

**Benefit**:
- Less code repetition and clearer intent.

**4. Feature-Based Folder Structure**

All interview-related code lives under a single directory:

```txt
src/interview/
├── components/
├── context/
├── hooks/
├── services/
├── types/
```

Why this matters:
- The feature is self-contained
- New developers (or interviewers) can understand it quickly
- Scaling the feature does not impact unrelated parts of the app

## Phase 2 – Extend & Design
**Overview**
Phase 2 focuses on extending the workflow while preserving clean architecture and predictable data flow.

**Review Actions**
- Status updates are performed via the detail dialog dropdown
- Validation enforces a non-empty note for:
  - Flagged and Needs Revision
- Updates are persisted via PATCH and immediately reflected in:
  - Record list
  - Summary counts
  - History log

This ensures consistency across the entire UI.

**Optimistic Updates & Concurrency**
- Updates are applied optimistically for better responsiveness
- Each PATCH includes a monotonically increasing version
- On 409 Conflict, the UI:
  - Reverts to the server’s version
  - Displays a clear message to the user
This balances user experience with data integrity.

**Filtering**
- Status filtering is implemented as derived state using useMemo
- Records automatically enter or leave the filtered view when their status changes
- Filter state is preserved across updates and pagination

**Summary**
- Counts per status are computed reactively
- Zero counts and empty states are handled gracefully

**History**
Each status change appends an in-memory history entry containing:
- Record ID
- Previous → new status
- Timestamp
- Optional note
Entries are displayed most-recent first in a scrollable list

**Production note:**
- For large logs, history should be persisted server-side and paginated or virtualized.

**Pagination**
- Server supports page (1-based) and limit
- Client renders Prev/Next controls with correct disabling
- Filtering and summary remain consistent across pages

**Design Tradeoffs (Why these choices?)**
- Context owns source-of-truth state and coordinates side-effects
- Hooks handle derived state (filters, summaries)
- Components focus on rendering and interaction
- Utilities isolate pure validation and formatting logic
- Changes are intentionally small, reversible, and easy to reason about
