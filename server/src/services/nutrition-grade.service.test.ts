import { describe, expect, it } from "vitest";
import {
    calculateNutritionGrade,
} from "./nutrition-grade.service.js";

describe("calculateNutritionGrade", () => {
    it("returns A for a nutritionally favorable product", () => {
        const result = calculateNutritionGrade({
            calories: 100,
            sugars: 2,
            saturatedFat: 1,
            sodium: 100,
            fiber: 6,
            protein: 10,
            unit: "per_100g",
        });

        expect(result.calculated).toBe(true);
        expect(result.grade).toBe("A");
        expect(result.score).toBe(0);
        expect(result.warnings).toHaveLength(0);
    });

    it("returns a lower grade when negative nutrients are high", () => {
        const result = calculateNutritionGrade({
            calories: 650,
            sugars: 30,
            saturatedFat: 10,
            sodium: 900,
            fiber: 1,
            protein: 2,
            unit: "per_100g",
        });

        expect(result.calculated).toBe(true);
        expect(result.grade).toBe("E");
        expect(result.score).toBeGreaterThan(9);
    });

    it("creates a high sugar warning", () => {
        const result = calculateNutritionGrade({
            calories: 200,
            sugars: 30,
            saturatedFat: 2,
            sodium: 150,
            fiber: 4,
            protein: 5,
        });

        expect(result.warnings).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    code: "HIGH_SUGAR",
                    title: "High sugar",
                }),
            ])
        );
    });

    it("creates a high sodium warning", () => {
        const result = calculateNutritionGrade({
            calories: 200,
            sugars: 5,
            saturatedFat: 2,
            sodium: 700,
            fiber: 4,
            protein: 5,
        });

        expect(result.warnings).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    code: "HIGH_SODIUM",
                    title: "High sodium",
                }),
            ])
        );
    });

    it("does not calculate a grade when nutrition data is insufficient", () => {
        const result = calculateNutritionGrade({
            calories: 200,
            sugars: 5,
        });

        expect(result.calculated).toBe(false);
        expect(result.grade).toBeNull();
        expect(result.score).toBeNull();
        expect(result.dataCompleteness.percentage).toBeLessThan(
            60
        );
        expect(result.warnings).toHaveLength(0);
    });

    it("does not treat missing data as a bad grade", () => {
        const result = calculateNutritionGrade({
            calories: 500,
            sugars: 30,
            saturatedFat: null,
            sodium: null,
            fiber: null,
        });

        expect(result.calculated).toBe(false);
        expect(result.grade).toBeNull();
    });

    it("reports nutrition data completeness", () => {
        const result = calculateNutritionGrade({
            calories: 200,
            sugars: 5,
            saturatedFat: 2,
            sodium: 100,
            fiber: 3,
        });

        expect(result.dataCompleteness.available).toBe(5);
        expect(result.dataCompleteness.required).toBe(5);
        expect(result.dataCompleteness.percentage).toBe(100);
    });
});