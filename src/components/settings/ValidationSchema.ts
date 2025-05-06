
import { z } from "zod";

export const settingsFormSchema = z.object({
  businessName: z.string().min(2, "Nome do negócio é obrigatório"),
  businessLogo: z.string().optional(),
  enableOnlineBooking: z.boolean(),
  slug: z
    .string()
    .optional()
    .refine(
      (value) => {
        if (value === undefined || value === "") return true;
        return /^[a-z0-9-]+$/.test(value);
      },
      {
        message: "Slug deve conter apenas letras minúsculas, números e hífens",
      }
    ),
  instagram: z.string().optional(),
  whatsapp: z.string().optional(),
  address: z.string().optional(),
  bookingSimultaneousLimit: z
    .number()
    .min(1, "Mínimo de 1 agendamento simultâneo")
    .max(10, "Máximo de 10 agendamentos simultâneos"),
  bookingFutureLimit: z
    .number()
    .min(1, "Mínimo de 1 dia")
    .max(90, "Máximo de 90 dias"),
  bookingTimeInterval: z
    .number()
    .min(5, "Mínimo de 5 minutos")
    .max(120, "Máximo de 120 minutos"),
  bookingCancelMinHours: z
    .number()
    .min(0, "Mínimo de 0 hora")
    .max(48, "Máximo de 48 horas"),
  bookingColor: z.string().optional(),
});
