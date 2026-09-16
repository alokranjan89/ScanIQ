/**
 * Validates that a given URL string uses a safe scheme (http: or https:).
 * Returns the URL string if safe, or null if invalid or unsafe (e.g. javascript:, data:, vbscript:).
 */
export function getSafeUrl(url?: string | null): string | null {
    if (!url || typeof url !== "string") {
        return null;
    }

    const trimmed = url.trim();
    if (!trimmed) {
        return null;
    }

    try {
        const parsed = new URL(trimmed);
        if (parsed.protocol === "http:" || parsed.protocol === "https:") {
            return parsed.href;
        }
        return null;
    } catch {
        return null;
    }
}

