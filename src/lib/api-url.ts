const DEFAULT_API_URL = "https://cliniker-api-769327558062.southamerica-east1.run.app";

export function getApiUrl() {
  const value = process.env.NEXT_PUBLIC_API_URL?.trim() || DEFAULT_API_URL;
  return value.replace(/[|/]+$/g, "");
}
