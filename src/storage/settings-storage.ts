export interface AppSettings {
    security: {
        biometricsEnabled: boolean;
        twoFactorEnabled: boolean;
    };
    preferences: {
        currency: 'BRL' | 'USD' | 'EUR';
        language: 'pt-BR' | 'en-US' | 'es-ES';
        theme: 'light' | 'dark' | 'system';
    };
    notifications: {
        trainings: boolean;
        bills: boolean;
        spending: boolean;
        weeklyReport: boolean;
    };
}

const SETTINGS_KEY = 'ascend_app_settings';

export const DEFAULT_SETTINGS: AppSettings = {
    security: {
        biometricsEnabled: false,
        twoFactorEnabled: false
    },
    preferences: {
        currency: 'BRL',
        language: 'pt-BR',
        theme: 'dark' // Default dark for "premium" feel
    },
    notifications: {
        trainings: true,
        bills: true,
        spending: true,
        weeklyReport: false // Opt-in
    }
};

export function getSettings(): AppSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (!stored) return DEFAULT_SETTINGS;
    try {
        // Merge with defaults to handle new keys in future
        const parsed = JSON.parse(stored);
        return {
            ...DEFAULT_SETTINGS,
            ...parsed,
            security: { ...DEFAULT_SETTINGS.security, ...parsed.security },
            preferences: { ...DEFAULT_SETTINGS.preferences, ...parsed.preferences },
            notifications: { ...DEFAULT_SETTINGS.notifications, ...parsed.notifications }
        };
    } catch (e) {
        return DEFAULT_SETTINGS;
    }
}

export function saveSettings(settings: AppSettings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    // Apply Theme Helper
    if (settings.preferences.theme === 'dark') {
        document.documentElement.classList.add('dark');
    } else if (settings.preferences.theme === 'light') {
        document.documentElement.classList.remove('dark');
    }
}
