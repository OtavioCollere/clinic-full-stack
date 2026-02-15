export function validateCNPJ(cnpj: string): boolean {
  const cleaned = cnpj.replace(/\D/g, '');

  // Must have 14 digits
  if (cleaned.length !== 14) return false;

  // Reject repeated sequences (00000000000000, 11111111111111, etc.)
  if (/^(\d)\1+$/.test(cleaned)) return false;

  const calculateCheckDigit = (base: string, weights: number[]) => {
    const sum = base
      .split('')
      .reduce((acc, digit, index) => {
        return acc + Number(digit) * weights[index];
      }, 0);

    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstWeights = [5,4,3,2,9,8,7,6,5,4,3,2];
  const secondWeights = [6,5,4,3,2,9,8,7,6,5,4,3,2];

  const firstDigit = calculateCheckDigit(cleaned.substring(0, 12), firstWeights);
  const secondDigit = calculateCheckDigit(
    cleaned.substring(0, 12) + firstDigit,
    secondWeights
  );

  return (
    firstDigit === Number(cleaned[12]) &&
    secondDigit === Number(cleaned[13])
  );
}
