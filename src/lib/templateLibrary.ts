import type { TracedPath } from "@/components/map/builder/types";

export interface TemplateEntry {
  id: string;
  name: string;
  svgPaths: TracedPath[];
  thumbnailDataUrl: string;
  isPublic: boolean;
  createdAt: string;
}

const STORAGE_KEY = "wrender_templates";

function readAll(): TemplateEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeAll(entries: TemplateEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

export function saveTemplate(
  entry: Omit<TemplateEntry, "id" | "createdAt">
): TemplateEntry {
  const all = readAll();
  const newEntry: TemplateEntry = {
    ...entry,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };
  all.push(newEntry);
  writeAll(all);
  return newEntry;
}

export function getTemplates(): TemplateEntry[] {
  return readAll();
}

export function togglePublic(id: string): void {
  const all = readAll();
  const entry = all.find((e) => e.id === id);
  if (entry) {
    entry.isPublic = !entry.isPublic;
    writeAll(all);
  }
}

export function deleteTemplate(id: string): void {
  writeAll(readAll().filter((e) => e.id !== id));
}
