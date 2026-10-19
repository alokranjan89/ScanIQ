import {
    createContext,
} from "react";

import type {
    AuthResponse,
    User,
} from "../types/api";

export type AuthCredentials = {
    email: string;
    password: string;
};

export type RegisterCredentials = {
    name: string;
    email: string;
    password: string;
};

export type AuthContextValue = {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;

    login: (
        credentials: AuthCredentials,
    ) => Promise<AuthResponse>;

    register: (
        credentials: RegisterCredentials,
    ) => Promise<AuthResponse>;

    logout: () => Promise<void>;

    deleteAccount: (password: string) => Promise<void>;

    refreshUser: () => Promise<void>;
};

export const AuthContext =
    createContext<AuthContextValue | undefined>(
        undefined,
    );
