export type ProductType = 'SELL' | 'LUCKY_DRAW'
export type StockStatus = 'in' | 'out'
export type ParticipantStatus = 'pending' | 'approved' | 'rejected'
export type OrderStatus = 'pending' | 'shipped' | 'completed' | 'cancelled'

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  type: ProductType
  stock: StockStatus
  images: string[]
  video_url: string | null
  lucky_draw_end: string | null
  max_participants: number
  is_featured: boolean
  created_at: string
  updated_at: string
}

export interface Participant {
  id: string
  product_id: string
  name: string
  phone: string
  address: string
  screenshot_url: string | null
  status: ParticipantStatus
  agreed_to_share: boolean
  created_at: string
}

export interface Order {
  id: string
  product_id: string | null
  product_name: string
  buyer_phone: string
  buyer_name: string | null
  status: OrderStatus
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Winner {
  id: string
  product_id: string | null
  participant_id: string | null
  winner_name: string
  winner_phone: string
  announce_date: string
  shipping_proof_url: string | null
  is_published: boolean
  created_at: string
}

export interface Settings {
  id: number
  youtube_url: string
  whatsapp_number: string
  site_name: string
  banner_text: string
  banner_enabled: boolean
}

export interface Database {
  public: {
    Tables: {
      products: { Row: Product; Insert: Partial<Product>; Update: Partial<Product> }
      participants: { Row: Participant; Insert: Partial<Participant>; Update: Partial<Participant> }
      orders: { Row: Order; Insert: Partial<Order>; Update: Partial<Order> }
      winners: { Row: Winner; Insert: Partial<Winner>; Update: Partial<Winner> }
      settings: { Row: Settings; Insert: Partial<Settings>; Update: Partial<Settings> }
    }
  }
}
