// Types des tables et fonctions de supabase/migrations, au format attendu par
// supabase-js. À tenir à jour avec les migrations (ou à régénérer avec
// "npx supabase gen types typescript").

type Table<Row, Insert> = { Row: Row; Insert: Insert; Update: Partial<Insert>; Relationships: [] };

export type Database = {
  public: {
    Tables: {
      subscriptions: Table<
        {
          user_id: string;
          mollie_customer_id: string;
          mollie_subscription_id: string | null;
          mollie_mandate_id: string | null;
          plan: string | null;
          next_plan: string | null;
          status: string;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          updated_at: string;
        },
        {
          user_id: string;
          mollie_customer_id: string;
          mollie_subscription_id?: string | null;
          mollie_mandate_id?: string | null;
          plan?: string | null;
          next_plan?: string | null;
          status?: string;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          updated_at?: string;
        }
      >;
      token_balances: Table<
        { user_id: string; balance: number; granted_quota: number; updated_at: string },
        { user_id: string; balance?: number; granted_quota?: number; updated_at?: string }
      >;
      token_ledger: Table<
        { id: number; user_id: string; delta: number; reason: string; ref: string; balance_after: number; created_at: string },
        { user_id: string; delta: number; reason: string; ref: string; balance_after: number; created_at?: string }
      >;
      generations: Table<
        {
          id: string;
          user_id: string;
          model: string;
          tokens: number;
          fal_request_id: string | null;
          status: string;
          created_at: string;
        },
        {
          id?: string;
          user_id: string;
          model: string;
          tokens: number;
          fal_request_id?: string | null;
          status?: string;
          created_at?: string;
        }
      >;
    };
    Views: Record<never, never>;
    Functions: {
      reset_tokens: { Args: { p_user: string; p_quota: number; p_reason: string; p_ref: string }; Returns: number };
      upgrade_tokens: { Args: { p_user: string; p_quota: number; p_fraction: number; p_ref: string }; Returns: number };
      spend_tokens: { Args: { p_user: string; p_amount: number; p_generation: string }; Returns: number };
      refund_generation: { Args: { p_generation: string }; Returns: undefined };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
