import { useProject } from "@/context/ProjectContext";
import { PinType } from "@/data/projects";

const pinDotColors: Record<PinType, string> = {
  plot: "bg-pin-plot",
  character: "bg-pin-character",
  location: "bg-pin-location",
};

const TimelinePage = () => {
  const { currentProject } = useProject();
  const timeline = currentProject.timeline;
  const maxChapter = Math.max(...timeline.map((e) => e.chapter));

  // Group by chapter
  const chapters = new Map<number, typeof timeline>();
  timeline.forEach((e) => {
    const arr = chapters.get(e.chapter) || [];
    arr.push(e);
    chapters.set(e.chapter, arr);
  });

  const sortedChapters = Array.from(chapters.entries()).sort(([a], [b]) => a - b);
  const currentChapter = sortedChapters[sortedChapters.length - 1]?.[0] || 1;

  return (
    <div className="p-6 md:p-10">
      <h1 className="text-xl font-serif font-semibold mb-2">{currentProject.title} — Timeline</h1>

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
          <span>Chapter 1</span>
          <span>Chapter {currentChapter} of {maxChapter}</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full transition-all"
            style={{ width: `${(currentChapter / maxChapter) * 100}%` }}
          />
        </div>
      </div>

      {/* Horizontal scrollable timeline */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-6 min-w-max">
          {sortedChapters.map(([chapter, events]) => (
            <div key={chapter} className="flex flex-col items-start">
              <span className="text-xs font-medium text-muted-foreground mb-3 px-1">
                Ch. {chapter}
              </span>
              <div className="flex gap-3">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="w-56 border border-border rounded-lg p-4 bg-card hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`w-2 h-2 rounded-full ${pinDotColors[event.pinType]}`} />
                      <span className="text-xs text-muted-foreground">{event.location}</span>
                    </div>
                    <h3 className="text-sm font-semibold font-serif mb-2">{event.title}</h3>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
                        {event.characterInitial}
                      </div>
                      <span className="text-xs text-muted-foreground">{event.character}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Connecting line */}
      <div className="mt-2 border-t border-dashed border-border" />
    </div>
  );
};

export default TimelinePage;
