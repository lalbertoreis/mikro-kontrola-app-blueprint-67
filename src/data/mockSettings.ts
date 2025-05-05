
import { BusinessSettings } from "@/types/settings";

export const mockSettings: BusinessSettings = {
  businessName: "Salão Exemplo",
  businessLogo: "https://placehold.co/400x200/kontrola/white?text=KontrolaApp",
  enableOnlineBooking: false,
  slug: "salao-exemplo",
  instagram: "",
  whatsapp: "",
  address: "",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  bookingSimultaneousLimit: 3,
  bookingFutureLimit: 3,
  bookingTimeInterval: 30,
  bookingCancelMinHours: 1,
};

