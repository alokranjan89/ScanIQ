export type UserPreferences = {
    saveHistory: boolean;
    aiExplanations: boolean;
    reduceMotion: boolean;
};

const defaults: UserPreferences = {
    saveHistory: true,
    aiExplanations: true,
    reduceMotion: false,
};

const storageKey = "scaniq_preferences";

export const loadPreferences = (): UserPreferences => {
    try {
        const stored = localStorage.getItem(storageKey);
        if (!stored) return defaults;
        const value = JSON.parse(stored) as Partial<UserPreferences>;
        return {
            saveHistory: typeof value.saveHistory === "boolean" ? value.saveHistory : defaults.saveHistory,
            aiExplanations: typeof value.aiExplanations === "boolean" ? value.aiExplanations : defaults.aiExplanations,
            reduceMotion: typeof value.reduceMotion === "boolean" ? value.reduceMotion : defaults.reduceMotion,
        };
    } catch {
        return defaults;
    }
};

export const savePreferences = (preferences: UserPreferences): void => {
    try {
        localStorage.setItem(storageKey, JSON.stringify(preferences));
    } catch {
        // Preferences remain usable for the current session when storage is unavailable.
    }
};
