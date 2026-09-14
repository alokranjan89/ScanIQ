const ingredientSplitPattern = /[,;\n]+|\s+\(.*?\)\s*|\s+and\s+/gi;

export const parseIngredients = (
    rawIngredients?: string
): Array<{ name: string; description?: string }> => {
    if (!rawIngredients) {
        return [];
    }

    const cleaned = rawIngredients
        .replace(/\([^)]*\)/g, " ")
        .replace(/\b(?:contains|may contain|trace|traces)\b.*$/gi, "")
        .replace(/\s+/g, " ")
        .trim();

    if (!cleaned) {
        return [];
    }

    const items = cleaned
        .split(ingredientSplitPattern)
        .map((ingredient) => ingredient.trim())
        .filter(Boolean)
        .filter(
            (ingredient) =>
                !/^\d+%$/.test(ingredient) &&
                !/^\d+\s*%\s*/.test(ingredient)
        );

    return [...new Set(items)].map((ingredient) => ({
        name: ingredient.replace(/[.,;]+$/g, "").trim(),
    }));
};