import { ProviderError } from "./provider-error.js";

const DEFAULT_TIMEOUT_MS = 5000;

export const fetchJson = async <T>(
    url: string,
    provider: string,
    options: RequestInit = {},
    timeoutMs = DEFAULT_TIMEOUT_MS
): Promise<T> => {
    const controller = new AbortController();
    const timeout = setTimeout(
        () => controller.abort(),
        timeoutMs
    );

    let response: Response;

    try {
        response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
    } catch (error) {
        throw new ProviderError(
            error instanceof DOMException &&
                error.name === "AbortError"
                ? `${provider} request timed out`
                : `${provider} network request failed`,
            provider
        );
    } finally {
        clearTimeout(timeout);
    }

    if (!response.ok) {
        throw new ProviderError(
            `${provider} request failed with status ${response.status}`,
            provider
        );
    }

    try {
        return (await response.json()) as T;
    } catch (error) {
        throw new ProviderError(
            `${provider} returned invalid JSON`,
            provider
        );
    }
};
