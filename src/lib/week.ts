
export function isDoneThisWeek(lastdone: string | null): boolean {
  if (!lastdone) return false;
  return lastdone === todayStr(); // selesai cuma kalau tanggalnya PERSIS hari ini
}

export function todayStr(): string {
  return new Date().toISOString().split("T")[0]; // format: YYYY-MM-DD
}