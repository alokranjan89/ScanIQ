import { apiRequest } from "./client";

import type {
    ScanHistoryItem,
} from "../types/api";

type ScansApiResponse = {
    data: {
        scans: ScanHistoryItem[];
    };
};

type CreateScanResponse = {
    data: {
        scan: ScanHistoryItem;
    };
};

export const getScanHistory = async (): Promise<ScanHistoryItem[]> => {
    const response =
        await apiRequest<ScansApiResponse>(
            "/scans",
        );

    return response.data.scans;
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

    return response.data.scan;
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
