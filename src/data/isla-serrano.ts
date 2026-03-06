export interface IslaSerranoLocation {
  id: string;
  name: string;
  type: "hotel" | "residence" | "landmark" | "club" | "public" | "infrastructure";
  description: string;
  /** SVG coordinates for marker placement */
  x: number;
  y: number;
  /** Label offset from marker */
  labelAnchor: "left" | "right";
}

export const islaSerranoLocations: IslaSerranoLocation[] = [
  {
    id: "solano-hotel",
    name: "The Solano Hotel",
    type: "hotel",
    description: "Grand old beach hotel, 90s glamour. North end, beachside.",
    x: 330,
    y: 145,
    labelAnchor: "right",
  },
  {
    id: "reef-cottage",
    name: "The Reef Cottage",
    type: "residence",
    description: "The island house at the heart of the story. Mid-island, ocean side.",
    x: 340,
    y: 340,
    labelAnchor: "right",
  },
  {
    id: "westwood-house",
    name: "The Westwood House",
    type: "residence",
    description: "A character's private home. Mid-island, quieter street.",
    x: 260,
    y: 390,
    labelAnchor: "left",
  },
  {
    id: "harbour-club",
    name: "The Harbour Club",
    type: "club",
    description: "Yacht club. Old money. Cocktail secrets. Bay side, mid-island.",
    x: 245,
    y: 310,
    labelAnchor: "left",
  },
  {
    id: "village-green",
    name: "The Village Green",
    type: "public",
    description: "Public square, community hub. Centre of the island village.",
    x: 300,
    y: 350,
    labelAnchor: "right",
  },
  {
    id: "beach-club",
    name: "The Beach Club",
    type: "club",
    description: "Exclusive, sun-drenched. Ocean side, mid-island.",
    x: 355,
    y: 380,
    labelAnchor: "right",
  },
  {
    id: "cape-serrano-lighthouse",
    name: "Cape Serrano Lighthouse",
    type: "landmark",
    description: "Remote south end. Isolated, dramatic.",
    x: 300,
    y: 580,
    labelAnchor: "right",
  },
  {
    id: "the-causeway",
    name: "The Causeway",
    type: "infrastructure",
    description: "North entry point. Only way on or off the island.",
    x: 300,
    y: 55,
    labelAnchor: "right",
  },
];
