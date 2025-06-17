export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      appointments: {
        Row: {
          client_id: string
          created_at: string | null
          employee_id: string
          end_time: string
          id: string
          notes: string | null
          service_id: string
          start_time: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string | null
          employee_id: string
          end_time: string
          id?: string
          notes?: string | null
          service_id: string
          start_time: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string | null
          employee_id?: string
          end_time?: string
          id?: string
          notes?: string | null
          service_id?: string
          start_time?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "business_services_view"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "appointments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_shifts_view"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "business_services_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          cep: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          pin: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          address?: string | null
          cep?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          pin?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          address?: string | null
          cep?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          pin?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      employee_invites: {
        Row: {
          activated_at: string | null
          created_at: string
          created_by: string
          email: string
          employee_id: string
          id: string
          is_active: boolean
          temporary_password: string
          user_id: string | null
        }
        Insert: {
          activated_at?: string | null
          created_at?: string
          created_by: string
          email: string
          employee_id: string
          id?: string
          is_active?: boolean
          temporary_password: string
          user_id?: string | null
        }
        Update: {
          activated_at?: string | null
          created_at?: string
          created_by?: string
          email?: string
          employee_id?: string
          id?: string
          is_active?: boolean
          temporary_password?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employee_invites_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "business_services_view"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_invites_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_invites_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: true
            referencedRelation: "employees_shifts_view"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      employee_permissions: {
        Row: {
          business_owner_id: string
          can_edit_own_appointments: boolean
          can_manage_appointments: boolean
          can_view_calendar: boolean
          created_at: string
          employee_id: string
          id: string
          user_id: string
        }
        Insert: {
          business_owner_id: string
          can_edit_own_appointments?: boolean
          can_manage_appointments?: boolean
          can_view_calendar?: boolean
          created_at?: string
          employee_id: string
          id?: string
          user_id: string
        }
        Update: {
          business_owner_id?: string
          can_edit_own_appointments?: boolean
          can_manage_appointments?: boolean
          can_view_calendar?: boolean
          created_at?: string
          employee_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_permissions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "business_services_view"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_permissions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_permissions_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_shifts_view"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      employee_services: {
        Row: {
          created_at: string | null
          employee_id: string
          id: string
          service_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          id?: string
          service_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          id?: string
          service_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "employee_services_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "business_services_view"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_services_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_services_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_shifts_view"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "employee_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "business_services_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employee_services_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          auth_user_id: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      fixed_costs: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          month: number
          name: string
          updated_at: string | null
          user_id: string
          year: number
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          month: number
          name: string
          updated_at?: string | null
          user_id: string
          year: number
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          month?: number
          name?: string
          updated_at?: string | null
          user_id?: string
          year?: number
        }
        Relationships: []
      }
      holidays: {
        Row: {
          auto_generated: boolean
          blocking_type: string
          created_at: string | null
          custom_end_time: string | null
          custom_start_time: string | null
          date: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auto_generated?: boolean
          blocking_type?: string
          created_at?: string | null
          custom_end_time?: string | null
          custom_start_time?: string | null
          date: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          type: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auto_generated?: boolean
          blocking_type?: string
          created_at?: string | null
          custom_end_time?: string | null
          custom_start_time?: string | null
          date?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      onboarding_status: {
        Row: {
          current_step: number
          is_completed: boolean
          is_skipped: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          current_step?: number
          is_completed?: boolean
          is_skipped?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          current_step?: number
          is_completed?: boolean
          is_skipped?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          created_at: string | null
          fee: number | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          fee?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          fee?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          booking_cancel_min_hours: number | null
          booking_color: string | null
          booking_future_limit: number | null
          booking_simultaneous_limit: number | null
          booking_time_interval: number | null
          business_logo: string | null
          business_name: string | null
          created_at: string | null
          email: string | null
          enable_online_booking: boolean | null
          first_name: string | null
          id: string
          instagram: string | null
          last_name: string | null
          slug: string | null
          theme_preference: string | null
          updated_at: string | null
          whatsapp: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          booking_cancel_min_hours?: number | null
          booking_color?: string | null
          booking_future_limit?: number | null
          booking_simultaneous_limit?: number | null
          booking_time_interval?: number | null
          business_logo?: string | null
          business_name?: string | null
          created_at?: string | null
          email?: string | null
          enable_online_booking?: boolean | null
          first_name?: string | null
          id: string
          instagram?: string | null
          last_name?: string | null
          slug?: string | null
          theme_preference?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          booking_cancel_min_hours?: number | null
          booking_color?: string | null
          booking_future_limit?: number | null
          booking_simultaneous_limit?: number | null
          booking_time_interval?: number | null
          business_logo?: string | null
          business_name?: string | null
          created_at?: string | null
          email?: string | null
          enable_online_booking?: boolean | null
          first_name?: string | null
          id?: string
          instagram?: string | null
          last_name?: string | null
          slug?: string | null
          theme_preference?: string | null
          updated_at?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      service_packages: {
        Row: {
          created_at: string | null
          description: string | null
          discount: number
          id: string
          is_active: boolean
          name: string
          price: number
          services: Json
          show_in_online_booking: boolean | null
          total_duration: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          discount: number
          id?: string
          is_active?: boolean
          name: string
          price: number
          services: Json
          show_in_online_booking?: boolean | null
          total_duration?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          discount?: number
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          services?: Json
          show_in_online_booking?: boolean | null
          total_duration?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          created_at: string | null
          description: string | null
          duration: number
          id: string
          is_active: boolean
          name: string
          price: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          duration: number
          id?: string
          is_active?: boolean
          name: string
          price: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          duration?: number
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      shifts: {
        Row: {
          created_at: string | null
          day_of_week: number
          employee_id: string
          end_time: string
          id: string
          start_time: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          day_of_week: number
          employee_id: string
          end_time: string
          id?: string
          start_time: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          day_of_week?: number
          employee_id?: string
          end_time?: string
          id?: string
          start_time?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shifts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "business_services_view"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "shifts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shifts_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_shifts_view"
            referencedColumns: ["employee_id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          category: string
          client_id: string | null
          created_at: string | null
          date: string
          description: string
          id: string
          notes: string | null
          package_id: string | null
          payment_method: string | null
          quantity: number | null
          service_id: string | null
          type: string
          unit_price: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          client_id?: string | null
          created_at?: string | null
          date: string
          description: string
          id?: string
          notes?: string | null
          package_id?: string | null
          payment_method?: string | null
          quantity?: number | null
          service_id?: string | null
          type: string
          unit_price?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          client_id?: string | null
          created_at?: string | null
          date?: string
          description?: string
          id?: string
          notes?: string | null
          package_id?: string | null
          payment_method?: string | null
          quantity?: number | null
          service_id?: string | null
          type?: string
          unit_price?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "service_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "business_services_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      appointments_view: {
        Row: {
          appointment_id: string | null
          business_slug: string | null
          client_id: string | null
          employee_id: string | null
          end_time: string | null
          service_id: string | null
          start_time: string | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "appointments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "business_services_view"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "appointments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees_shifts_view"
            referencedColumns: ["employee_id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "business_services_view"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      business_services_view: {
        Row: {
          booking_cancel_min_hours: number | null
          booking_future_limit: number | null
          booking_simultaneous_limit: number | null
          business_slug: string | null
          business_user_id: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          employee_id: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          price: number | null
          updated_at: string | null
        }
        Relationships: []
      }
      employees_shifts_view: {
        Row: {
          business_slug: string | null
          business_user_id: string | null
          day_of_week: number | null
          employee_id: string | null
          employee_name: string | null
          employee_role: string | null
          end_time: string | null
          shift_id: string | null
          start_time: string | null
        }
        Relationships: []
      }
      holidays_view: {
        Row: {
          auto_generated: boolean | null
          blocking_type: string | null
          created_at: string | null
          custom_end_time: string | null
          custom_start_time: string | null
          date: string | null
          description: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          type: string | null
          updated_at: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_client_by_phone: {
        Args: { phone_param: string }
        Returns: {
          id: string
          name: string
          phone: string
          user_id: string
          has_pin: boolean
        }[]
      }
      create_client_for_auth: {
        Args: {
          name_param: string
          phone_param: string
          pin_param?: string
          business_user_id_param?: string
        }
        Returns: {
          id: string
          success: boolean
          error_message: string
        }[]
      }
      find_clients_by_phone: {
        Args: { phone_param: string }
        Returns: {
          id: string
          name: string
          phone: string
          user_id: string
          has_pin: boolean
        }[]
      }
      get_average_service_cost: {
        Args: { user_id_param: string; days_param?: number }
        Returns: {
          total_appointments: number
          total_revenue: number
          average_cost: number
          period_start: string
          period_end: string
        }[]
      }
      get_dashboard_stats: {
        Args: { user_id_param: string }
        Returns: {
          total_clients: number
          total_appointments: number
          monthly_revenue: number
          completed_appointments: number
        }[]
      }
      get_growth_trends: {
        Args: { user_id_param: string; days_param?: number }
        Returns: {
          date_period: string
          new_clients: number
          total_appointments: number
          completed_appointments: number
          revenue: number
          cumulative_clients: number
        }[]
      }
      get_holidays_by_date_and_slug: {
        Args: { date_param: string; slug_param?: string }
        Returns: {
          auto_generated: boolean
          blocking_type: string
          created_at: string | null
          custom_end_time: string | null
          custom_start_time: string | null
          date: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          type: string
          updated_at: string | null
          user_id: string | null
        }[]
      }
      get_most_used_services: {
        Args: { user_id_param: string; days_param?: number }
        Returns: {
          service_id: string
          service_name: string
          usage_count: number
          total_revenue: number
          avg_price: number
        }[]
      }
      get_occupation_rate: {
        Args: { user_id_param: string; days_param?: number }
        Returns: {
          date_period: string
          total_slots: number
          booked_slots: number
          occupation_rate: number
          revenue: number
        }[]
      }
      get_packages_by_slug: {
        Args: { slug_param: string }
        Returns: {
          id: string
          name: string
          description: string
          services: Json
          price: number
          discount: number
          is_active: boolean
          show_in_online_booking: boolean
          total_duration: number
          created_at: string
          updated_at: string
        }[]
      }
      get_service_by_id_and_slug: {
        Args: { service_id_param: string; slug_param: string }
        Returns: {
          booking_cancel_min_hours: number | null
          booking_future_limit: number | null
          booking_simultaneous_limit: number | null
          business_slug: string | null
          business_user_id: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          employee_id: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          price: number | null
          updated_at: string | null
        }[]
      }
      get_services_by_slug: {
        Args: { slug_param: string }
        Returns: {
          booking_cancel_min_hours: number | null
          booking_future_limit: number | null
          booking_simultaneous_limit: number | null
          business_slug: string | null
          business_user_id: string | null
          created_at: string | null
          description: string | null
          duration: number | null
          employee_id: string | null
          id: string | null
          is_active: boolean | null
          name: string | null
          price: number | null
          updated_at: string | null
        }[]
      }
      get_upcoming_appointments: {
        Args: { user_id_param: string; limit_param?: number }
        Returns: {
          id: string
          start_time: string
          end_time: string
          client_name: string
          client_phone: string
          service_name: string
          service_price: number
          employee_name: string
          status: string
        }[]
      }
      is_employee_of_business: {
        Args: { business_user_id: string }
        Returns: boolean
      }
      set_slug_for_session: {
        Args: { slug: string }
        Returns: undefined
      }
      update_client_pin: {
        Args: { phone_param: string; pin_param: string }
        Returns: boolean
      }
      verify_client_pin: {
        Args: { phone_param: string; pin_param: string }
        Returns: {
          id: string
          name: string
          phone: string
          user_id: string
          pin_valid: boolean
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
