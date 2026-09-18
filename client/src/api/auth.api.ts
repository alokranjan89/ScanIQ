import {
    apiRequest,
    setAuthToken,
    clearAuthToken,
} from "./client";

import type {
    AuthResponse,
    MeResponse,
} from "../types/api";

type RegisterPayload = {
    name: string;
    email: string;
    password: string;
};

type LoginPayload = {
    email: string;
    password: string;
};

/**
 * Actual backend authentication response:
 *
 * {
 *   data: {
 *     user: {...},
 *     accessToken: "..."
 *   }
 * }
 */
type AuthApiResponse = {
    data: AuthResponse;
};

export const register = async (
    payload: RegisterPayload,
): Promise<AuthResponse> => {
    const response =
        await apiRequest<AuthApiResponse>(
            "/auth/register",
            {
                method: "POST",
                body: JSON.stringify(payload),
            },
        );

    setAuthToken(response.data.accessToken);

    return response.data;
};

export const login = async (
    payload: LoginPayload,
): Promise<AuthResponse> => {
    const response =
        await apiRequest<AuthApiResponse>(
            "/auth/login",
            {
                method: "POST",
                body: JSON.stringify(payload),
            },
        );

    setAuthToken(response.data.accessToken);

    return response.data;
};

type MeApiResponse = {
    data: MeResponse;
};

export const getCurrentUser =
    async (): Promise<MeResponse> => {
        const response =
            await apiRequest<MeApiResponse>(
                "/auth/me",
            );
        return response.data;
    };

export const logout = async (): Promise<void> => {
    try {
        await apiRequest("/auth/logout", {
            method: "POST",
        });
    } finally {
        clearAuthToken();
    }
};