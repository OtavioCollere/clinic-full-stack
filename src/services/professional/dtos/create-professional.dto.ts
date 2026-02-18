export interface CreateProfessionalDto {
  franchiseId : string,
  name : string,
  cpf : string,
  email : string,
  ownerId : string,
  council? : string,
  councilNumber? : string,
  councilState? : string,
  profession? : string,
}