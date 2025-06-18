export interface Product {
  id: number;
  name: string;
  category: string;
  packet_price: number;
  special_price: number;
  stock_quantity: number;
  unit: string;
}

export interface CartItem {
  id?: number;
  name: string;
  quantity: number;
  category: string;
  unit: string;
  special_price?: number;
  packet_price?: number;
  is_custom?: boolean;
  price?: number;
}

export interface Receipt {
  shop_name: string;
  date: string;
  items: {
    name: string;
    quantity: number;
    packet_price: string;
    special_price: string;
    total: string;
    category: string;
    unit: string;
  }[];
  total: string;
  cash_paid: string;
  change: string;
  savings: string;
}

export interface Report {
  type: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  endDate: string;
  totalSales: string;
  transactionCount: number;
  itemsSold: {
    name: string;
    quantity: number;
    total: string;
  }[];
}