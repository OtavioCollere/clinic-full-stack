export function validateCPF(cpf: string): boolean {
  const cleaned = cpf.replace(/\D/g, '');

  if (cleaned.length !== 11) return false;
  if (/^(\d)\1+$/.test(cleaned)) return false;

  const calcCheckDigit = (base: string, factor: number) => {
    let total = 0;
    for (let i = 0; i < base.length; i++) {
      total += Number(base[i]) * factor--;
    }
    const remainder = (total * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  const digit1 = calcCheckDigit(cleaned.substring(0, 9), 10);
  const digit2 = calcCheckDigit(cleaned.substring(0, 10), 11);

  return digit1 === Number(cleaned[9]) &&
         digit2 === Number(cleaned[10]);
}
