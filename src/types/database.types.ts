export type RarityTier = "COMMON" | "UNCOMMON" | "RARE" | "EPIC" | "LEGENDARY" | "MYTHIC";
export type MatrixType = "CORE" | "SUPPORT" | "ANOMALY" | "UTILITY";
export type IngestionStatus = "PENDING" | "RUNNING" | "COMPLETED" | "FAILED";
export type RawBufferDecision = "PENDING" | "APPROVED" | "REJECTED";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      integration_tokens: {
        Row: {
          id: number;
          created_at: string;
          service_name: string;
          access_token: string;
          refresh_token: string | null;
          expires_at: string;
          scopes: string[] | null;
        };
        Insert: {
          service_name: string;
          access_token: string;
          refresh_token?: string | null;
          expires_at: string;
          scopes?: string[] | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          service_name?: string;
          access_token?: string;
          refresh_token?: string | null;
          expires_at?: string;
          scopes?: string[] | null;
        };
      };
      ingestion_cycles: {
        Row: {
          cycle_id: string; // UUID
          started_at: string;
          ended_at: string | null;
          status: IngestionStatus;
          logs: Json | null;
          pins_processed: number;
          errors_encountered: number;
          source_endpoint: string;
          operator_signature: string;
          total_items_committed: number;
        };
        Insert: {
          cycle_id: string; // UUID
          ended_at?: string | null;
          status: IngestionStatus;
          logs?: Json | null;
          pins_processed: number;
          errors_encountered: number;
          source_endpoint: string;
          operator_signature: string;
          total_items_committed: number;
        };
        Update: {
          cycle_id?: string;
          started_at?: string;
          ended_at?: string | null;
          status?: IngestionStatus;
          logs?: Json | null;
          pins_processed?: number;
          errors_encountered?: number;
          source_endpoint?: string;
          operator_signature?: string;
          total_items_committed?: number;
        };
      };
      raw_buffer: {
        Row: {
          id: number;
          received_at: string;
          source_service: string;
          payload: Json;
          is_processed: boolean;
          error_log: string | null;
          processed_at: string | null;
          validation_flags: Json | null;
          decision: RawBufferDecision;
        };
        Insert: {
          source_service: string;
          payload: Json;
          is_processed?: boolean;
          error_log?: string | null;
          processed_at?: string | null;
          validation_flags?: Json | null;
          decision?: RawBufferDecision;
        };
        Update: {
          id?: number;
          received_at?: string;
          source_service?: string;
          payload?: Json;
          is_processed?: boolean;
          error_log?: string | null;
          processed_at?: string | null;
          validation_flags?: Json | null;
          decision?: RawBufferDecision;
        };
      };
      matrices: {
        Row: {
          id: number;
          created_at: string;
          code: string;
          type: MatrixType;
          description: string | null;
          is_active: boolean;
        };
        Insert: {
          code: string;
          type: MatrixType;
          description?: string | null;
          is_active?: boolean;
        };
        Update: {
          id?: number;
          created_at?: string;
          code?: string;
          type?: MatrixType;
          description?: string | null;
          is_active?: boolean;
        };
      };
      assets: {
        Row: {
          id: string; // UUID
          created_at: string;
          updated_at: string;
          sku_slug: string;
          name: string;
          current_rarity: RarityTier;
          total_score: number;
          metadata: Json | null;
          matrix_config: Json | null;
          destination_link: string | null;
        };
        Insert: {
          id?: string;
          sku_slug: string;
          name: string;
          current_rarity: RarityTier;
          total_score?: number;
          metadata?: Json | null;
          matrix_config?: Json | null;
          destination_link?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string;
          updated_at?: string;
          sku_slug?: string;
          name?: string;
          current_rarity?: RarityTier;
          total_score?: number;
          metadata?: Json | null;
          matrix_config?: Json | null;
          destination_link?: string | null;
        };
      };
      active_pins: {
        Row: {
          pin_id: string;
          created_at: string;
          updated_at: string;
          asset_id: string | null;
          title: string | null;
          description: string | null;
          image_url: string;
          board_id: string | null;
          last_stats: Json;
        };
        Insert: {
          pin_id: string;
          asset_id?: string | null;
          title?: string | null;
          description?: string | null;
          image_url: string;
          board_id?: string | null;
          last_stats: Json;
        };
        Update: {
          pin_id?: string;
          created_at?: string;
          updated_at?: string;
          asset_id?: string | null;
          title?: string | null;
          description?: string | null;
          image_url?: string;
          board_id?: string | null;
          last_stats?: Json;
        };
      };
      pin_metric_history: {
        Row: {
          id: number;
          pin_id_fk: string;
          recorded_at: string;
          impression_count: number;
          outbound_click_count: number;
          save_count: number;
          source: string;
        };
        Insert: {
          pin_id_fk: string;
          impression_count: number;
          outbound_click_count: number;
          save_count: number;
          source: string;
        };
        Update: {
          id?: number;
          pin_id_fk?: string;
          recorded_at?: string;
          impression_count?: number;
          outbound_click_count?: number;
          save_count?: number;
          source?: string;
        };
      };
      transaction_ledger: {
        Row: {
          id: string; // uuid
          asset_id: string; // uuid
          operator_id: string;
          amount: number;
          context: string;
          recorded_at: string;
        };
        Insert: {
          id?: string; // uuid
          asset_id: string;
          operator_id: string;
          amount: number;
          context: string;
          recorded_at?: string;
        };
        Update: {
          id?: string;
          asset_id?: string;
          operator_id?: string;
          amount?: number;
          context?: string;
          recorded_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      rarity_tier: RarityTier;
      matrix_type: MatrixType;
      ingestion_status: IngestionStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}