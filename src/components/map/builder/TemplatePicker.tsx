import { useState } from "react";
import { X, Trash2, Globe, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MapTemplate, TracedPath } from "./types";
import { getTemplates, togglePublic, deleteTemplate } from "@/lib/templateLibrary";

const templates: MapTemplate[] = [
  // Row 1 — Islands and Coasts
  { id: "small-island", name: "Small Island", genre: "Fiction", category: "Islands & Coasts",
    viewBox: "0 0 200 200",
    svgPath: "M100 30 Q140 25 160 55 Q175 85 170 120 Q165 155 140 170 Q115 185 85 175 Q55 165 40 135 Q30 105 40 75 Q55 40 100 30Z" },
  { id: "archipelago", name: "Archipelago", genre: "Adventure", category: "Islands & Coasts",
    viewBox: "0 0 200 200",
    svgPath: "M50 60 Q65 45 80 55 Q90 65 75 80 Q60 85 50 60Z M120 40 Q140 30 155 50 Q160 70 145 80 Q125 75 120 40Z M90 110 Q110 100 125 115 Q130 135 115 145 Q95 140 90 110Z M155 110 Q170 105 175 120 Q172 135 160 135 Q150 125 155 110Z" },
  { id: "peninsula", name: "Coastal Peninsula", genre: "Literary", category: "Islands & Coasts",
    viewBox: "0 0 200 200",
    svgPath: "M0 180 L50 175 Q80 170 100 140 Q120 110 115 80 Q110 50 95 35 Q80 25 70 40 Q60 60 65 90 Q70 120 55 145 Q40 165 0 180Z" },
  { id: "harbour-island", name: "Island with Harbour", genre: "Romance", category: "Islands & Coasts",
    viewBox: "0 0 200 200",
    svgPath: "M100 25 Q150 20 170 60 Q185 100 170 130 Q155 150 130 155 Q110 145 100 155 Q90 145 70 155 Q45 150 30 130 Q15 100 30 60 Q50 20 100 25Z" },
  // Row 2 — Inland
  { id: "river-town", name: "River Town", genre: "Historical", category: "Inland",
    viewBox: "0 0 200 200",
    svgPath: "M0 90 Q50 80 80 100 Q100 115 120 100 Q150 80 200 90 M60 60 Q90 50 110 65 Q125 80 100 90 Q75 95 60 80Z M130 55 Q155 45 170 60 Q175 80 155 90 Q135 85 130 55Z" },
  { id: "valley", name: "Landlocked Valley", genre: "Fantasy", category: "Inland",
    viewBox: "0 0 200 200",
    svgPath: "M30 40 Q60 20 100 15 Q140 20 170 40 Q190 70 185 110 Q175 150 150 170 Q120 185 80 170 Q50 150 25 110 Q15 70 30 40Z M60 60 Q80 50 100 55 Q120 50 140 60 Q155 80 150 110 Q140 130 120 140 Q100 145 80 140 Q60 130 50 110 Q45 80 60 60Z" },
  { id: "mountain-pass", name: "Mountain Pass", genre: "Epic", category: "Inland",
    viewBox: "0 0 200 200",
    svgPath: "M20 160 L60 50 L80 90 L100 30 L120 90 L140 50 L180 160Z M85 130 Q100 120 115 130" },
  { id: "lake-district", name: "Lake District", genre: "Mystery", category: "Inland",
    viewBox: "0 0 200 200",
    svgPath: "M60 50 Q90 30 130 45 Q160 60 155 100 Q150 140 120 155 Q85 165 55 140 Q35 115 40 80 Q45 60 60 50Z" },
  // Row 3 — Large Scale
  { id: "kingdom", name: "Fantasy Kingdom", genre: "Fantasy", category: "Large Scale",
    viewBox: "0 0 200 200",
    svgPath: "M30 60 Q50 20 100 15 Q160 10 180 50 Q195 90 185 130 Q170 165 130 180 Q90 190 50 170 Q20 150 15 110 Q10 80 30 60Z M80 70 L100 50 L120 70 M60 120 Q80 110 100 120 Q120 110 140 120" },
  { id: "continent", name: "Continent Fragment", genre: "Sci-Fi", category: "Large Scale",
    viewBox: "0 0 200 200",
    svgPath: "M20 80 Q40 30 90 20 Q130 15 160 40 Q185 65 190 110 Q188 145 160 165 Q130 180 100 185 Q60 182 35 160 Q15 135 20 80Z" },
  { id: "city-grid", name: "Urban City Grid", genre: "Thriller", category: "Large Scale",
    viewBox: "0 0 200 200",
    svgPath: "M30 30 L170 30 L170 170 L30 170Z M30 70 L170 70 M30 110 L170 110 M30 150 L170 150 M70 30 L70 170 M110 30 L110 170 M150 30 L150 170" },
  { id: "estate", name: "Estate / Property", genre: "Gothic", category: "Large Scale",
    viewBox: "0 0 200 200",
    svgPath: "M40 40 Q50 35 160 35 Q170 40 170 160 Q165 170 40 170 Q35 165 40 40Z M80 70 L120 70 L120 110 L80 110Z M90 110 L90 130 L110 130 L110 110" },
];

interface TemplatePickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (template: MapTemplate) => void;
}

const TemplatePicker = ({ open, onClose, onSelect }: TemplatePickerProps) => {
  const [tab, setTab] = useState<string>("library");
  const [myTemplates, setMyTemplates] = useState(() => getTemplates());

  if (!open) return null;

  const categories = ["Islands & Coasts", "Inland", "Large Scale"];

  const refreshMyTemplates = () => setMyTemplates(getTemplates());

  const handleMyTemplateSelect = (tpl: { svgPaths: TracedPath[]; name: string }) => {
    // Build a synthetic MapTemplate from saved paths
    const combined = tpl.svgPaths.map((p) => p.d).join(" ");
    onSelect({
      id: `custom-${Date.now()}`,
      name: tpl.name,
      genre: "Custom",
      category: "My Templates",
      svgPath: combined,
      viewBox: "0 0 600 600",
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-8 py-5 border-b border-border">
        <div>
          <h2 className="text-xl font-serif font-semibold text-foreground">Choose a Template</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Pick a geography type or load one of your saved templates.
          </p>
        </div>
        <button onClick={onClose} className="p-2 hover:bg-muted rounded-lg transition-colors">
          <X className="h-5 w-5 text-muted-foreground" />
        </button>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col overflow-hidden">
        <div className="px-8 pt-4">
          <TabsList className="bg-muted/50">
            <TabsTrigger value="library">Library</TabsTrigger>
            <TabsTrigger value="my-templates" onClick={refreshMyTemplates}>My Templates</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="library" className="flex-1 overflow-y-auto px-8 py-6 space-y-8 mt-0">
          {categories.map((cat) => (
            <div key={cat}>
              <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-4">{cat}</h3>
              <div className="grid grid-cols-4 gap-4">
                {templates.filter((t) => t.category === cat).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => onSelect(t)}
                    className="border border-border rounded-lg p-4 bg-card hover:border-secondary/50 hover:shadow-sm transition-all group flex flex-col items-center gap-3"
                  >
                    <div className="w-full aspect-square bg-white rounded flex items-center justify-center p-3">
                      <svg viewBox={t.viewBox} className="w-full h-full">
                        <path
                          d={t.svgPath}
                          fill="none"
                          stroke="hsl(var(--primary))"
                          strokeWidth="2"
                          strokeLinejoin="round"
                          strokeLinecap="round"
                        />
                      </svg>
                    </div>
                    <span className="text-sm font-medium text-foreground">{t.name}</span>
                    <span className="text-[10px] text-secondary font-medium uppercase tracking-wider">{t.genre}</span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </TabsContent>

        <TabsContent value="my-templates" className="flex-1 overflow-y-auto px-8 py-6 mt-0">
          {myTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center gap-3">
              <p className="text-muted-foreground text-sm">No saved templates yet.</p>
              <p className="text-muted-foreground text-xs">
                Upload and trace an image, then click "Save as Template" to add one here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-4">
              {myTemplates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="border border-border rounded-lg p-4 bg-card hover:border-secondary/50 hover:shadow-sm transition-all flex flex-col items-center gap-3 relative group"
                >
                  <button
                    className="w-full flex flex-col items-center gap-3"
                    onClick={() => handleMyTemplateSelect(tpl)}
                  >
                    <div className="w-full aspect-[4/3] bg-white rounded flex items-center justify-center overflow-hidden">
                      <img
                        src={tpl.thumbnailDataUrl}
                        alt={tpl.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <span className="text-sm font-medium text-foreground">{tpl.name}</span>
                  </button>

                  {/* Badge + actions */}
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      tpl.isPublic
                        ? "bg-green-500/15 text-green-700"
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {tpl.isPublic ? "Public" : "Internal"}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        togglePublic(tpl.id);
                        refreshMyTemplates();
                      }}
                      className="p-1 rounded hover:bg-muted transition-colors text-muted-foreground"
                      title={tpl.isPublic ? "Make internal" : "Make public"}
                    >
                      {tpl.isPublic ? <Lock className="h-3 w-3" /> : <Globe className="h-3 w-3" />}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteTemplate(tpl.id);
                        refreshMyTemplates();
                      }}
                      className="p-1 rounded hover:bg-destructive/10 transition-colors text-muted-foreground hover:text-destructive"
                      title="Delete template"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TemplatePicker;
