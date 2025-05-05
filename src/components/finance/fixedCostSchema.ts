
import { z } from "zod";

export const fixedCostSchema = z.object({
  name: z.string().min(2, {
    message: "O nome deve ter pelo menos 2 caracteres",
  }),
  month: z.coerce.number().min(1).max(12, {
    message: "O mês deve estar entre 1 e 12",
  }),
  year: z.coerce.number().min(2000).max(2100, {
    message: "O ano deve estar entre 2000 e 2100",
  }),
  amount: z.coerce.number().positive({
    message: "O valor deve ser positivo",
  }),
  description: z.string().optional(),
});

export type FixedCostFormValues = z.infer<typeof fixedCostSchema>;
