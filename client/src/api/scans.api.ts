import { apiRequest } from "./client";

import type {
    ScanHistoryItem,
} from "../types/api";

type ScansApiResponse = {
    data: ScanHistoryItem[];
};

type CreateScanResponse = {
    data: ScanHistoryItem;
};

export const getScanHistory = async (): Promise<ScanHistoryItem[]> => {
    const response =
        await apiRequest<ScansApiResponse>(
            "/scans",
        );

    return response.data;
};

export const createScanHistory = async (
    productId: number,
    scannedCode: string,
): Promise<ScanHistoryItem> => {
    const response =
        await apiRequest<CreateScanResponse>(
            "/scans",
            {
                method: "POST",
                body: JSON.stringify({
                    productId,
                    scannedCode,
                }),
            },
        );

    return response.data;
};

export const deleteScanHistory = async (
    scanId: number,
): Promise<void> => {
    await apiRequest(
        `/scans/${scanId}`,
        {
            method: "DELETE",
        },
    );
};