import "dotenv/config";

const port = Number(process.env.PORT) || 5000;

export const env = {
    port,
};