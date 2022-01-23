import dotenv from "dotenv";
dotenv.config();
// Export your environment variables here
export const IS_PROD = process.env.NODE_ENV === "production";
export const IS_TEST = process.env.NODE_ENV === "test";
export const IS_DEV = !IS_PROD && !IS_TEST;
export const PORT = Number(process.env.PORT || 3001);
export const JWT_SECRET = process.env.JWT_SECRET!;
