export * from './database';

export interface PublicApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    totalPaid: number;
    totalUnpaid: number;
    totalLate: number;
    totalTenants: number;
    boardingName: string;
    dueDay: number;
    month: number;
    year: number;
  };
  error?: string;
}

export interface DashboardStats {
  totalActiveTenants: number;
  totalRooms: number;
  occupiedRooms: number;
  vacantRooms: number;
  totalIncomeThisMonth: number;
  paidCountThisMonth: number;
  unpaidCountThisMonth: number;
  lateCountThisMonth: number;
}
