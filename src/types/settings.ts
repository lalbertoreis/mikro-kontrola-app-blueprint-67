
export interface BusinessSettings {
  businessName: string;
  businessLogo?: string;
  enableOnlineBooking: boolean;
  instagram?: string;
  whatsapp?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessSettingsFormData {
  businessName: string;
  businessLogo?: string;
  enableOnlineBooking: boolean;
  instagram?: string;
  whatsapp?: string;
  address?: string;
}
