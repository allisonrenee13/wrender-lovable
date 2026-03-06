import { createContext, useContext, useState, ReactNode } from "react";
import { projects, Project } from "@/data/projects";

interface ProjectContextType {
  currentProject: Project;
  setCurrentProjectId: (id: string) => void;
  allProjects: Project[];
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export function ProjectProvider({ children }: { children: ReactNode }) {
  const [projectId, setProjectId] = useState(projects[0].id);
  const currentProject = projects.find((p) => p.id === projectId) || projects[0];

  return (
    <ProjectContext.Provider value={{ currentProject, setCurrentProjectId: setProjectId, allProjects: projects }}>
      {children}
    </ProjectContext.Provider>
  );
}

export function useProject() {
  const ctx = useContext(ProjectContext);
  if (!ctx) throw new Error("useProject must be used within ProjectProvider");
  return ctx;
}
