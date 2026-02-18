export interface RegisterUserDto {
  name: string;
  cpf: string;
  email: string;
  password?: string; // Opcional - será gerada no backend se não fornecida
}