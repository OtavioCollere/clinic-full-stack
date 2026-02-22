export interface CreateProcedureDto {
  franchiseId: string;
  name: string;
  price: number;
  notes?: string;
  createForAllFranchises?: boolean;
  clinicId?: string;
}