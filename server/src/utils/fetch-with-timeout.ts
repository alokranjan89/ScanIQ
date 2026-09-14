export const fetchWithTimeout = async (
    url: string,
    options: RequestInit = {},
    timeoutMs = 5000
): Promise<Response> => {
    const controller = new AbortController();

    const timeout = setTimeout(() => {
        controller.abort();
    }, timeoutMs);

    try {
        return await fetch(url, {
            ...options,
            signal: controller.signal,
        });
    } finally {
        clearTimeout(timeout);
    }
};