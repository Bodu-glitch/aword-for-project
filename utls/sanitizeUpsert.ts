export default function sanitizeUpsert(values: any) {
  if (!values || typeof values !== "object") return values;
  const out: any = { ...values };

  Object.keys(values).forEach((key) => {
    const v = (values as any)[key];
    if (!v) return;
    if (typeof v === "object" && !Array.isArray(v)) {
      // If it's an object with an id, map it to <base>_id
      if ("id" in v && (v as any).id) {
        // Determine base key: if key ends with _id, strip it
        const base = key.endsWith("_id") ? key.slice(0, -3) : key;
        const idKey = `${base}_id`;
        // If caller already provided an explicit id value, prefer it, otherwise use nested id
        const explicit = (values as any)[idKey];
        out[idKey] = typeof explicit === "string" && explicit ? explicit : (v as any).id;
      }
      // Remove nested object to avoid sending full object to upsert
      delete out[key];
    }
  });

  return out;
}

