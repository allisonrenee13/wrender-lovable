import mapPaperPalace from "@/assets/map-paper-palace.jpg";
import mapTheGiver from "@/assets/map-the-giver.jpg";
import mapAcotar from "@/assets/map-acotar.jpg";

export type PinType = "plot" | "character" | "location";
export type EventTier = "main" | "minor";

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
      { id: "pp1", title: "The Woods — What Happened", type: "plot", tier: "main", chapter: 3, location: "The Woods", note: "Elle's darkest memory", x: 65, y: 30 },
      { id: "pp2", title: "Elle's Decision", type: "plot", tier: "main", chapter: 1, location: "The Pond", note: "The central dilemma of the novel", x: 45, y: 45 },
      { id: "pp3", title: "The Paper Palace", type: "location", tier: "main", chapter: 1, location: "The House", note: "The heart of everything — every summer returns here", x: 25, y: 55 },
      { id: "pp4", title: "Jonas Returns", type: "character", tier: "main", chapter: 2, location: "The Pond", note: "Childhood love reappears after decades", x: 50, y: 50 },
      { id: "pp5", title: "The Boathouse", type: "location", tier: "main", chapter: 8, location: "Boathouse", note: "Hidden meetings, old secrets", x: 70, y: 70 },
      { id: "pp6", title: "Wallace pours a drink", type: "plot", tier: "minor", chapter: 2, location: "The House", note: "Sets the tone of the household", x: 28, y: 52 },
      { id: "pp7", title: "Kids swim at the pond", type: "plot", tier: "minor", chapter: 4, location: "The Pond", note: "Innocence contrasting with secrets", x: 48, y: 48 },
      { id: "pp8", title: "Anna arrives by car", type: "character", tier: "minor", chapter: 3, location: "The House", note: "Elle's sister makes her entrance", x: 22, y: 58 },
    ],
    characters: [
      { id: "c1", name: "Elle Bishop", initial: "E", role: "Protagonist", age: "50", firstAppears: 1, traits: ["Torn", "Passionate", "Haunted"], notes: "The narrator. Caught between two loves.", photo: null },
      { id: "c2", name: "Jonas", initial: "J", role: "Supporting", age: "52", firstAppears: 1, traits: ["Magnetic", "Patient", "Tender"], notes: "Childhood love who returns.", photo: null },
      { id: "c3", name: "Peter", initial: "P", role: "Supporting", age: "53", firstAppears: 1, traits: ["Steady", "Oblivious", "Kind"], notes: "Elle's husband.", photo: null },
      { id: "c4", name: "Wallace", initial: "W", role: "Supporting", age: "75", firstAppears: 2, traits: ["Eccentric", "Wise", "Broken"], notes: "Elle's mother's partner.", photo: null },
      { id: "c5", name: "Anna", initial: "A", role: "Supporting", age: "48", firstAppears: 3, traits: ["Loyal", "Sharp", "Protective"], notes: "Elle's sister.", photo: null },
    ],
    locations: [
      { id: "l1", name: "The Paper Palace", description: "The weathered summer house where every summer returns", type: "House", firstAppears: 1, eventCount: 3, photo: null },
      { id: "l2", name: "The Pond", description: "Still water reflecting decades of memory", type: "Landmark", firstAppears: 1, eventCount: 2, photo: null },
      { id: "l3", name: "The Woods", description: "Dense Cape Cod forest hiding old secrets", type: "Landmark", firstAppears: 3, eventCount: 1, photo: null },
      { id: "l4", name: "The Boathouse", description: "Hidden at the water's edge, scene of secret meetings", type: "Landmark", firstAppears: 8, eventCount: 1, photo: null },
      { id: "l5", name: "The Old Cape Road", description: "Winding road connecting all the landmarks of summer", type: "Road", firstAppears: 1, eventCount: 0, photo: null },
    ],
    timeline: [
      { id: "t1", title: "Elle's Decision", tier: "main", chapter: 1, character: "Elle", characterInitial: "E", pinType: "plot", location: "The Pond" },
      { id: "t2", title: "Jonas Returns", tier: "main", chapter: 2, character: "Jonas", characterInitial: "J", pinType: "character", location: "The Pond" },
      { id: "t2b", title: "Wallace pours a drink", tier: "minor", chapter: 2, character: "Wallace", characterInitial: "W", pinType: "plot", location: "The House" },
      { id: "t3", title: "The Woods — What Happened", tier: "main", chapter: 3, character: "Elle", characterInitial: "E", pinType: "plot", location: "The Woods" },
      { id: "t3b", title: "Anna arrives by car", tier: "minor", chapter: 3, character: "Anna", characterInitial: "A", pinType: "character", location: "The House" },
      { id: "t4", title: "Kids swim at the pond", tier: "minor", chapter: 4, character: "Elle", characterInitial: "E", pinType: "plot", location: "The Pond" },
      { id: "t5", title: "The Boathouse", tier: "main", chapter: 8, character: "Elle", characterInitial: "E", pinType: "location", location: "Boathouse" },
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
      { id: "g1", title: "Ceremony of Twelve — Jonas Selected", type: "plot", tier: "main", chapter: 7, location: "The Auditorium", note: "Jonas is assigned his life role", x: 50, y: 50 },
      { id: "g2", title: "First Memory Received — Sledding", type: "plot", tier: "main", chapter: 10, location: "The Annex", note: "The Giver transmits the first memory", x: 85, y: 60 },
      { id: "g3", title: "Gabriel Scheduled for Release", type: "plot", tier: "main", chapter: 20, location: "Family Unit", note: "The baby's fate is sealed", x: 35, y: 40 },
      { id: "g4", title: "The Escape Begins", type: "plot", tier: "main", chapter: 21, location: "The River", note: "Jonas flees with Gabriel", x: 20, y: 80 },
      { id: "g5", title: "The Boundary of Elsewhere", type: "location", tier: "main", chapter: 23, location: "The River's Edge", note: "The edge of the known world", x: 10, y: 85 },
      { id: "g6", title: "The Giver's Annex", type: "character", tier: "main", chapter: 10, location: "The Annex", note: "Where all memories are held", x: 80, y: 55 },
      { id: "g7", title: "Jonas takes his morning pill", type: "plot", tier: "minor", chapter: 5, location: "Family Unit", note: "The stirrings suppression routine", x: 38, y: 42 },
      { id: "g8", title: "Asher is late again", type: "character", tier: "minor", chapter: 1, location: "The Auditorium", note: "Comedic character introduction", x: 52, y: 48 },
      { id: "g9", title: "Father brings Gabriel home", type: "character", tier: "minor", chapter: 3, location: "Family Unit", note: "First sign of attachment", x: 33, y: 38 },
    ],
    characters: [
      { id: "c1", name: "Jonas", initial: "J", role: "Protagonist", age: "12", firstAppears: 1, traits: ["Curious", "Brave", "Compassionate"], notes: "The Receiver of Memory.", photo: null },
      { id: "c2", name: "The Giver", initial: "G", role: "Supporting", age: "Unknown", firstAppears: 10, traits: ["Wise", "Burdened", "Kind"], notes: "The previous Receiver.", photo: null },
      { id: "c3", name: "Gabriel", initial: "B", role: "Supporting", age: "1", firstAppears: 3, traits: ["Innocent", "Special", "Vulnerable"], notes: "Baby Jonas saves.", photo: null },
      { id: "c4", name: "Fiona", initial: "F", role: "Supporting", age: "12", firstAppears: 1, traits: ["Gentle", "Red-haired", "Caring"], notes: "Jonas's friend.", photo: null },
      { id: "c5", name: "Asher", initial: "A", role: "Supporting", age: "12", firstAppears: 1, traits: ["Clumsy", "Cheerful", "Loyal"], notes: "Jonas's best friend.", photo: null },
      { id: "c6", name: "Jonas's Father", initial: "D", role: "Supporting", age: "40", firstAppears: 1, traits: ["Nurturing", "Obedient", "Blind"], notes: "A Nurturer in the community.", photo: null },
    ],
    locations: [
      { id: "l1", name: "The Community", description: "An ordered, controlled society of sameness", type: "Landmark", firstAppears: 1, eventCount: 2, photo: null },
      { id: "l2", name: "The Annex", description: "The Giver's dwelling at the edge of the community", type: "House", firstAppears: 10, eventCount: 2, photo: null },
      { id: "l3", name: "Jonas's Family Unit", description: "A standard dwelling unit in the community", type: "House", firstAppears: 1, eventCount: 1, photo: null },
      { id: "l4", name: "The River", description: "The boundary separating the community from Elsewhere", type: "Waterfront", firstAppears: 21, eventCount: 2, photo: null },
      { id: "l5", name: "The Auditorium", description: "Where ceremonies and assignments take place", type: "Landmark", firstAppears: 7, eventCount: 1, photo: null },
      { id: "l6", name: "Elsewhere", description: "Beyond the boundary — the unknown", type: "Landmark", firstAppears: 23, eventCount: 1, photo: null },
    ],
    timeline: [
      { id: "t0", title: "Asher is late again", tier: "minor", chapter: 1, character: "Asher", characterInitial: "A", pinType: "character", location: "The Auditorium" },
      { id: "t0b", title: "Father brings Gabriel home", tier: "minor", chapter: 3, character: "Jonas's Father", characterInitial: "D", pinType: "character", location: "Family Unit" },
      { id: "t0c", title: "Jonas takes his morning pill", tier: "minor", chapter: 5, character: "Jonas", characterInitial: "J", pinType: "plot", location: "Family Unit" },
      { id: "t1", title: "Ceremony of Twelve", tier: "main", chapter: 7, character: "Jonas", characterInitial: "J", pinType: "plot", location: "The Auditorium" },
      { id: "t2", title: "First Memory Received", tier: "main", chapter: 10, character: "The Giver", characterInitial: "G", pinType: "plot", location: "The Annex" },
      { id: "t3", title: "Gabriel's Fate", tier: "main", chapter: 20, character: "Gabriel", characterInitial: "B", pinType: "plot", location: "Family Unit" },
      { id: "t4", title: "The Escape Begins", tier: "main", chapter: 21, character: "Jonas", characterInitial: "J", pinType: "plot", location: "The River" },
      { id: "t5", title: "Elsewhere", tier: "main", chapter: 23, character: "Jonas", characterInitial: "J", pinType: "location", location: "The River's Edge" },
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
      { id: "a1", title: "Feyre Kills the Wolf", type: "plot", tier: "main", chapter: 1, location: "Forest of Wolves", note: "The act that changes everything", x: 15, y: 45 },
      { id: "a2", title: "Taken to Prythian", type: "plot", tier: "main", chapter: 4, location: "The Wall", note: "Feyre crosses into the faerie realm", x: 40, y: 50 },
      { id: "a3", title: "The Spring Court Manor", type: "location", tier: "main", chapter: 6, location: "Spring Court", note: "Central location — lush, enchanted, dangerous", x: 65, y: 55 },
      { id: "a4", title: "Rhysand First Appears", type: "character", tier: "main", chapter: 15, location: "Spring Court", note: "A glimpse of the Night Court's High Lord", x: 60, y: 45 },
      { id: "a5", title: "The Three Trials Begin", type: "plot", tier: "main", chapter: 28, location: "Under the Mountain", note: "Feyre faces Amarantha's challenges", x: 50, y: 15 },
      { id: "a6", title: "Amarantha's Riddle", type: "plot", tier: "main", chapter: 35, location: "Under the Mountain", note: "The final test", x: 55, y: 20 },
      { id: "a7", title: "The Wall", type: "location", tier: "main", chapter: 4, location: "The Wall", note: "The boundary between worlds", x: 38, y: 55 },
      { id: "a8", title: "Feyre paints in her room", type: "plot", tier: "minor", chapter: 7, location: "Spring Court", note: "Finding beauty in captivity", x: 62, y: 52 },
      { id: "a9", title: "Lucien shows Feyre the gardens", type: "character", tier: "minor", chapter: 8, location: "Spring Court", note: "Building an unlikely friendship", x: 68, y: 58 },
      { id: "a10", title: "Nesta refuses to eat", type: "character", tier: "minor", chapter: 2, location: "Forest of Wolves", note: "Feyre's family dynamics", x: 18, y: 48 },
    ],
    characters: [
      { id: "c1", name: "Feyre Archeron", initial: "F", role: "Protagonist", age: "19", firstAppears: 1, traits: ["Fierce", "Creative", "Resilient"], notes: "The huntress who becomes more.", photo: null },
      { id: "c2", name: "Tamlin", initial: "T", role: "Supporting", age: "500+", firstAppears: 4, traits: ["Powerful", "Possessive", "Wounded"], notes: "High Lord of the Spring Court.", photo: null },
      { id: "c3", name: "Lucien", initial: "L", role: "Supporting", age: "300+", firstAppears: 5, traits: ["Witty", "Loyal", "Conflicted"], notes: "Tamlin's emissary and friend.", photo: null },
      { id: "c4", name: "Rhysand", initial: "R", role: "Antagonist", age: "500+", firstAppears: 15, traits: ["Mysterious", "Calculating", "Hidden depths"], notes: "High Lord of the Night Court.", photo: null },
      { id: "c5", name: "Amarantha", initial: "A", role: "Antagonist", age: "Unknown", firstAppears: 28, traits: ["Cruel", "Powerful", "Obsessive"], notes: "The tyrant Under the Mountain.", photo: null },
      { id: "c6", name: "Alis", initial: "S", role: "Minor", age: "Unknown", firstAppears: 6, traits: ["Protective", "Honest", "Brave"], notes: "Feyre's servant at the Spring Court.", photo: null },
    ],
    locations: [
      { id: "l1", name: "The Mortal Lands", description: "Feyre's impoverished homeland beyond the Wall", type: "Landmark", firstAppears: 1, eventCount: 1, photo: null },
      { id: "l2", name: "The Wall", description: "Ancient barrier between mortal and faerie realms", type: "Landmark", firstAppears: 4, eventCount: 2, photo: null },
      { id: "l3", name: "The Forest of Wolves", description: "Dense woodland where Feyre hunts to survive", type: "Landmark", firstAppears: 1, eventCount: 1, photo: null },
      { id: "l4", name: "The Spring Court Manor", description: "Tamlin's enchanted estate, beautiful and perilous", type: "House", firstAppears: 6, eventCount: 2, photo: null },
      { id: "l5", name: "Under the Mountain", description: "Amarantha's dark domain beneath the earth", type: "Landmark", firstAppears: 28, eventCount: 2, photo: null },
      { id: "l6", name: "The Night Court", description: "Glimpsed realm of starlight and shadow", type: "Landmark", firstAppears: 15, eventCount: 0, photo: null },
      { id: "l7", name: "The River Road", description: "Path winding through the faerie lands", type: "Road", firstAppears: 4, eventCount: 0, photo: null },
    ],
    timeline: [
      { id: "t1", title: "Feyre Kills the Wolf", tier: "main", chapter: 1, character: "Feyre", characterInitial: "F", pinType: "plot", location: "Forest of Wolves" },
      { id: "t1b", title: "Nesta refuses to eat", tier: "minor", chapter: 2, character: "Nesta", characterInitial: "N", pinType: "character", location: "Forest of Wolves" },
      { id: "t2", title: "Taken to Prythian", tier: "main", chapter: 4, character: "Feyre", characterInitial: "F", pinType: "plot", location: "The Wall" },
      { id: "t3", title: "The Spring Court", tier: "main", chapter: 6, character: "Tamlin", characterInitial: "T", pinType: "location", location: "Spring Court" },
      { id: "t3b", title: "Feyre paints in her room", tier: "minor", chapter: 7, character: "Feyre", characterInitial: "F", pinType: "plot", location: "Spring Court" },
      { id: "t3c", title: "Lucien shows Feyre the gardens", tier: "minor", chapter: 8, character: "Lucien", characterInitial: "L", pinType: "character", location: "Spring Court" },
      { id: "t4", title: "Rhysand Appears", tier: "main", chapter: 15, character: "Rhysand", characterInitial: "R", pinType: "character", location: "Spring Court" },
      { id: "t5", title: "The Three Trials", tier: "main", chapter: 28, character: "Feyre", characterInitial: "F", pinType: "plot", location: "Under the Mountain" },
      { id: "t6", title: "Amarantha's Riddle", tier: "main", chapter: 35, character: "Feyre", characterInitial: "F", pinType: "plot", location: "Under the Mountain" },
    ],
    recentActivity: [
      "Added pin: Amarantha's Riddle — Chapter 35",
      "New location: Under the Mountain",
      "Character added: Rhysand",
      "Updated map: The Wall boundary",
    ],
  },
];
