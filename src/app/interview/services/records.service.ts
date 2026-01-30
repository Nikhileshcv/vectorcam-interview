import type { RecordItem, RecordStatus } from "../types";

const RECORDS_API = "/api/mock/records";

type VersionConflictError = Error & {
    conflict?: {
        error: "version_conflict";
        serverRecord: RecordItem;
    };
};


async function parseError(response: Response): Promise<string> {
    const fallback = `Request failed: ${response.status} ${response.statusText}`;
    try {
        const text = await response.text();
        return text ? `${fallback} — ${text}` : fallback;
    } catch {
        return fallback;
    }
}

export async function fetchRecords(params: {
    page: number; // 1-based
    limit: number;
}): Promise<{ records: RecordItem[]; totalCount: number }> {
    const url = new URL(RECORDS_API, window.location.origin);
    url.searchParams.set("page", String(params.page));
    url.searchParams.set("limit", String(params.limit));

    const res = await fetch(url.toString(), { method: "GET" });
    if (!res.ok) throw new Error(await parseError(res));
    return (await res.json()) as { records: RecordItem[]; totalCount: number };
}

export async function patchRecord(params: {
    id: string;
    status?: RecordStatus;
    note?: string;
    version: number;
}): Promise<RecordItem> {
    const res = await fetch(RECORDS_API, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params),
    });

    if (res.status === 409) {
        const body = (await res.json()) as VersionConflictError["conflict"];
        const err: VersionConflictError = new Error("version_conflict");
        err.conflict = body;
        throw err;
    }


    if (!res.ok) throw new Error(await parseError(res));
    return (await res.json()) as RecordItem;
}
