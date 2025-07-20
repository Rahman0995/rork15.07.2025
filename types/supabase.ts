export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          password_hash: string
          first_name: string
          last_name: string
          rank: string | null
          role: string
          avatar_url: string | null
          unit: string | null
          phone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          email: string
          password_hash: string
          first_name: string
          last_name: string
          rank?: string | null
          role?: string
          avatar_url?: string | null
          unit?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          password_hash?: string
          first_name?: string
          last_name?: string
          rank?: string | null
          role?: string
          avatar_url?: string | null
          unit?: string | null
          phone?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      tasks: {
        Row: {
          id: string
          title: string
          description: string | null
          status: string
          priority: string
          assigned_to: string | null
          created_by: string | null
          due_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          status?: string
          priority?: string
          assigned_to?: string | null
          created_by?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          status?: string
          priority?: string
          assigned_to?: string | null
          created_by?: string | null
          due_date?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          title: string
          content: string | null
          type: string
          status: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content?: string | null
          type?: string
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string | null
          type?: string
          status?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      chats: {
        Row: {
          id: string
          name: string
          type: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          sender_id: string
          content: string
          type: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          sender_id: string
          content: string
          type?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          sender_id?: string
          content?: string
          type?: string
          created_at?: string
          updated_at?: string
        }
      }
      events: {
        Row: {
          id: string
          title: string
          description: string | null
          start_date: string
          end_date: string
          location: string | null
          type: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          start_date: string
          end_date: string
          location?: string | null
          type?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          start_date?: string
          end_date?: string
          location?: string | null
          type?: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: string
          read?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          read?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}