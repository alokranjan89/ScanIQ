export class ProviderError extends Error {
    constructor(
        message: string,
        public readonly provider: string
    ) {
        super(message);

        this.name = "ProviderError";
    }
}