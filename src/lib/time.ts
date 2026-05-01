export function parseTimeToMinutes(time: string): number | null {
  // Accepts "04:30 AM", "4:30 PM", "16:45"
  const t = time.trim().toUpperCase();

  const ampmMatch = t.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/);
  if (ampmMatch) {
    let h = Number(ampmMatch[1]);
    const m = Number(ampmMatch[2]);
    const ap = ampmMatch[3] as "AM" | "PM";
    if (Number.isNaN(h) || Number.isNaN(m) || m < 0 || m > 59 || h < 1 || h > 12) return null;
    if (h === 12) h = 0;
    if (ap === "PM") h += 12;
    return h * 60 + m;
  }

  const h24Match = t.match(/^(\d{1,2}):(\d{2})$/);
  if (h24Match) {
    const h = Number(h24Match[1]);
    const m = Number(h24Match[2]);
    if (Number.isNaN(h) || Number.isNaN(m) || m < 0 || m > 59 || h < 0 || h > 23) return null;
    return h * 60 + m;
  }

  return null;
}

export function nowMinutesLocal() {
  const d = new Date();
  return d.getHours() * 60 + d.getMinutes();
}

