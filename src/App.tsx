import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { HomePage } from "./components/HomePage";
import { MovieDetail } from "./components/MovieDetail";
import { AdminPanel } from "./components/AdminPanel";
import { useState } from "react";

export default function App() {
  const [currentView, setCurrentView] = useState<"home" | "admin" | "movie">("home");
  const [selectedMovieId, setSelectedMovieId] = useState<string | null>(null);

  const handleViewChange = (view: string, movieId?: string) => {
    if (view === "movie" && movieId) {
      setSelectedMovieId(movieId);
      setCurrentView("movie");
    } else if (view === "admin") {
      setCurrentView("admin");
    } else {
      setCurrentView("home");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-8">
            <button 
              onClick={() => handleViewChange("home")}
              className="text-2xl font-bold text-purple-600 hover:text-purple-700 transition-colors"
            >
              CineClub Ahmedabad
            </button>
            <nav className="hidden md:flex gap-6">
              <button 
                onClick={() => handleViewChange("home")}
                className="text-gray-600 hover:text-purple-600 transition-colors"
              >
                Home
              </button>
              <Authenticated>
                <button 
                  onClick={() => handleViewChange("admin")}
                  className="text-gray-600 hover:text-purple-600 transition-colors"
                >
                  Admin
                </button>
              </Authenticated>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Authenticated>
              <SignOutButton />
            </Authenticated>
            <Unauthenticated>
              <button className="text-purple-600 hover:text-purple-700 transition-colors">
                Sign In
              </button>
            </Unauthenticated>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Content 
          currentView={currentView} 
          selectedMovieId={selectedMovieId}
          onViewChange={handleViewChange}
        />
      </main>
      
      <Toaster />
    </div>
  );
}

function Content({ currentView, selectedMovieId, onViewChange }: {
  currentView: string;
  selectedMovieId: string | null;
  onViewChange: (view: string, movieId?: string) => void;
}) {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <>
      <Unauthenticated>
        <div className="max-w-md mx-auto mt-20 p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to CineClub</h1>
            <p className="text-gray-600">Sign in to access admin features</p>
          </div>
          <SignInForm />
        </div>
      </Unauthenticated>

      <Authenticated>
        {currentView === "home" && (
          <HomePage onMovieClick={(movieId) => onViewChange("movie", movieId)} />
        )}
        {currentView === "movie" && selectedMovieId && (
          <MovieDetail 
            movieId={selectedMovieId} 
            onBack={() => onViewChange("home")} 
          />
        )}
        {currentView === "admin" && (
          <AdminPanel onBack={() => onViewChange("home")} />
        )}
      </Authenticated>
    </>
  );
}
