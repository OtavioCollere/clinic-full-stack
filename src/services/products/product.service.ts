import { api } from "@/lib/api";

export type ProductStatus = "ACTIVE" | "INACTIVE";

export interface Product {
  id: string;
  franchiseId: string;
  name: string;
  price: number;
  costPrice?: number | null;
  notes?: string | null;
  status: ProductStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateProductPayload {
  franchiseId: string;
  name: string;
  price: number;
  costPrice?: number;
  notes?: string;
  status?: ProductStatus;
}

export interface EditProductPayload {
  name?: string;
  price?: number;
  costPrice?: number;
  notes?: string;
  status?: ProductStatus;
}

export async function getProductsByClinicId(clinicId: string): Promise<Product[]> {
  const response = await api.get<Product[]>(`/clinics/${clinicId}/products`);
  return response.data;
}

export async function getProductsByFranchiseId(franchiseId: string): Promise<Product[]> {
  const response = await api.get<Product[]>(`/franchises/${franchiseId}/products`);
  return response.data;
}

export async function getProductById(productId: string): Promise<Product> {
  const response = await api.get<Product>(`/products/${productId}`);
  return response.data;
}

export async function createProduct(data: CreateProductPayload): Promise<Product> {
  const response = await api.post<Product>("/products", data);
  return response.data;
}

export async function editProduct(productId: string, data: EditProductPayload): Promise<Product> {
  const response = await api.put<Product>(`/products/${productId}`, data);
  return response.data;
}

export async function inactivateProduct(productId: string): Promise<void> {
  await api.patch(`/products/${productId}/inactivate`);
}

export async function deleteProduct(productId: string): Promise<void> {
  await api.delete(`/products/${productId}`);
}
