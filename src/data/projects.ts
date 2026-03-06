export type PinType = "plot" | "character" | "location";
export type EventTier = "main" | "minor";
export type LocationStatus = "pinned" | "illustrated";

export interface Pin {
  id: string;
  title: string;
  type: PinType;
  tier: EventTier;
  chapter: number;
  location: string;
  note: string;
  x: number;
  y: number;
  placed?: boolean;
}

export interface Character {
  id: string;
  name: string;
  initial: string;
  role: string;
  age: string;
  firstAppears: number;
  traits: string[];
  notes: string;
  photo: string | null;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  type: string;
  firstAppears: number;
  eventCount: number;
  photo: string | null;
  status: LocationStatus;
}

export interface MapVersion {
  id: string;
  version: number;
  label: string;
  description: string;
  date: string;
  mapImage: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  tier: EventTier;
  chapter: number;
  character: string;
  characterInitial: string;
  pinType: PinType;
  location: string;
}

export interface MapState {
  canvasJSON: string | null;
  renderedSVG: string | null;
  currentStep: 1 | 2 | 3;
  stylePrefs: {
    lineStyle: string;
    strokeWeight: string;
    background: string;
    labelStyle: string;
  } | null;
}

export interface Project {
  id: string;
  title: string;
  genre: string;
  setting: string;
  wordCount: string;
  lastEdited: string;
  mapImage: string;
  mapConfirmed: boolean;
  pins: Pin[];
  characters: Character[];
  locations: Location[];
  timeline: TimelineEvent[];
  recentActivity: string[];
  mapVersions: MapVersion[];
  mapState?: MapState;
}

// Start with zero projects — writer creates their own
export const projects: Project[] = [];
