/**
 * F.Horn Self Storage — Admin Dashboard type definitions.
 */

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'admin' | 'editor';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AdminBox {
  id: string;
  name: string;
  slug: string;
  volume: number;
  volumeLabel: string;
  dimensions: { width: number; height: number; depth: number };
  dimensionLabel: string;
  image: { src: string; fallback: string; width: number; height: number; alt: string };
  description: string;
  sampleItems: string[];
  isDemonstrative: boolean;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
}

export interface PageView {
  id: string;
  path: string;
  referrer: string;
  userAgent: string;
  timestamp: string;
}
