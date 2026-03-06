import { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { projects as initialProjects, Project, Pin, Character, Location, TimelineEvent, PinType, EventTier } from "@/data/projects";
import { toast } from "@/hooks/use-toast";

interface ProjectContextType {
  currentProject: Project;
  setCurrentProjectId: (id: string) => void;
  allProjects: Project[];
  createProject: (data: { title: string; genre: string; setting: string; wordCount: string }) => string;
  updateProjectTitle: (title: string) => void;
  confirmMap: () => void;
  addPin: (pin: Omit<Pin, "id">) => void;
  removePin: (id: string) => void;
  updatePin: (id: string, updates: Partial<Pin>) => void;
  addCharacter: (char: Omit<Character, "id">) => void;
  removeCharacter: (id: string) => void;
  updateCharacter: (id: string, updates: Partial<Character>) => void;
  addLocation: (loc: Omit<Location, "id">) => void;
  removeLocation: (id: string) => void;
  updateLocation: (id: string, updates: Partial<Location>) => void;
  addTimelineEvent: (event: Omit<TimelineEvent, "id">) => void;
  removeTimelineEvent: (id: string) => void;
  logActivity: (message: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

function genId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [allProjects, setAllProjects] = useState<Project[]>(() => JSON.parse(JSON.stringify(initialProjects)));
  const [projectId, setProjectId] = useState(allProjects[0].id);
  const currentProject = allProjects.find((p) => p.id === projectId) || allProjects[0];

  const updateCurrentProject = useCallback((updater: (p: Project) => Project) => {
    setAllProjects((prev) => prev.map((p) => (p.id === projectId ? updater(p) : p)));
  }, [projectId]);

  const logActivity = useCallback((message: string) => {
    updateCurrentProject((p) => ({
      ...p,
      recentActivity: [message, ...p.recentActivity].slice(0, 20),
      lastEdited: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
    }));
  }, [updateCurrentProject]);

  const createProject = useCallback((data: { title: string; genre: string; setting: string; wordCount: string }) => {
    const id = genId();
    const newProject: Project = {
      id,
      title: data.title,
      genre: data.genre,
      setting: data.setting,
      wordCount: data.wordCount || "0",
      lastEdited: new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }),
      mapImage: "",
      mapConfirmed: false,
      pins: [],
      characters: [],
      locations: [],
      timeline: [],
      recentActivity: ["Project created"],
    };
    setAllProjects((prev) => [...prev, newProject]);
    setProjectId(id);
    toast({ title: "Project created", description: data.title });
    return id;
  }, []);

  const updateProjectTitle = useCallback((title: string) => {
    updateCurrentProject((p) => ({ ...p, title }));
  }, [updateCurrentProject]);

  const confirmMap = useCallback(() => {
    updateCurrentProject((p) => ({ ...p, mapConfirmed: true }));
    logActivity("Map confirmed");
    toast({ title: "Map confirmed", description: "Your map is now in View Mode" });
  }, [updateCurrentProject, logActivity]);

  const addPin = useCallback((pin: Omit<Pin, "id">) => {
    const id = genId();
    updateCurrentProject((p) => ({ ...p, pins: [...p.pins, { ...pin, id }] }));
    const tierLabel = pin.tier === "minor" ? " (minor)" : "";
    logActivity(`Added pin: ${pin.title}${tierLabel} — Ch. ${pin.chapter}`);
    toast({ title: "Pin added", description: pin.title });
  }, [updateCurrentProject, logActivity]);

  const removePin = useCallback((id: string) => {
    updateCurrentProject((p) => {
      const pin = p.pins.find((x) => x.id === id);
      if (pin) logActivity(`Removed pin: ${pin.title}`);
      return { ...p, pins: p.pins.filter((x) => x.id !== id) };
    });
    toast({ title: "Pin removed" });
  }, [updateCurrentProject, logActivity]);

  const updatePin = useCallback((id: string, updates: Partial<Pin>) => {
    updateCurrentProject((p) => ({
      ...p,
      pins: p.pins.map((x) => (x.id === id ? { ...x, ...updates } : x)),
    }));
  }, [updateCurrentProject]);

  const addCharacter = useCallback((char: Omit<Character, "id">) => {
    const id = genId();
    updateCurrentProject((p) => ({ ...p, characters: [...p.characters, { ...char, id }] }));
    logActivity(`Character added: ${char.name}`);
    toast({ title: "Character saved", description: char.name });
  }, [updateCurrentProject, logActivity]);

  const removeCharacter = useCallback((id: string) => {
    updateCurrentProject((p) => {
      const char = p.characters.find((x) => x.id === id);
      if (char) logActivity(`Character removed: ${char.name}`);
      return { ...p, characters: p.characters.filter((x) => x.id !== id) };
    });
    toast({ title: "Character removed" });
  }, [updateCurrentProject, logActivity]);

  const updateCharacter = useCallback((id: string, updates: Partial<Character>) => {
    updateCurrentProject((p) => ({
      ...p,
      characters: p.characters.map((x) => (x.id === id ? { ...x, ...updates } : x)),
    }));
  }, [updateCurrentProject]);

  const addLocation = useCallback((loc: Omit<Location, "id">) => {
    const id = genId();
    updateCurrentProject((p) => ({ ...p, locations: [...p.locations, { ...loc, id }] }));
    logActivity(`Location created: ${loc.name}`);
    toast({ title: "Location created", description: loc.name });
  }, [updateCurrentProject, logActivity]);

  const removeLocation = useCallback((id: string) => {
    updateCurrentProject((p) => {
      const loc = p.locations.find((x) => x.id === id);
      if (loc) logActivity(`Location removed: ${loc.name}`);
      return { ...p, locations: p.locations.filter((x) => x.id !== id) };
    });
    toast({ title: "Location removed" });
  }, [updateCurrentProject, logActivity]);

  const updateLocation = useCallback((id: string, updates: Partial<Location>) => {
    updateCurrentProject((p) => ({
      ...p,
      locations: p.locations.map((x) => (x.id === id ? { ...x, ...updates } : x)),
    }));
  }, [updateCurrentProject]);

  const addTimelineEvent = useCallback((event: Omit<TimelineEvent, "id">) => {
    const id = genId();
    updateCurrentProject((p) => ({ ...p, timeline: [...p.timeline, { ...event, id }] }));
    const tierLabel = event.tier === "minor" ? " (minor)" : "";
    logActivity(`Event added: ${event.title}${tierLabel} — Ch. ${event.chapter}`);
    toast({ title: "Event added to timeline", description: event.title });
  }, [updateCurrentProject, logActivity]);

  const removeTimelineEvent = useCallback((id: string) => {
    updateCurrentProject((p) => ({ ...p, timeline: p.timeline.filter((x) => x.id !== id) }));
  }, [updateCurrentProject]);

  return (
    <ProjectContext.Provider
      value={{
        currentProject,
        setCurrentProjectId: setProjectId,
        allProjects,
        createProject,
        confirmMap,
        updateProjectTitle,
        addPin,
        removePin,
        updatePin,
        addCharacter,
        removeCharacter,
        updateCharacter,
        addLocation,
        removeLocation,
        updateLocation,
        addTimelineEvent,
        removeTimelineEvent,
        logActivity,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within ProjectProvider");
  return ctx;
}
