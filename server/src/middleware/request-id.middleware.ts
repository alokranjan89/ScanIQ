import { randomUUID } from "crypto";
import {
    Request,
    Response,
    NextFunction,
} from "express";

const REQUEST_ID_REGEX =
    /^[a-zA-Z0-9._:-]{1,128}$/;

export const requestIdMiddleware = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const incomingRequestId =
        req.headers["x-request-id"];

    const requestId =
        typeof incomingRequestId === "string" &&
        REQUEST_ID_REGEX.test(incomingRequestId)
            ? incomingRequestId
            : randomUUID();

    req.requestId = requestId;

    res.setHeader(
        "X-Request-ID",
        requestId
    );

    next();
};