import { useAppStore } from "../store";
import { cn } from "../lib/utils";
import { Display2Icon, TVIcon, CodeIcon, SunIcon, MoonIcon } from "./Icons";

interface SidebarProps {
  currentView: "youtube" | "html-adder";
  setCurrentView: (view: "youtube" | "html-adder") => void;
}

export function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  const { theme, toggleTheme } = useAppStore();

  return (
    <aside className="w-64 h-screen max-h-screen bg-card text-card-foreground border-r border-border flex flex-col p-4 shrink-0 shadow-lg z-10 transition-colors duration-300">
      <div className="flex items-center gap-3 px-2 mb-8 mt-2">
        <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-md">
          <Display2Icon className="w-6 h-6" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight">Vault</h1>
          <p className="text-xs text-foreground/60 leading-none">Media & HTML</p>
        </div>
      </div>

      <nav className="flex flex-col gap-2 flex-grow">
        <button
          onClick={() => setCurrentView("youtube")}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
            currentView === "youtube"
              ? "bg-primary text-primary-foreground shadow-sm scale-100"
              : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground scale-95 hover:scale-100"
          )}
        >
          <TVIcon className="w-5 h-5" />
          YouTube Viewer
        </button>

        <button
          onClick={() => setCurrentView("html-adder")}
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-sm font-medium",
            currentView === "html-adder"
              ? "bg-primary text-primary-foreground shadow-sm scale-100"
              : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground scale-95 hover:scale-100"
          )}
        >
          <CodeIcon className="w-5 h-5" />
          HTML Adder
        </button>
      </nav>

      <div className="mt-auto border-t border-border pt-4">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg hover:bg-foreground/5 transition-all text-sm font-medium text-foreground/70 hover:text-foreground group"
        >
          <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
            <SunIcon className={cn("absolute w-5 h-5 transition-all duration-500", theme === "dark" ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100 text-amber-500 group-hover:rotate-45")} />
            <MoonIcon className={cn("absolute w-5 h-5 transition-all duration-500", theme === "light" ? "opacity-0 -rotate-90 scale-50" : "opacity-100 rotate-0 scale-100 text-blue-400 group-hover:-rotate-12")} />
          </div>
          {theme === "dark" ? "Light Mode" : "Dark Mode"}
        </button>
      </div>
    </aside>
  );
}
