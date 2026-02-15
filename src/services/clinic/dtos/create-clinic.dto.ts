export interface CreateClinicDto {
  cnpj : string
  name: string;
  ownerId: string;
  description?: string;
  avatarUrl?: string;
}