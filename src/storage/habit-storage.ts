export interface HabitMetadata {
    id: string;
    category: string;
    // Replaced simple fields with schedule object
    schedule: HabitSchedule;
}

export interface HabitSchedule {
    type: 'simple' | 'custom';
    // Simple Mode: Same times for all active days
    frequency: number;
    times: string[];
    activeDays: number[]; // 0=Sun, 1=Mon...

    // Custom Mode: Specific times per day
    customDays: Record<string, string[]>; // Key: "0" to "6". Value: array of times. If key missing/empty -> off.
}

export interface HabitCategory {
    id: string;
    name: string;
    color: string;
}

// Default Categories
const DEFAULT_CATEGORIES = [
    { id: "health", name: "Saúde", color: "#A2F7A1" },
    { id: "work", name: "Trabalho", color: "#3498DB" },
    { id: "learning", name: "Estudo", color: "#F39C12" },
    { id: "spiritual", name: "Espiritual", color: "#9B59B6" },
    { id: "other", name: "Outros", color: "#95A5A6" }
];

const HABIT_META_KEY = "ascend_habit_metadata";
const HABIT_CATS_KEY = "ascend_habit_categories";
const HABIT_PROGRESS_KEY = "ascend_habit_progress_";

// --- Categories ---

export function getHabitCategories(): HabitCategory[] {
    try {
        const customRaw = localStorage.getItem(HABIT_CATS_KEY);
        const custom = customRaw ? JSON.parse(customRaw) : [];
        return [...DEFAULT_CATEGORIES, ...custom];
    } catch {
        return DEFAULT_CATEGORIES;
    }
}

export function addHabitCategory(name: string): HabitCategory {
    const categories = getHabitCategories();
    // Check dupe
    const existing = categories.find(c => c.name.toLowerCase() === name.toLowerCase());
    if (existing) return existing;

    const newId = name.toLowerCase().replace(/\s+/g, '_');
    // Generate random pastel color
    const hue = Math.floor(Math.random() * 360);
    const color = `hsl(${hue}, 70%, 75%)`;

    const newCat = { id: newId, name, color };

    // Save to custom only
    try {
        const customRaw = localStorage.getItem(HABIT_CATS_KEY);
        const custom = customRaw ? JSON.parse(customRaw) : [];
        custom.push(newCat);
        localStorage.setItem(HABIT_CATS_KEY, JSON.stringify(custom));
    } catch (e) {
        console.error("Failed to save category", e);
    }

    return newCat;
}

// --- Metadata ---

export function getHabitMetadata(habitId: string): HabitMetadata | null {
    const allMeta = getAllHabitMetadata();
    return allMeta[habitId] || null;
}

export function getAllHabitMetadata(): Record<string, HabitMetadata> {
    try {
        const raw = localStorage.getItem(HABIT_META_KEY);
        return raw ? JSON.parse(raw) : {};
    } catch {
        return {};
    }
}

export function saveHabitMetadata(habitId: string, meta: Omit<HabitMetadata, 'id'>) {
    const allMeta = getAllHabitMetadata();
    allMeta[habitId] = { ...meta, id: habitId };
    localStorage.setItem(HABIT_META_KEY, JSON.stringify(allMeta));
}


// --- Progress ---

export function getDailyProgress(habitId: string, date: string): number {
    const key = HABIT_PROGRESS_KEY + date;
    try {
        const raw = localStorage.getItem(key);
        const dayData = raw ? JSON.parse(raw) : {};
        return dayData[habitId] || 0;
    } catch {
        return 0;
    }
}

export function incrementDailyProgress(habitId: string, date: string): number {
    const key = HABIT_PROGRESS_KEY + date;
    const raw = localStorage.getItem(key);
    const dayData = raw ? JSON.parse(raw) : {};

    const current = dayData[habitId] || 0;
    dayData[habitId] = current + 1;

    localStorage.setItem(key, JSON.stringify(dayData));
    return dayData[habitId];
}

export function resetDailyProgress(habitId: string, date: string) {
    const key = HABIT_PROGRESS_KEY + date;
    const raw = localStorage.getItem(key);
    const dayData = raw ? JSON.parse(raw) : {};

    if (dayData[habitId]) {
        delete dayData[habitId];
        localStorage.setItem(key, JSON.stringify(dayData));
    }
}
