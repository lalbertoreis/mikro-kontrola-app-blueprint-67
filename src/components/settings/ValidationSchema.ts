
import { z } from "zod";

export const settingsFormSchema = z.object({
  businessName: z.string().min(2, {
    message: "O nome do negócio precisa ter pelo menos 2 caracteres.",
  }),
  businessLogo: z.string().optional(),
  enableOnlineBooking: z.boolean().default(false),
  slug: z.string().regex(/^[a-z0-9-]+$/, {
    message: "O slug deve conter apenas letras minúsculas, números e hífens.",
  }).optional().or(z.literal('')),
  instagram: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  bookingSimultaneousLimit: z.number().int().min(1, {
    message: "O limite deve ser pelo menos 1.",
  }).default(3),
  bookingFutureLimit: z.number().int().min(1, {
    message: "O limite deve ser pelo menos 1 mês.",
  }).default(3),
  bookingTimeInterval: z.number().int().min(5, {
    message: "O intervalo deve ser de pelo menos 5 minutos.",
  }).default(30),
  bookingCancelMinHours: z.number().min(0, {
    message: "O tempo mínimo não pode ser negativo.",
  }).default(1),
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;
