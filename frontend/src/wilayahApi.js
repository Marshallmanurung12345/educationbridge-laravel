import { api } from "./api";

export async function listRegions(level, parentCode = "") {
  const result = await api.listRegions(level, parentCode);
  if (!Array.isArray(result?.data)) {
    throw new Error("Format data wilayah tidak sesuai.");
  }

  return result.data;
}
