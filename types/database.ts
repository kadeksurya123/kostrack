export type PaymentStatus = 'LUNAS' | 'BELUM BAYAR' | 'TERLAMBAT';
export type PaymentMethod = 'Cash' | 'Transfer' | 'E-Wallet';
export type RoomStatus = 'available' | 'occupied' | 'maintenance';
export type TenantStatus = 'active' | 'inactive';

export interface Profile {
  id: string;
  full_name: string;
  role: 'admin';
  created_at: string;
}

export interface BoardingSettings {
  id: string;
  boarding_name: string;
  boarding_address: string | null;
  due_day: number;
  public_name_masking: boolean;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  room_number: string;
  monthly_price: number;
  description: string | null;
  status: RoomStatus;
  created_at: string;
  updated_at: string;
}

export interface Tenant {
  id: string;
  full_name: string;
  public_name: string;
  phone: string | null;
  room_id: string | null;
  move_in_date: string;
  move_out_date: string | null;
  status: TenantStatus;
  created_at: string;
  updated_at: string;
  rooms?: Room | null;
}

export interface Payment {
  id: string;
  tenant_id: string;
  period_month: number;
  period_year: number;
  amount: number;
  payment_date: string | null;
  payment_method: PaymentMethod | null;
  status: PaymentStatus;
  notes: string | null;
  created_at: string;
  updated_at: string;
  tenants?: (Tenant & { rooms?: Room | null }) | null;
}

export interface PublicPaymentItem {
  payment_id: string;
  tenant_name: string;
  room_number: string;
  period_month: number;
  period_year: number;
  amount: number;
  payment_date: string | null;
  status: PaymentStatus;
  due_day: number;
}
