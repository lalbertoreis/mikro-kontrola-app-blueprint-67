
export interface ClientCheckResult {
  id: string;
  name: string;
  phone: string;
  user_id: string;
  has_pin: boolean;
}

export interface ClientCreateResult {
  id: string;
  success: boolean;
}

export interface ClientVerifyResult {
  id: string;
  name: string;
  phone: string;
  user_id: string;
  pin_valid: boolean;
}

export interface ExistingUserData {
  name?: string;
  hasPin: boolean;
}

export interface LoginResult {
  success: boolean;
  userData?: {
    name: string;
    phone: string;
  };
}
