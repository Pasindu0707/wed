export function makeKey(prefix: string, i: number) {
  return `${prefix}_${String(i + 1).padStart(3, "0")}`;
}

export function nowIso() {
  return new Date().toISOString();
}

