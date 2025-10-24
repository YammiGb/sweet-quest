export interface Variation {
  id: string;
  name: string;
  price: number;
}

export interface AddOn {
  id: string;
  name: string;
  price: number;
  category: string;
  quantity?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  category: string;
  image?: string;
  popular?: boolean;
  available?: boolean;
  variations?: Variation[];
  addOns?: AddOn[];
  // Discount pricing fields
  discountPrice?: number;
  discountStartDate?: string;
  discountEndDate?: string;
  discountActive?: boolean;
  // Computed effective price (calculated in the app)
  effectivePrice?: number;
  isOnDiscount?: boolean;
}

export interface CartItem extends MenuItem {
  quantity: number;
  selectedVariation?: Variation;
  selectedAddOns?: AddOn[];
  totalPrice: number;
}

export interface OrderData {
  items: CartItem[];
  customerName: string;
  contactNumber: string;
  serviceType: 'dine-in' | 'pickup' | 'delivery';
  address?: string;
  pickupTime?: string;
  // Dine-in specific fields
  partySize?: number;
  dineInTime?: string;
  paymentMethod: 'gcash' | 'maya' | 'bank-transfer';
  referenceNumber?: string;
  total: number;
  notes?: string;
}

export type PaymentMethod = 'gcash' | 'maya' | 'bank-transfer';
export type ServiceType = 'dine-in' | 'pickup' | 'delivery';

// Site Settings Types
export interface SiteSetting {
  id: string;
  value: string;
  type: 'text' | 'image' | 'boolean' | 'number';
  description?: string;
  updated_at: string;
}

export interface SiteSettings {
  site_name: string;
  site_logo: string;
  site_description: string;
  currency: string;
  currency_code: string;
}

// Affiliate and Referral Types
export interface Affiliate {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  referral_code: string;
  status: 'active' | 'inactive' | 'suspended';
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  customer_name: string;
  contact_number: string;
  service_type: ServiceType;
  total: number;
  payment_method?: string;
  reference_number?: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  referred_by?: string;
  referral_code?: string;
  affiliate_id?: string;
  delivery_address?: string;
  pickup_time?: string;
  party_size?: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ReferralAnalytics {
  affiliate_id: string;
  affiliate_name: string;
  referral_code: string;
  total_referrals: number;
  total_sales: number;
  last_referral_date?: string;
  referrals_this_week: number;
  referrals_this_month: number;
}

export interface ReferralStats {
  total_affiliates: number;
  active_affiliates: number;
  total_referrals: number;
  total_sales: number;
  avg_order_value: number;
  top_affiliate_name?: string;
  top_affiliate_sales: number;
}