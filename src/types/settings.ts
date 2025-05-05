
export interface BusinessSettings {
  businessName: string;
  businessLogo?: string;
  enableOnlineBooking: boolean;
  slug?: string;
  instagram?: string;
  whatsapp?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
  bookingSimultaneousLimit: number;
  bookingFutureLimit: number;
  bookingTimeInterval: number;
  bookingCancelMinHours: number;
}

export interface BusinessSettingsFormData {
  businessName: string;
  businessLogo?: string;
  enableOnlineBooking: boolean;
  slug?: string;
  instagram?: string;
  whatsapp?: string;
  address?: string;
  bookingSimultaneousLimit: number;
  bookingFutureLimit: number;
  bookingTimeInterval: number;
  bookingCancelMinHours: number;
}
