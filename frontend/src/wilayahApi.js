const WILAYAH_API_URL = "https://wilayah.id/api";

export async function listRegions(level, parentCode = "") {
  const path = parentCode
    ? `${level}/${encodeURIComponent(parentCode)}.json`
    : `${level}.json`;
  const response = await fetch(`${WILAYAH_API_URL}/${path}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`Data wilayah tidak dapat dimuat (${response.status}).`);
  }

  const result = await response.json();
  if (!Array.isArray(result.data)) {
    throw new Error("Format data wilayah tidak sesuai.");
  }

  return result.data;
}
