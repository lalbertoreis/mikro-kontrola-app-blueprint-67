
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
});

export type SettingsFormValues = z.infer<typeof settingsFormSchema>;
