const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL ??
    "http://localhost:5000/api/v1";

type ApiErrorResponse = {
    success?: boolean;
    error?: {
        code?: string;
        message?: string;
    };
};

export class ApiError extends Error {
    public readonly status: number;
    public readonly code: string;

    constructor(
        status: number,
        code: string,
        message: string,
    ) {
        super(message);

        this.name = "ApiError";
        this.status = status;
        this.code = code;
    }
}

export const getAuthToken = (): string | null => {
    return localStorage.getItem("scaniq_token");
};

export const setAuthToken = (
    token: string,
): void => {
    localStorage.setItem(
        "scaniq_token",
        token,
    );
};

export const clearAuthToken = (): void => {
    localStorage.removeItem(
        "scaniq_token",
    );
};

const parseResponse = async (
    response: Response,
) => {
    const contentType =
        response.headers.get(
            "content-type",
        );

    if (
        contentType?.includes(
            "application/json",
        )
    ) {
        return response.json();
    }

    return null;
};

export const apiRequest = async <T>(
    path: string,
    options: RequestInit = {},
): Promise<T> => {
    const token = getAuthToken();

    const headers = new Headers(
        options.headers,
    );

    headers.set(
        "Content-Type",
        "application/json",
    );

    if (token) {
        headers.set(
            "Authorization",
            `Bearer ${token}`,
        );
    }

    let response: Response;

    try {
        response = await fetch(
            `${API_BASE_URL}${path}`,
            {
                ...options,
                headers,
                signal:
                    options.signal ??
                    AbortSignal.timeout(15000),
            },
        );
    } catch (error) {
        if (
            error instanceof DOMException &&
            error.name === "TimeoutError"
        ) {
            throw new ApiError(
                408,
                "REQUEST_TIMEOUT",
                "Request timed out. Please try again.",
            );
        }

        throw new ApiError(
            0,
            "NETWORK_ERROR",
            "Unable to connect to ScanIQ. Please check your internet connection.",
        );
    }

    const data =
        await parseResponse(response);

    if (!response.ok) {
        const errorData =
            data as
            | ApiErrorResponse
            | null;

        const code =
            errorData?.error?.code ??
            "API_ERROR";

        const message =
            errorData?.error?.message ??
            "Something went wrong. Please try again.";

        if (response.status === 401) {
            clearAuthToken();
        }

        throw new ApiError(
            response.status,
            code,
            message,
        );
    }

    return data as T;
};