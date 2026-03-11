import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProjectProvider } from "@/context/ProjectContext";
import { Layout } from "@/components/Layout";
import Index from "./pages/Index";
import MapPage from "./pages/MapPage";
import TimelinePage from "./pages/TimelinePage";
import LocationsPage from "./pages/LocationsPage";
import CharactersPage from "./pages/CharactersPage";
import LandingPage from "./pages/LandingPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ProjectProvider>
        <BrowserRouter>
          <Routes>
            {/* Pre-login landing */}
            <Route path="/welcome" element={<LandingPage />} />

            {/* App shell */}
            <Route
              path="*"
              element={
                <Layout>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/map" element={<MapPage />} />
                    <Route path="/timeline" element={<TimelinePage />} />
                    <Route path="/locations" element={<LocationsPage />} />
                    <Route path="/characters" element={<CharactersPage />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              }
            />
          </Routes>
        </BrowserRouter>
      </ProjectProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
