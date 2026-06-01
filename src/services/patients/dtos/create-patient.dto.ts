export interface CreatePatientDto {
  clinicId: string;
  name: string;
  cpf: string;
  email: string;
  phone?: string;
  birthDay: Date;
  address: string;
  zipCode: string;
}