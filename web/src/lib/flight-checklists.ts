export type ChecklistItem = {
  item: string;
  ok: boolean;
  notes?: string;
};

export const DEFAULT_PREFLIGHT: ChecklistItem[] = [
  { item: "Mission objective & flight plan confirmed", ok: false },
  { item: "Airspace authorisation / NOTAMs checked", ok: false },
  { item: "Site survey — hazards, people, obstacles identified", ok: false },
  { item: "Weather within operating limits (wind, visibility, precipitation)", ok: false },
  { item: "Aircraft inspection: airframe, propellers, motors, gimbal", ok: false },
  { item: "Batteries charged, within cycle limits, temperature OK", ok: false },
  { item: "Remote controller charged & firmware current", ok: false },
  { item: "Storage media installed (SD card / SSD)", ok: false },
  { item: "Compass calibration & GPS lock acquired", ok: false },
  { item: "RTH altitude set above local obstacles", ok: false },
  { item: "Emergency procedures briefed with crew/observer", ok: false },
];

export const DEFAULT_POSTFLIGHT: ChecklistItem[] = [
  { item: "Aircraft powered down safely & propellers stopped", ok: false },
  { item: "Visual inspection: airframe, propellers, gimbal undamaged", ok: false },
  { item: "Battery temperature within safe range before storage", ok: false },
  { item: "Flight logs / SD card data secured", ok: false },
  { item: "Anomalies, warnings or incidents documented", ok: false },
  { item: "Aircraft cleaned & stored in protective case", ok: false },
  { item: "Maintenance items flagged to engineering, if any", ok: false },
];

export function normalizeChecklist(
  raw: unknown,
  fallback: ChecklistItem[],
): ChecklistItem[] {
  if (!Array.isArray(raw) || raw.length === 0) return fallback.map((c) => ({ ...c }));
  return raw
    .filter((c): c is Record<string, unknown> => typeof c === "object" && c !== null)
    .map((c) => ({
      item: String(c.item ?? ""),
      ok: Boolean(c.ok),
      notes: c.notes ? String(c.notes) : undefined,
    }));
}

export function checklistCompletion(items: ChecklistItem[]): {
  done: number;
  total: number;
  percent: number;
} {
  const total = items.length;
  const done = items.filter((i) => i.ok).length;
  return { done, total, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}
