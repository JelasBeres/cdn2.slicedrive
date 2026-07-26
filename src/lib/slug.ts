import { customAlphabet } from "nanoid";

export const generateSlug = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  6,
);

export const RESERVED_SLUGS = new Set(["admin", "api", "_next", "login"]);
