export interface Category {
    id: string;
    name: string;
    color?: string;
    is_custom?: boolean;
}

export const DEFAULT_CATEGORIES: Category[] = [
    { id: "food", name: "Alimentação", color: "#EBFF57" },
    { id: "transport", name: "Transporte", color: "#A2F7A1" },
    { id: "shopping", name: "Compras", color: "#FF6B6B" },
    { id: "home", name: "Casa", color: "#4ECDC4" },
    { id: "entertainment", name: "Lazer", color: "#9B59B6" },
    { id: "coffee", name: "Café", color: "#F39C12" },
    { id: "work", name: "Trabalho", color: "#3498DB" },
    { id: "other", name: "Outros", color: "#95A5A6" },
];

export function getCategories(): Category[] {
    try {
        const custom = JSON.parse(localStorage.getItem('custom_categories') || '[]');
        return [...DEFAULT_CATEGORIES, ...custom];
    } catch {
        return DEFAULT_CATEGORIES;
    }
}

export function addCategory(name: string): Category {
    const id = name.toLowerCase().trim().replace(/\s+/g, '_');
    // Simple random color generator for custom categories
    const colors = ["#FF6B6B", "#4ECDC4", "#9B59B6", "#F39C12", "#3498DB", "#2ECC71"];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    const newCat: Category = {
        id,
        name,
        is_custom: true,
        color: randomColor
    };

    const custom = JSON.parse(localStorage.getItem('custom_categories') || '[]');
    // Avoid duplicates
    if (!custom.some((c: Category) => c.id === id)) {
        custom.push(newCat);
        localStorage.setItem('custom_categories', JSON.stringify(custom));
    }

    return newCat;
}
