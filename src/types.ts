export type ProductStatus = 'published' | 'draft';
export type AvailabilityStatus = 'available' | 'sold_out';

export interface Product {
  id: string;
  name: string;
  description: string;
  priceCOP?: number | null; // null/undefined => "Consultar precio"
  category: string;
  sizes: string[];
  colors?: string[];
  images: string[];
  featured?: boolean;
  isNew?: boolean;
  status: ProductStatus;
  availability: AvailabilityStatus;
  isDemo?: boolean; // Distingue datos de ejemplo para el diseño
  createdAt: number;
  updatedAt: number;
}

export interface WhatsAppContact {
  id: string;
  label: string;
  number: string;      // ej: "3054286540"
  formatted: string;   // ej: "305 428 6540"
  cleanIntl: string;   // ej: "573054286540"
  description: string;
}

export const WHATSAPP_CONTACTS: WhatsAppContact[] = [
  {
    id: 'linea-1',
    label: 'Línea 1',
    number: '3054286540',
    formatted: '305 428 6540',
    cleanIntl: '573054286540',
    description: 'Atención y pedidos inmediatos'
  },
  {
    id: 'linea-2',
    label: 'Línea 2',
    number: '3017230715',
    formatted: '301 723 0715',
    cleanIntl: '573017230715',
    description: 'Asesoría de tallas y catálogo'
  }
];

export const INSTAGRAM_HANDLE = '@dimara_dr';
export const INSTAGRAM_URL = 'https://www.instagram.com/dimara_dr/';

export interface AdminAuthStatus {
  hasAdmin: boolean;
  authenticated: boolean;
  adminEmail?: string;
}
