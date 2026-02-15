export interface RegisterFranchiseDto {
  clinicId: string;
  userId: string;
  name: string;
  address: string;
  zipCode: string;
  description?: string;
}