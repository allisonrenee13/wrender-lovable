import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { islaSerranoLocations } from "@/data/isla-serrano";

interface LocationDetailDrawerProps {
  locationId: string;
  onClose: () => void;
}

const typeLabels: Record<string, string> = {
  hotel: "Hotel",
  residence: "House",
  landmark: "Landmark",
  club: "Club",
  public: "Green Space",
  infrastructure: "Access",
};

const chapterData: Record<string, string> = {
  "solano-hotel": "Ch. 2",
  "reef-cottage": "Ch. 1",
  "westwood-house": "Ch. 3",
  "harbour-club": "Ch. 4",
  "village-green": "Ch. 1",
  "beach-club": "Ch. 5",
  "cape-serrano-lighthouse": "Ch. 8",
  "the-causeway": "Ch. 1",
};

const storyEvents: Record<string, { event: string; chapter: string }[]> = {
  "solano-hotel": [
    { event: "The Welcome Party", chapter: "Ch. 2" },
    { event: "The Confrontation", chapter: "Ch. 11" },
  ],
};

const LocationDetailDrawer = ({ locationId, onClose }: LocationDetailDrawerProps) => {
  const location = islaSerranoLocations.find((l) => l.id === locationId);
  if (!location) return null;

  return (
    <div className="w-[280px] border-l border-border bg-card h-full overflow-y-auto animate-slide-in-right">
      <div className="p-4 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Input
              defaultValue={location.name}
              className="text-base font-serif font-semibold border-none p-0 h-auto focus-visible:ring-0 bg-transparent"
            />
            <Badge variant="outline" className="mt-1 text-[10px]">
              {typeLabels[location.type] || location.type}
            </Badge>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Chapter */}
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
            First appears in...
          </label>
          <select className="w-full h-8 text-xs rounded-md border border-input bg-background px-2 mt-1">
            {Array.from({ length: 15 }, (_, i) => (
              <option key={i} selected={chapterData[locationId] === `Ch. ${i + 1}`}>
                Ch. {i + 1}
              </option>
            ))}
          </select>
        </div>

        {/* Notes */}
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">Notes</label>
          <Textarea
            defaultValue={location.description}
            className="mt-1 min-h-[60px] text-xs resize-none border-border bg-background"
          />
        </div>

        {/* Mood Images */}
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Mood Images
          </label>
          <div className="grid grid-cols-2 gap-2 mt-1">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded border-2 border-dashed border-border bg-muted/30 flex items-center justify-center cursor-pointer hover:border-secondary/40 transition-colors"
              >
                <span className="text-[10px] text-muted-foreground">+</span>
              </div>
            ))}
          </div>
        </div>

        {/* Story Events */}
        <div>
          <label className="text-[10px] text-muted-foreground uppercase tracking-wider">
            Story Events Here
          </label>
          <div className="mt-1 space-y-1.5">
            {(storyEvents[locationId] || []).map((event, i) => (
              <div key={i} className="text-xs text-foreground flex items-center gap-2 p-2 rounded bg-muted/50">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary flex-shrink-0" />
                <span>{event.event}</span>
                <span className="text-muted-foreground ml-auto text-[10px]">{event.chapter}</span>
              </div>
            ))}
            {!(storyEvents[locationId]?.length) && (
              <p className="text-[10px] text-muted-foreground italic">No events linked yet</p>
            )}
          </div>
        </div>

        {/* Delete */}
        <button className="text-xs text-destructive hover:underline mt-4">
          Delete this pin
        </button>
      </div>
    </div>
  );
};

export default LocationDetailDrawer;
