export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      academy_coaches: {
        Row: {
          availability: Json
          certifications: string[]
          contract_end: string | null
          contract_start: string | null
          contract_type: Database["public"]["Enums"]["coach_contract_type"]
          created_at: string
          email: string | null
          full_name: string
          id: string
          license_expiry: string | null
          license_level: string | null
          license_number: string | null
          notes: string | null
          org_id: string
          phone: string | null
          photo_url: string | null
          role_title: string
          status: Database["public"]["Enums"]["coach_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          availability?: Json
          certifications?: string[]
          contract_end?: string | null
          contract_start?: string | null
          contract_type?: Database["public"]["Enums"]["coach_contract_type"]
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          license_expiry?: string | null
          license_level?: string | null
          license_number?: string | null
          notes?: string | null
          org_id: string
          phone?: string | null
          photo_url?: string | null
          role_title?: string
          status?: Database["public"]["Enums"]["coach_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          availability?: Json
          certifications?: string[]
          contract_end?: string | null
          contract_start?: string | null
          contract_type?: Database["public"]["Enums"]["coach_contract_type"]
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          license_expiry?: string | null
          license_level?: string | null
          license_number?: string | null
          notes?: string | null
          org_id?: string
          phone?: string | null
          photo_url?: string | null
          role_title?: string
          status?: Database["public"]["Enums"]["coach_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_coaches_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_events: {
        Row: {
          created_at: string
          description: string | null
          ends_on: string
          id: string
          org_id: string
          season_id: string | null
          starts_on: string
          title: string
          type: Database["public"]["Enums"]["academy_event_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          ends_on: string
          id?: string
          org_id: string
          season_id?: string | null
          starts_on: string
          title: string
          type?: Database["public"]["Enums"]["academy_event_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          ends_on?: string
          id?: string
          org_id?: string
          season_id?: string | null
          starts_on?: string
          title?: string
          type?: Database["public"]["Enums"]["academy_event_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_events_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "academy_events_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_profiles: {
        Row: {
          accreditation: string | null
          accreditation_level: string | null
          capacity: number | null
          created_at: string
          founded_date: string | null
          head_of_academy: string | null
          id: string
          license_authority: string | null
          license_expiry: string | null
          license_number: string | null
          motto: string | null
          org_id: string
          philosophy: string | null
          primary_color: string | null
          registration_number: string | null
          secondary_color: string | null
          updated_at: string
        }
        Insert: {
          accreditation?: string | null
          accreditation_level?: string | null
          capacity?: number | null
          created_at?: string
          founded_date?: string | null
          head_of_academy?: string | null
          id?: string
          license_authority?: string | null
          license_expiry?: string | null
          license_number?: string | null
          motto?: string | null
          org_id: string
          philosophy?: string | null
          primary_color?: string | null
          registration_number?: string | null
          secondary_color?: string | null
          updated_at?: string
        }
        Update: {
          accreditation?: string | null
          accreditation_level?: string | null
          capacity?: number | null
          created_at?: string
          founded_date?: string | null
          head_of_academy?: string | null
          id?: string
          license_authority?: string | null
          license_expiry?: string | null
          license_number?: string | null
          motto?: string | null
          org_id?: string
          philosophy?: string | null
          primary_color?: string | null
          registration_number?: string | null
          secondary_color?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "academy_profiles_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      age_categories: {
        Row: {
          code: string
          created_at: string
          cutoff_month: number
          description: string | null
          id: string
          is_active: boolean
          is_custom: boolean
          label: string
          max_age: number
          min_age: number | null
          org_id: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          cutoff_month?: number
          description?: string | null
          id?: string
          is_active?: boolean
          is_custom?: boolean
          label: string
          max_age: number
          min_age?: number | null
          org_id: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          cutoff_month?: number
          description?: string | null
          id?: string
          is_active?: boolean
          is_custom?: boolean
          label?: string
          max_age?: number
          min_age?: number | null
          org_id?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "age_categories_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          created_at: string
          entity: string | null
          entity_id: string | null
          id: string
          metadata: Json
          org_id: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json
          org_id?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          created_at?: string
          entity?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json
          org_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      facilities: {
        Row: {
          address_line: string | null
          capacity: number | null
          city: string | null
          created_at: string
          equipment: Json
          id: string
          latitude: number | null
          longitude: number | null
          name: string
          notes: string | null
          org_id: string
          status: Database["public"]["Enums"]["facility_status"]
          surface: string | null
          type: Database["public"]["Enums"]["facility_type"]
          updated_at: string
        }
        Insert: {
          address_line?: string | null
          capacity?: number | null
          city?: string | null
          created_at?: string
          equipment?: Json
          id?: string
          latitude?: number | null
          longitude?: number | null
          name: string
          notes?: string | null
          org_id: string
          status?: Database["public"]["Enums"]["facility_status"]
          surface?: string | null
          type?: Database["public"]["Enums"]["facility_type"]
          updated_at?: string
        }
        Update: {
          address_line?: string | null
          capacity?: number | null
          city?: string | null
          created_at?: string
          equipment?: Json
          id?: string
          latitude?: number | null
          longitude?: number | null
          name?: string
          notes?: string | null
          org_id?: string
          status?: Database["public"]["Enums"]["facility_status"]
          surface?: string | null
          type?: Database["public"]["Enums"]["facility_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "facilities_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          org_id: string
          responded_at: string | null
          role: Database["public"]["Enums"]["app_role"]
          status: Database["public"]["Enums"]["invitation_status"]
          token: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          org_id: string
          responded_at?: string | null
          role: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          org_id?: string
          responded_at?: string | null
          role?: Database["public"]["Enums"]["app_role"]
          status?: Database["public"]["Enums"]["invitation_status"]
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      media_albums: {
        Row: {
          cover_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          org_id: string
          title: string
          updated_at: string
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          org_id: string
          title: string
          updated_at?: string
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          org_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_albums_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      media_items: {
        Row: {
          album_id: string | null
          caption: string | null
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["media_kind"]
          org_id: string
          updated_at: string
          uploaded_by: string | null
          url: string
        }
        Insert: {
          album_id?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["media_kind"]
          org_id: string
          updated_at?: string
          uploaded_by?: string | null
          url: string
        }
        Update: {
          album_id?: string | null
          caption?: string | null
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["media_kind"]
          org_id?: string
          updated_at?: string
          uploaded_by?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_items_album_id_fkey"
            columns: ["album_id"]
            isOneToOne: false
            referencedRelation: "media_albums"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_items_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_documents: {
        Row: {
          category: string
          created_at: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          org_id: string
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          category?: string
          created_at?: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          org_id: string
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          org_id?: string
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "org_documents_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_memberships: {
        Row: {
          created_at: string
          id: string
          is_default: boolean
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_default?: boolean
          org_id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_default?: boolean
          org_id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_memberships_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          address_line: string | null
          archived_at: string | null
          archived_by: string | null
          city: string | null
          country: string | null
          cover_url: string | null
          created_at: string
          deleted_at: string | null
          description: string | null
          email: string | null
          id: string
          language: string
          latitude: number | null
          logo_url: string | null
          longitude: number | null
          name: string
          owner_user_id: string | null
          parent_id: string | null
          phone: string | null
          postal_code: string | null
          region: string | null
          settings: Json
          slug: string
          socials: Json
          status: Database["public"]["Enums"]["org_status"]
          tags: string[]
          timezone: string
          type: Database["public"]["Enums"]["org_type"]
          updated_at: string
          website: string | null
        }
        Insert: {
          address_line?: string | null
          archived_at?: string | null
          archived_by?: string | null
          city?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          language?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name: string
          owner_user_id?: string | null
          parent_id?: string | null
          phone?: string | null
          postal_code?: string | null
          region?: string | null
          settings?: Json
          slug: string
          socials?: Json
          status?: Database["public"]["Enums"]["org_status"]
          tags?: string[]
          timezone?: string
          type?: Database["public"]["Enums"]["org_type"]
          updated_at?: string
          website?: string | null
        }
        Update: {
          address_line?: string | null
          archived_at?: string | null
          archived_by?: string | null
          city?: string | null
          country?: string | null
          cover_url?: string | null
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          email?: string | null
          id?: string
          language?: string
          latitude?: number | null
          logo_url?: string | null
          longitude?: number | null
          name?: string
          owner_user_id?: string | null
          parent_id?: string | null
          phone?: string | null
          postal_code?: string | null
          region?: string | null
          settings?: Json
          slug?: string
          socials?: Json
          status?: Database["public"]["Enums"]["org_status"]
          tags?: string[]
          timezone?: string
          type?: Database["public"]["Enums"]["org_type"]
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organizations_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          display_name: string
          email: string
          id: string
          is_active: boolean
          language: string
          notification_prefs: Json
          theme: string
          timezone: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string
          email: string
          id: string
          is_active?: boolean
          language?: string
          notification_prefs?: Json
          theme?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          display_name?: string
          email?: string
          id?: string
          is_active?: boolean
          language?: string
          notification_prefs?: Json
          theme?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      seasons: {
        Row: {
          academic_year: string | null
          created_at: string
          created_by: string | null
          ends_on: string
          id: string
          is_current: boolean
          name: string
          notes: string | null
          org_id: string
          registration_closes_on: string | null
          registration_opens_on: string | null
          starts_on: string
          status: Database["public"]["Enums"]["season_status"]
          updated_at: string
        }
        Insert: {
          academic_year?: string | null
          created_at?: string
          created_by?: string | null
          ends_on: string
          id?: string
          is_current?: boolean
          name: string
          notes?: string | null
          org_id: string
          registration_closes_on?: string | null
          registration_opens_on?: string | null
          starts_on: string
          status?: Database["public"]["Enums"]["season_status"]
          updated_at?: string
        }
        Update: {
          academic_year?: string | null
          created_at?: string
          created_by?: string | null
          ends_on?: string
          id?: string
          is_current?: boolean
          name?: string
          notes?: string | null
          org_id?: string
          registration_closes_on?: string | null
          registration_opens_on?: string | null
          starts_on?: string
          status?: Database["public"]["Enums"]["season_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "seasons_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          age_category_id: string | null
          archived_at: string | null
          archived_by: string | null
          assistant_coach_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          head_coach_id: string | null
          id: string
          manager_id: string | null
          max_squad_size: number
          name: string
          org_id: string
          photo_url: string | null
          season_id: string | null
          short_name: string | null
          status: Database["public"]["Enums"]["team_status"]
          updated_at: string
        }
        Insert: {
          age_category_id?: string | null
          archived_at?: string | null
          archived_by?: string | null
          assistant_coach_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          head_coach_id?: string | null
          id?: string
          manager_id?: string | null
          max_squad_size?: number
          name: string
          org_id: string
          photo_url?: string | null
          season_id?: string | null
          short_name?: string | null
          status?: Database["public"]["Enums"]["team_status"]
          updated_at?: string
        }
        Update: {
          age_category_id?: string | null
          archived_at?: string | null
          archived_by?: string | null
          assistant_coach_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          head_coach_id?: string | null
          id?: string
          manager_id?: string | null
          max_squad_size?: number
          name?: string
          org_id?: string
          photo_url?: string | null
          season_id?: string | null
          short_name?: string | null
          status?: Database["public"]["Enums"]["team_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_age_category_id_fkey"
            columns: ["age_category_id"]
            isOneToOne: false
            referencedRelation: "age_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_assistant_coach_id_fkey"
            columns: ["assistant_coach_id"]
            isOneToOne: false
            referencedRelation: "academy_coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_head_coach_id_fkey"
            columns: ["head_coach_id"]
            isOneToOne: false
            referencedRelation: "academy_coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "academy_coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      training_sessions: {
        Row: {
          attendance_note: string | null
          capacity: number | null
          coach_id: string | null
          created_at: string
          ends_at: string
          facility_id: string | null
          id: string
          intensity: string | null
          is_active: boolean
          objectives: string[]
          org_id: string
          season_id: string | null
          starts_at: string
          team_id: string | null
          title: string
          updated_at: string
          weather_note: string | null
          weekday: number
        }
        Insert: {
          attendance_note?: string | null
          capacity?: number | null
          coach_id?: string | null
          created_at?: string
          ends_at: string
          facility_id?: string | null
          id?: string
          intensity?: string | null
          is_active?: boolean
          objectives?: string[]
          org_id: string
          season_id?: string | null
          starts_at: string
          team_id?: string | null
          title: string
          updated_at?: string
          weather_note?: string | null
          weekday: number
        }
        Update: {
          attendance_note?: string | null
          capacity?: number | null
          coach_id?: string | null
          created_at?: string
          ends_at?: string
          facility_id?: string | null
          id?: string
          intensity?: string | null
          is_active?: boolean
          objectives?: string[]
          org_id?: string
          season_id?: string | null
          starts_at?: string
          team_id?: string | null
          title?: string
          updated_at?: string
          weather_note?: string | null
          weekday?: number
        }
        Relationships: [
          {
            foreignKeyName: "training_sessions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "academy_coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_sessions_facility_id_fkey"
            columns: ["facility_id"]
            isOneToOne: false
            referencedRelation: "facilities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_sessions_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_sessions_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_sessions_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      academy_event_type:
        | "registration_window"
        | "holiday"
        | "training_block"
        | "tournament"
        | "meeting"
        | "other"
      app_role:
        | "platform_owner"
        | "federation"
        | "association"
        | "academy"
        | "club"
        | "coach"
        | "parent"
        | "player"
        | "referee"
        | "scout"
      coach_contract_type: "full_time" | "part_time" | "volunteer" | "freelance"
      coach_status: "active" | "inactive" | "on_leave" | "terminated"
      facility_status: "available" | "maintenance" | "unavailable"
      facility_type:
        | "training_ground"
        | "field"
        | "locker_room"
        | "equipment_store"
        | "gym"
        | "medical_room"
        | "office"
      invitation_status:
        | "pending"
        | "accepted"
        | "rejected"
        | "revoked"
        | "expired"
      media_kind: "photo" | "video"
      org_status: "active" | "inactive" | "suspended" | "archived"
      org_type:
        | "platform"
        | "federation"
        | "association"
        | "academy"
        | "club"
        | "district_association"
        | "football_school"
        | "competition_organizer"
        | "partner"
      season_status: "upcoming" | "active" | "completed" | "archived"
      team_status: "active" | "inactive" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      academy_event_type: [
        "registration_window",
        "holiday",
        "training_block",
        "tournament",
        "meeting",
        "other",
      ],
      app_role: [
        "platform_owner",
        "federation",
        "association",
        "academy",
        "club",
        "coach",
        "parent",
        "player",
        "referee",
        "scout",
      ],
      coach_contract_type: ["full_time", "part_time", "volunteer", "freelance"],
      coach_status: ["active", "inactive", "on_leave", "terminated"],
      facility_status: ["available", "maintenance", "unavailable"],
      facility_type: [
        "training_ground",
        "field",
        "locker_room",
        "equipment_store",
        "gym",
        "medical_room",
        "office",
      ],
      invitation_status: [
        "pending",
        "accepted",
        "rejected",
        "revoked",
        "expired",
      ],
      media_kind: ["photo", "video"],
      org_status: ["active", "inactive", "suspended", "archived"],
      org_type: [
        "platform",
        "federation",
        "association",
        "academy",
        "club",
        "district_association",
        "football_school",
        "competition_organizer",
        "partner",
      ],
      season_status: ["upcoming", "active", "completed", "archived"],
      team_status: ["active", "inactive", "archived"],
    },
  },
} as const
