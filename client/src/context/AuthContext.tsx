import {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";
import type { ReactNode } from "react";

import {
    clearAuthToken,
    getAuthToken,
} from "../api/client";

import {
    getCurrentUser,
    login as loginApi,
    logout as logoutApi,
    register as registerApi,
} from "../api/auth.api";

import type {
    AuthResponse,
    User,
} from "../types/api";

type AuthCredentials = {
    email: string;
    password: string;
};

type RegisterCredentials = {
    name: string;
    email: string;
    password: string;
};

type AuthContextValue = {
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

    refreshUser: () => Promise<void>;
};

const AuthContext =
    createContext<AuthContextValue | undefined>(
        undefined,
    );

type AuthProviderProps = {
    children: ReactNode;
};

export function AuthProvider({
    children,
}: AuthProviderProps) {
    const [user, setUser] =
        useState<User | null>(null);

    const [isLoading, setIsLoading] =
        useState(true);

    /*
     * Restore an existing login session when
     * the application starts.
     *
     * Important:
     * We capture the token used by this request.
     * If the user logs in while /auth/me is still
     * running, we must not delete the new token.
     */
    useEffect(() => {
        let isMounted = true;

        const restoreSession = async () => {
            const tokenAtStart = getAuthToken();

            if (!tokenAtStart) {
                if (isMounted) {
                    setIsLoading(false);
                }

                return;
            }

            try {
                const response =
                    await getCurrentUser();

                if (!isMounted) {
                    return;
                }

                /*
                 * Only restore the user if the token
                 * is still the same token we started with.
                 */
                if (
                    getAuthToken() ===
                    tokenAtStart
                ) {
                    setUser(response.user);
                }
            } catch {
                if (!isMounted) {
                    return;
                }

                /*
                 * Only clear the token if the token
                 * hasn't changed since this request started.
                 *
                 * This prevents an old /auth/me 401 from
                 * deleting a freshly-created login session.
                 */
                if (
                    getAuthToken() ===
                    tokenAtStart
                ) {
                    clearAuthToken();
                    setUser(null);
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        };

        void restoreSession();

        return () => {
            isMounted = false;
        };
    }, []);

    /*
     * Login
     */
    const login = async (
        credentials: AuthCredentials,
    ): Promise<AuthResponse> => {
        const response =
            await loginApi(credentials);

        /*
         * loginApi has already stored the JWT.
         * Update the application state immediately.
         */
        setUser(response.user);

        return response;
    };

    /*
     * Register
     */
    const register = async (
        credentials: RegisterCredentials,
    ): Promise<AuthResponse> => {
        const response =
            await registerApi(credentials);

        /*
         * registerApi has already stored the JWT.
         */
        setUser(response.user);

        return response;
    };

    /*
     * Logout
     */
    const logout = async (): Promise<void> => {
        try {
            await logoutApi();
        } finally {
            setUser(null);
        }
    };

    /*
     * Refresh current user
     */
    const refreshUser = async (): Promise<void> => {
        const tokenAtStart = getAuthToken();

        if (!tokenAtStart) {
            setUser(null);
            return;
        }

        try {
            const response =
                await getCurrentUser();

            /*
             * Don't overwrite state if the token changed
             * while the request was running.
             */
            if (
                getAuthToken() ===
                tokenAtStart
            ) {
                setUser(response.user);
            }
        } catch {
            /*
             * Don't clear a newer token.
             */
            if (
                getAuthToken() ===
                tokenAtStart
            ) {
                clearAuthToken();
                setUser(null);
            }
        }
    };

    const value: AuthContextValue = {
        user,
        isAuthenticated: Boolean(user),
        isLoading,
        login,
        register,
        logout,
        refreshUser,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth(): AuthContextValue {
    const context =
        useContext(AuthContext);

    if (!context) {
        throw new Error(
            "useAuth must be used inside an AuthProvider",
        );
    }

    return context;
}