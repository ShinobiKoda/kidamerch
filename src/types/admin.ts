import type { Product } from "@/types/storefront";

export type AdminProduct = Product;

export type OrderStatus =
  "pending" | "processing" | "shipped" | "delivered" | "cancelled" | "refunded";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type AdjustmentReason = "restock" | "damaged" | "correction";

export type EventKind = "Convention" | "Meetup" | "Signing" | "Pop-up"
export type EventStatus = "Upcoming" | "Past" | "Cancelled"


export interface CreateVariantInput {
  size?: string | null;
  color?: string | null;
  design?: string | null;
  sku?: string | null;
  priceOverride?: number | null;
  stock?: number;
}

export interface CreateProductInput {
  name: string;
  description?: string | null;
  basePrice: number;
  category: string;
  animeSeries?: string | null;
  isActive?: boolean;
  variants?: CreateVariantInput[];
  imageUrls?: string[];
}

export interface Category {
  id: string;
  name: string;
  createdAt: string;
}

export interface CreateCategoryInput {
  name: string;
}

export interface OrderHistoryEntry {
  label: string;
  at: string;
}

export interface OrderItem {
  id: string;
  variantId: string;
  productName: string;
  variantDetails: string | null;
  quantity: number;
  priceAtOrder: number;
}

export interface Order {
  id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  subtotal: number;
  shippingCost: number;
  tax: number;
  total: number;
  shippingAddress: string | null;
  trackingNumber: string | null;
  reason: string | null;
  notes: string | null;
  whatsappSentAt: string | null;
  items: OrderItem[];
  history: OrderHistoryEntry[];
  createdAt: string;
}

export interface UpdateOrderInput {
  status?: OrderStatus | undefined;
  paymentStatus?: PaymentStatus | undefined;
  trackingNumber?: string | undefined;
  reason?: string | undefined;
  historyLabel?: string | undefined;
}

export interface StockAdjustment {
  id: string;
  variantId: string;
  productName: string;
  variantLabel: string | null;
  delta: number;
  reason: AdjustmentReason;
  createdAt: string;
}

export interface AdjustStockInput {
  variantId: string;
  delta: number;
  reason: AdjustmentReason;
}

export interface AdminEvent {
  id: string
  name: string
  kind: EventKind
  date: string
  location: string
  description: string
  cover: string
  gallery: string[]
  status: EventStatus
  featured: boolean
  createdAt: string
}

export interface CreateEventInput {
  name: string
  kind: EventKind
  date: string
  location: string
  description: string
  cover?: string | null
  gallery?: string[]
  status: EventStatus
  featured?: boolean
}

export interface RevenuePoint {
  date: string
  label: string
  revenue: number
}

export interface TopProduct {
  name: string
  units: number
  revenue: number
}

export interface StatusCount {
  name: string
  count: number
}

export interface InsightsData {
  series: RevenuePoint[]
  topProducts: TopProduct[]
  statusMix: StatusCount[]
}

export type UpdateEventInput = CreateEventInput

export type UpdateProductInput = CreateProductInput;
