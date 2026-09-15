export interface AIProvider {
    generateText(prompt: string): Promise<string>;
}