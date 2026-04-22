import { z } from "zod";

export const TccBaseSchema = z.object({
  titulo: z.string().min(3),
  autor: z.string().min(3),
  orientador: z.string().min(3),
  curso: z.string().min(2),
  ano: z.coerce.number().int().min(1900).max(2100),
  resumo: z.string().min(10),
  palavras_chave: z
    .string()
    .optional()
    .transform((v) =>
      (v ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
    ),
});

export type TccBaseInput = z.input<typeof TccBaseSchema>;

