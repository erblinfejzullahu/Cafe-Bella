import type { Database } from './database'

export type Category = Database['public']['Tables']['categories']['Row']
export type Product = Database['public']['Tables']['products']['Row']
export type Order = Database['public']['Tables']['orders']['Row']
export type OrderItem = Database['public']['Tables']['order_items']['Row']
export type Review = Database['public']['Tables']['reviews']['Row']
export type Reservation = Database['public']['Tables']['reservations']['Row']

export type OrderStatus = Order['status']
export type OrderType = Order['order_type']

export interface ProductWithCategory extends Product {
  categories?: Category | null
}

export interface OrderWithItems extends Order {
  order_items: OrderItem[]
}

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image_url?: string | null
  notes?: string
}

export interface CartState {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  updateItemNotes: (id: string, notes: string) => void
  clearCart: () => void
  totalItems: () => number
  totalPrice: () => number
}
