export function digitsOnly(value) {
  return String(value ?? "").replace(/\D/g, "");
}

export function formatThousands(value) {
  return digitsOnly(value).replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}
