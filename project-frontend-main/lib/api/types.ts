/** Generic API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  details?: Array<{ field?: string; message?: string }>;
  errorCode?: string;
}

/** User from auth */
export interface User {
  uid: string;
  email: string;
  name: string;
  college: string;
  phone: string;
  role: "user" | "admin" | "superadmin";
  permissions?: string[];
}

/** Category */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  display_order: number;
  created_at: string;
  updated_at: string;
}

/** Item (listing) - price is seller price; buyer_price = price + 25% platform fee */
export interface Item {
  id: string;
  seller_id: string;
  category_id: string;
  title: string;
  description: string;
  price: string | number;
  /** Buyer-facing price (seller price + platform fee). Use on Home and Cart. */
  buyer_price?: number;
  images: string[];
  status: "active" | "sold" | "inactive";
  college: string;
  contact_phone?: string;
  created_at: string;
  category_name?: string;
  category_slug?: string;
  seller_name?: string;
  seller_college?: string;
  seller_phone?: string;
}

/** Cart item - buyer_price is what buyer pays per unit (includes platform fee) */
export interface CartItem {
  id: string;
  user_id?: string;
  item_id: string;
  quantity: number;
  title: string;
  price: string | number;
  buyer_price?: number;
  images: string[];
  status?: string;
  seller_id: string;
  category_name: string;
  created_at?: string;
}

/** Cart response */
export interface CartData {
  items: CartItem[];
  total: number;
}

/** Order item (in order) - buyer_paid is what buyer paid for this line */
export interface OrderItemEntry {
  itemId: string;
  title: string;
  price?: number;
  quantity: number;
  sellerId: string;
  seller_amount?: number;
  platform_fee?: number;
  buyer_paid?: number;
}

/** Order */
export interface Order {
  id: string;
  user_id: string;
  items: OrderItemEntry[];
  total_amount: string;
  payment_status: string;
  razorpay_order_id?: string;
  razorpay_payment_id?: string;
  created_at: string;
}

/** Create order response (Razorpay) */
export interface CreateOrderData {
  orderId: string;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  keyId: string;
}

/** Admin stats (activeItems removed per backend) */
export interface AdminStats {
  users: number;
  categories: number;
  orders: {
    totalOrders: number;
    totalRevenue: number;
    byStatus: Array<{ payment_status: string; count: string }>;
  };
  activityLogs: {
    total: number;
    byStatus?: unknown[];
    topUsers?: unknown[];
  };
}

/** Admin user (list) */
export interface AdminUser {
  uid: string;
  email: string;
  name: string;
  college?: string;
  phone?: string;
  role: string;
  created_at?: string;
}

/** Activity log (admin) */
export interface ActivityLog {
  id: string;
  user_id: string;
  action: string;
  status?: string;
  created_at: string;
  [key: string]: unknown;
}
