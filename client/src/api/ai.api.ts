import { apiRequest } from "./client";

export type ExplainProductResponse = {
    productId: number;
    question: string;
    explanation: string;
};

type ExplainProductApiResponse = {
    data: ExplainProductResponse;
};

export const explainProduct = async (
    productId: number,
    question: string,
): Promise<ExplainProductResponse> => {
    const response =
        await apiRequest<ExplainProductApiResponse>(
            "/ai/explain",
            {
                method: "POST",
                body: JSON.stringify({
                    productId,
                    question,
                }),
            },
        );

    return response.data;
};