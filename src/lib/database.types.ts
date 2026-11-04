// Types des tables et fonctions de supabase/migrations, au format attendu par
// supabase-js. À tenir à jour avec les migrations (ou à régénérer avec
// "npx supabase gen types typescript").

type Table<Row, Insert> = { Row: Row; Insert: Insert; Update: Partial<Insert>; Relationships: [] };

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

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
          billing_interval: string;
          next_interval: string | null;
          current_period_end: string | null;
          cancel_at_period_end: boolean;
          renewal_reminder_sent_at: string | null;
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
          billing_interval?: string;
          next_interval?: string | null;
          current_period_end?: string | null;
          cancel_at_period_end?: boolean;
          renewal_reminder_sent_at?: string | null;
          updated_at?: string;
        }
      >;
      token_balances: Table<
        {
          user_id: string;
          balance: number;
          purchased_balance: number;
          granted_quota: number;
          blocked_at: string | null;
          updated_at: string;
        },
        {
          user_id: string;
          balance?: number;
          purchased_balance?: number;
          granted_quota?: number;
          blocked_at?: string | null;
          updated_at?: string;
        }
      >;
      token_ledger: Table<
        {
          id: number;
          user_id: string;
          delta: number;
          purchased_delta: number;
          reason: string;
          ref: string;
          balance_after: number;
          created_at: string;
        },
        {
          user_id: string;
          delta: number;
          purchased_delta?: number;
          reason: string;
          ref: string;
          balance_after: number;
          created_at?: string;
        }
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
      preset_jobs: Table<
        {
          id: string;
          user_id: string;
          preset_id: string;
          preset_version: string;
          variant_id: string;
          status: string;
          stage: string;
          photo_paths: string[];
          steps: Json;
          result_url: string | null;
          error: string | null;
          error_kind: string | null;
          cost_usd: number;
          locked_until: string | null;
          created_at: string;
          updated_at: string;
        },
        {
          id: string;
          user_id: string;
          preset_id: string;
          preset_version: string;
          variant_id: string;
          status?: string;
          stage: string;
          photo_paths: string[];
          steps?: Json;
          result_url?: string | null;
          error?: string | null;
          error_kind?: string | null;
          cost_usd?: number;
          locked_until?: string | null;
          created_at?: string;
          updated_at?: string;
        }
      >;
      preset_switches: Table<
        { preset_id: string; reason: string; disabled_at: string },
        { preset_id: string; reason: string; disabled_at?: string }
      >;
      preset_lab_campaigns: Table<
        {
          id: string;
          preset_id: string;
          preset_version: string;
          candidate_variant: string;
          comparator_variant: string;
          pairs: Json;
          closes_at: string;
          created_at: string;
        },
        {
          id?: string;
          preset_id: string;
          preset_version: string;
          candidate_variant: string;
          comparator_variant: string;
          pairs: Json;
          closes_at: string;
          created_at?: string;
        }
      >;
      preset_lab_votes: Table<
        { campaign_id: string; rater_id: string; pair_index: number; scores: Json; created_at: string },
        { campaign_id: string; rater_id: string; pair_index: number; scores: Json; created_at?: string }
      >;
    };
    Views: Record<never, never>;
    Functions: {
      reset_tokens: { Args: { p_user: string; p_quota: number; p_reason: string; p_ref: string }; Returns: number };
      upgrade_tokens: { Args: { p_user: string; p_quota: number; p_fraction: number; p_ref: string }; Returns: number };
      spend_tokens: { Args: { p_user: string; p_amount: number; p_generation: string }; Returns: number };
      refund_generation: { Args: { p_generation: string }; Returns: undefined };
      credit_purchased_tokens: { Args: { p_user: string; p_amount: number; p_ref: string }; Returns: number | null };
      block_account_for_chargeback: { Args: { p_user: string; p_ref: string }; Returns: boolean };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
};
