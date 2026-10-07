export type ExpenseCategory =
  | 'gasolina'
  | 'mecanico'
  | 'reparo'
  | 'revisao'
  | 'pneus'
  | 'ipva_taxas'
  | 'seguro'
  | 'lavagem'
  | 'estacionamento'
  | 'multas'
  | 'acessorios'
  | 'outros';

export type PaymentMethod =
  | 'pix'
  | 'cartao_credito'
  | 'cartao_debito'
  | 'dinheiro'
  | 'outro';

export interface Vehicle {
  id: string;
  userId: string;
  name: string;
  plate?: string;
  year?: number;
  initialKm?: number;
  currentKm?: number;
  fuelType?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  userId: string;
  vehicleId?: string;
  date: string; // YYYY-MM-DD
  year: number; // e.g. 2026
  month: number; // 1 to 12
  category: ExpenseCategory;
  title: string;
  amount: number;
  odometerKm?: number;
  paymentMethod?: PaymentMethod | string;
  location?: string;
  notes?: string;
  liters?: number;
  pricePerLiter?: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  currency?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryInfo {
  id: ExpenseCategory;
  label: string;
  iconName: string;
  color: string;
  bgColor: string;
  badgeColor: string;
  description: string;
}
