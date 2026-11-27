import React, { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "@/components/theme-provider";
import { BackgroundProvider, useRegionalBackground } from "@/components/theme/background-context";
import { ChatEmojiProvider } from "@/components/theme/chat-emoji-context";

// Configure TanStack Query client with aggressive caching for game data
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 30, // 30 minutes stale time (game data is static)
      gcTime: 1000 * 60 * 60 * 24, // 24 hours garbage collection
      refetchOnWindowFocus: false, // Don't refetch static game data on tab switch
      retry: 2,
    },
  },
});

// Lazy-load all pages for code-splitting
const DashboardPage = lazy(() => import("@/app/dashboard/page"));
const CharactersPage = lazy(() => import("@/app/characters/page"));
const PullPlannerPage = lazy(() => import("@/app/pull-planner/page"));
const BannerRadarPage = lazy(() => import("@/app/banner-radar/page"));
const ResourcesPage = lazy(() => import("@/app/resources/page"));
const ProgressionPage = lazy(() => import("@/app/progression/page"));
const WeaponsPage = lazy(() => import("@/app/weapons/page"));
const TeamsPage = lazy(() => import("@/app/teams/page"));
const SettingsPage = lazy(() => import("@/app/settings/page"));
const NotFoundPage = lazy(() => import("@/app/not-found"));

// Preload secondary routes on idle or sidebar hover
export const preloadRoute = (route: string) => {
  switch (route) {
    case "/dashboard":
      import("@/app/dashboard/page");
      break;
    case "/characters":
      import("@/app/characters/page");
      break;
    case "/pull-planner":
      import("@/app/pull-planner/page");
      break;
    case "/banner-radar":
      import("@/app/banner-radar/page");
      break;
    case "/resources":
      import("@/app/resources/page");
      break;
    case "/progression":
      import("@/app/progression/page");
      break;
    case "/weapons":
      import("@/app/weapons/page");
      break;
    case "/teams":
      import("@/app/teams/page");
      break;
    case "/settings":
      import("@/app/settings/page");
      break;
    default:
      break;
  }
};

function PageSkeletonLoader() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/30 flex items-center justify-center animate-pulse">
        <div className="w-6 h-6 rounded-md bg-gold-500/40" />
      </div>
      <p className="text-xs font-serif italic text-gold-400 animate-pulse">
        Travelling into the world of teyvat…
      </p>
    </div>
  );
}

// Background Preloader component to link rel="preload" the active regional background
function BackgroundPreloader() {
  const { backgroundData } = useRegionalBackground();

  React.useEffect(() => {
    if (!backgroundData?.image) return;
    const existing = document.querySelector(`link[rel="preload"][href="${backgroundData.image}"]`);
    if (!existing) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = backgroundData.image;
      document.head.appendChild(link);
    }
  }, [backgroundData?.image]);

  return null;
}

export default function App() {
  React.useEffect(() => {
    // Idle preloading of most popular secondary destinations
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => {
        preloadRoute("/characters");
        preloadRoute("/pull-planner");
      });
    } else {
      setTimeout(() => {
        preloadRoute("/characters");
        preloadRoute("/pull-planner");
      }, 1500);
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="cg-theme">
        <BackgroundProvider>
          <BackgroundPreloader />
          <ChatEmojiProvider>
            <BrowserRouter>
              <Suspense fallback={<PageSkeletonLoader />}>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/characters" element={<CharactersPage />} />
                  <Route path="/pull-planner" element={<PullPlannerPage />} />
                  <Route path="/banner-radar" element={<BannerRadarPage />} />
                  <Route path="/resources" element={<ResourcesPage />} />
                  <Route path="/progression" element={<ProgressionPage />} />
                  <Route path="/weapons" element={<WeaponsPage />} />
                  <Route path="/teams" element={<TeamsPage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<NotFoundPage />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ChatEmojiProvider>
        </BackgroundProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
