import { z } from "zod";

export const linkSchema = z.object({
  originalUrl: z.string().url("URL harus valid, contoh: https://example.com"),
  domainId: z.string().trim().optional(),
  slug: z
    .string()
    .trim()
    .regex(/^[a-zA-Z0-9-_./]*$/, "Slug hanya boleh huruf, angka, -, _, . dan /")
    .max(64, "Slug maksimal 64 karakter")
    .optional(),
  suffix: z
    .string()
    .trim()
    .regex(/^(\.[a-zA-Z0-9]{1,12})?$/, "Suffix harus seperti .mp4 atau .pdf")
    .optional(),
});
