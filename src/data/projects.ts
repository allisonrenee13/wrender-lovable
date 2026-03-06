import mapPaperPalace from "@/assets/map-paper-palace.jpg";
import mapTheGiver from "@/assets/map-the-giver.jpg";
import mapAcotar from "@/assets/map-acotar.jpg";

export type PinType = "plot" | "character" | "location";

export interface Pin {
  id: string;
  title: string;
  type: PinType;
  chapter: number;
  location: string;
  note: string;
  x: number; // percentage position on map
  y: number;
}

export interface Character {
  id: string;
  name: string;
  initial: string;
}

export interface Location {
  id: string;
  name: string;
  description: string;
  eventCount: number;
}

export interface TimelineEvent {
  id: string;
  title: string;
  chapter: number;
  character: string;
  characterInitial: string;
  pinType: PinType;
  location: string;
}

export interface Project {
  id: string;
  title: string;
  genre: string;
  setting: string;
  wordCount: string;
  lastEdited: string;
  mapImage: string;
  pins: Pin[];
  characters: Character[];
  locations: Location[];
  timeline: TimelineEvent[];
  recentActivity: string[];
}

export const projects: Project[] = [
  {
    id: "paper-palace",
    title: "The Paper Palace",
    genre: "Literary Fiction",
    setting: "Cape Cod, Massachusetts",
    wordCount: "89,234",
    lastEdited: "March 4, 2026",
    mapImage: mapPaperPalace,
    pins: [
      { id: "pp1", title: "The Woods — What Happened", type: "plot", chapter: 3, location: "The Woods", note: "Elle's darkest memory", x: 65, y: 30 },
      { id: "pp2", title: "Elle's Decision", type: "plot", chapter: 1, location: "The Pond", note: "The central dilemma of the novel", x: 45, y: 45 },
      { id: "pp3", title: "The Paper Palace", type: "location", chapter: 1, location: "The House", note: "The heart of everything — every summer returns here", x: 25, y: 55 },
      { id: "pp4", title: "Jonas Returns", type: "character", chapter: 2, location: "The Pond", note: "Childhood love reappears after decades", x: 50, y: 50 },
      { id: "pp5", title: "The Boathouse", type: "location", chapter: 8, location: "Boathouse", note: "Hidden meetings, old secrets", x: 70, y: 70 },
    ],
    characters: [
      { id: "c1", name: "Elle Bishop", initial: "E" },
      { id: "c2", name: "Jonas", initial: "J" },
      { id: "c3", name: "Peter", initial: "P" },
      { id: "c4", name: "Wallace", initial: "W" },
      { id: "c5", name: "Anna", initial: "A" },
    ],
    locations: [
      { id: "l1", name: "The Paper Palace", description: "The weathered summer house where every summer returns", eventCount: 3 },
      { id: "l2", name: "The Pond", description: "Still water reflecting decades of memory", eventCount: 2 },
      { id: "l3", name: "The Woods", description: "Dense Cape Cod forest hiding old secrets", eventCount: 1 },
      { id: "l4", name: "The Boathouse", description: "Hidden at the water's edge, scene of secret meetings", eventCount: 1 },
      { id: "l5", name: "The Old Cape Road", description: "Winding road connecting all the landmarks of summer", eventCount: 0 },
    ],
    timeline: [
      { id: "t1", title: "Elle's Decision", chapter: 1, character: "Elle", characterInitial: "E", pinType: "plot", location: "The Pond" },
      { id: "t2", title: "Jonas Returns", chapter: 2, character: "Jonas", characterInitial: "J", pinType: "character", location: "The Pond" },
      { id: "t3", title: "The Woods — What Happened", chapter: 3, character: "Elle", characterInitial: "E", pinType: "plot", location: "The Woods" },
      { id: "t4", title: "The Boathouse", chapter: 8, character: "Elle", characterInitial: "E", pinType: "location", location: "Boathouse" },
    ],
    recentActivity: [
      "Added pin: The Lighthouse — Chapter 4",
      "New location: The Boathouse",
      "Character added: Jonas",
      "Updated pin: Elle's Decision",
    ],
  },
  {
    id: "the-giver",
    title: "The Giver",
    genre: "Dystopian Fiction",
    setting: "The Community",
    wordCount: "43,617",
    lastEdited: "March 2, 2026",
    mapImage: mapTheGiver,
    pins: [
      { id: "g1", title: "Ceremony of Twelve — Jonas Selected", type: "plot", chapter: 7, location: "The Auditorium", note: "Jonas is assigned his life role", x: 50, y: 50 },
      { id: "g2", title: "First Memory Received — Sledding", type: "plot", chapter: 10, location: "The Annex", note: "The Giver transmits the first memory", x: 85, y: 60 },
      { id: "g3", title: "Gabriel Scheduled for Release", type: "plot", chapter: 20, location: "Family Unit", note: "The baby's fate is sealed", x: 35, y: 40 },
      { id: "g4", title: "The Escape Begins", type: "plot", chapter: 21, location: "The River", note: "Jonas flees with Gabriel", x: 20, y: 80 },
      { id: "g5", title: "The Boundary of Elsewhere", type: "location", chapter: 23, location: "The River's Edge", note: "The edge of the known world", x: 10, y: 85 },
      { id: "g6", title: "The Giver's Annex", type: "character", chapter: 10, location: "The Annex", note: "Where all memories are held", x: 80, y: 55 },
    ],
    characters: [
      { id: "c1", name: "Jonas", initial: "J" },
      { id: "c2", name: "The Giver", initial: "G" },
      { id: "c3", name: "Gabriel", initial: "B" },
      { id: "c4", name: "Fiona", initial: "F" },
      { id: "c5", name: "Asher", initial: "A" },
      { id: "c6", name: "Jonas's Father", initial: "D" },
    ],
    locations: [
      { id: "l1", name: "The Community", description: "An ordered, controlled society of sameness", eventCount: 2 },
      { id: "l2", name: "The Annex", description: "The Giver's dwelling at the edge of the community", eventCount: 2 },
      { id: "l3", name: "Jonas's Family Unit", description: "A standard dwelling unit in the community", eventCount: 1 },
      { id: "l4", name: "The River", description: "The boundary separating the community from Elsewhere", eventCount: 2 },
      { id: "l5", name: "The Auditorium", description: "Where ceremonies and assignments take place", eventCount: 1 },
      { id: "l6", name: "Elsewhere", description: "Beyond the boundary — the unknown", eventCount: 1 },
    ],
    timeline: [
      { id: "t1", title: "Ceremony of Twelve", chapter: 7, character: "Jonas", characterInitial: "J", pinType: "plot", location: "The Auditorium" },
      { id: "t2", title: "First Memory Received", chapter: 10, character: "The Giver", characterInitial: "G", pinType: "plot", location: "The Annex" },
      { id: "t3", title: "Gabriel's Fate", chapter: 20, character: "Gabriel", characterInitial: "B", pinType: "plot", location: "Family Unit" },
      { id: "t4", title: "The Escape Begins", chapter: 21, character: "Jonas", characterInitial: "J", pinType: "plot", location: "The River" },
      { id: "t5", title: "Elsewhere", chapter: 23, character: "Jonas", characterInitial: "J", pinType: "location", location: "The River's Edge" },
    ],
    recentActivity: [
      "Added pin: The Escape Begins — Chapter 21",
      "New location: Elsewhere",
      "Character added: Gabriel",
      "Updated timeline: Chapter 10",
    ],
  },
  {
    id: "acotar",
    title: "A Court of Thorns and Roses",
    genre: "Fantasy",
    setting: "Prythian",
    wordCount: "113,442",
    lastEdited: "March 5, 2026",
    mapImage: mapAcotar,
    pins: [
      { id: "a1", title: "Feyre Kills the Wolf", type: "plot", chapter: 1, location: "Forest of Wolves", note: "The act that changes everything", x: 15, y: 45 },
      { id: "a2", title: "Taken to Prythian", type: "plot", chapter: 4, location: "The Wall", note: "Feyre crosses into the faerie realm", x: 40, y: 50 },
      { id: "a3", title: "The Spring Court Manor", type: "location", chapter: 6, location: "Spring Court", note: "Central location — lush, enchanted, dangerous", x: 65, y: 55 },
      { id: "a4", title: "Rhysand First Appears", type: "character", chapter: 15, location: "Spring Court", note: "A glimpse of the Night Court's High Lord", x: 60, y: 45 },
      { id: "a5", title: "The Three Trials Begin", type: "plot", chapter: 28, location: "Under the Mountain", note: "Feyre faces Amarantha's challenges", x: 50, y: 15 },
      { id: "a6", title: "Amarantha's Riddle", type: "plot", chapter: 35, location: "Under the Mountain", note: "The final test", x: 55, y: 20 },
      { id: "a7", title: "The Wall", type: "location", chapter: 4, location: "The Wall", note: "The boundary between worlds", x: 38, y: 55 },
    ],
    characters: [
      { id: "c1", name: "Feyre Archeron", initial: "F" },
      { id: "c2", name: "Tamlin", initial: "T" },
      { id: "c3", name: "Lucien", initial: "L" },
      { id: "c4", name: "Rhysand", initial: "R" },
      { id: "c5", name: "Amarantha", initial: "A" },
      { id: "c6", name: "Alis", initial: "S" },
    ],
    locations: [
      { id: "l1", name: "The Mortal Lands", description: "Feyre's impoverished homeland beyond the Wall", eventCount: 1 },
      { id: "l2", name: "The Wall", description: "Ancient barrier between mortal and faerie realms", eventCount: 2 },
      { id: "l3", name: "The Forest of Wolves", description: "Dense woodland where Feyre hunts to survive", eventCount: 1 },
      { id: "l4", name: "The Spring Court Manor", description: "Tamlin's enchanted estate, beautiful and perilous", eventCount: 2 },
      { id: "l5", name: "Under the Mountain", description: "Amarantha's dark domain beneath the earth", eventCount: 2 },
      { id: "l6", name: "The Night Court", description: "Glimpsed realm of starlight and shadow", eventCount: 0 },
      { id: "l7", name: "The River Road", description: "Path winding through the faerie lands", eventCount: 0 },
    ],
    timeline: [
      { id: "t1", title: "Feyre Kills the Wolf", chapter: 1, character: "Feyre", characterInitial: "F", pinType: "plot", location: "Forest of Wolves" },
      { id: "t2", title: "Taken to Prythian", chapter: 4, character: "Feyre", characterInitial: "F", pinType: "plot", location: "The Wall" },
      { id: "t3", title: "The Spring Court", chapter: 6, character: "Tamlin", characterInitial: "T", pinType: "location", location: "Spring Court" },
      { id: "t4", title: "Rhysand Appears", chapter: 15, character: "Rhysand", characterInitial: "R", pinType: "character", location: "Spring Court" },
      { id: "t5", title: "The Three Trials", chapter: 28, character: "Feyre", characterInitial: "F", pinType: "plot", location: "Under the Mountain" },
      { id: "t6", title: "Amarantha's Riddle", chapter: 35, character: "Feyre", characterInitial: "F", pinType: "plot", location: "Under the Mountain" },
    ],
    recentActivity: [
      "Added pin: Amarantha's Riddle — Chapter 35",
      "New location: Under the Mountain",
      "Character added: Rhysand",
      "Updated map: The Wall boundary",
    ],
  },
];
