import { useAppStore } from "../store";
import { cn } from "../lib/utils";
import { Display2Icon, SunIcon, MoonIcon } from "./Icons";
import { Tv, Radio, DownloadCloud, Heart, Download, Code } from "lucide-react";

interface SidebarProps {
  currentView: "browse" | "channels" | "downloader" | "playlists" | "offline" | "html-adder";
  setCurrentView: (view: "browse" | "channels" | "downloader" | "playlists" | "offline" | "html-adder") => void;
}

export function Sidebar({ currentView, setCurrentView }: SidebarProps) {
  const { theme, toggleTheme, playlists, offlineVideos } = useAppStore();

  const totalPlaylistVideos = playlists.reduce((acc, p) => acc + p.videos.length, 0);
  const totalOfflineVideos = offlineVideos.length;

  return (
    <aside className="w-64 h-screen max-h-screen bg-card text-card-foreground border-r border-border flex flex-col p-4 shrink-0 shadow-lg z-10 transition-colors duration-300">
      <div className="flex items-center gap-3 px-2 mb-8 mt-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-md">
          <Display2Icon className="w-5 h-5" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight">Media Vault</h1>
          <p className="text-xs text-foreground/60 leading-none">Offline Study & HTML</p>
        </div>
      </div>

      <nav className="flex flex-col gap-1 flex-grow overflow-y-auto pr-1">
        <span className="text-[10px] font-extrabold text-foreground/40 uppercase tracking-widest px-3 mb-1">Live YouTube Stream</span>
        
        <button
          onClick={() => setCurrentView("browse")}
          className={cn(
            "flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-xs font-bold leading-none cursor-pointer",
            currentView === "browse"
              ? "bg-red-600 text-white shadow-md scale-100 font-extrabold"
              : "text-foreground/75 hover:bg-foreground/5 hover:text-foreground scale-95 hover:scale-100"
          )}
        >
          <div className="flex items-center gap-3">
            <Tv className="w-4 h-4 shrink-0" />
            <span>Browse Streams</span>
          </div>
        </button>

        <button
          onClick={() => setCurrentView("channels")}
          className={cn(
            "flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-xs font-bold leading-none cursor-pointer",
            currentView === "channels"
              ? "bg-red-600 text-white shadow-md scale-100 font-extrabold"
              : "text-foreground/75 hover:bg-foreground/5 hover:text-foreground scale-95 hover:scale-100"
          )}
        >
          <div className="flex items-center gap-3">
            <Radio className="w-4 h-4 shrink-0" />
            <span>Combat Channels</span>
          </div>
        </button>

        <button
          onClick={() => setCurrentView("downloader")}
          className={cn(
            "flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-xs font-bold leading-none cursor-pointer",
            currentView === "downloader"
              ? "bg-red-600 text-white shadow-md scale-100 font-extrabold"
              : "text-foreground/75 hover:bg-foreground/5 hover:text-foreground scale-95 hover:scale-100"
          )}
        >
          <div className="flex items-center gap-3">
            <DownloadCloud className="w-4 h-4 shrink-0" />
            <span>YouTube Downloader</span>
          </div>
        </button>

        <span className="text-[10px] font-extrabold text-foreground/40 uppercase tracking-widest px-3 mt-6 mb-1">Personal Library</span>

        <button
          onClick={() => setCurrentView("playlists")}
          className={cn(
            "flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-xs font-bold leading-none cursor-pointer",
            currentView === "playlists"
              ? "bg-red-600 text-white shadow-md scale-100 font-extrabold"
              : "text-foreground/75 hover:bg-foreground/5 hover:text-foreground scale-95 hover:scale-100"
          )}
        >
          <div className="flex items-center gap-3">
            <Heart className="w-4 h-4 shrink-0 text-rose-500 fill-current" />
            <span>My Playlists</span>
          </div>
          {totalPlaylistVideos > 0 && (
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full",
              currentView === "playlists" ? "bg-white/20 text-white" : "bg-muted text-foreground/70"
            )}>
              {totalPlaylistVideos}
            </span>
          )}
        </button>

        <button
          onClick={() => setCurrentView("offline")}
          className={cn(
            "flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-xs font-bold leading-none cursor-pointer",
            currentView === "offline"
              ? "bg-red-600 text-white shadow-md scale-100 font-extrabold"
              : "text-foreground/75 hover:bg-foreground/5 hover:text-foreground scale-95 hover:scale-100"
          )}
        >
          <div className="flex items-center gap-3">
            <Download className="w-4 h-4 shrink-0 text-emerald-500" />
            <span>Offline Vault</span>
          </div>
          {totalOfflineVideos > 0 && (
            <span className={cn(
              "text-[10px] font-bold px-2 py-0.5 rounded-full",
              currentView === "offline" ? "bg-white/20 text-white" : "bg-muted text-foreground/70"
            )}>
              {totalOfflineVideos}
            </span>
          )}
        </button>

        <span className="text-[10px] font-extrabold text-foreground/40 uppercase tracking-widest px-3 mt-6 mb-1">Developer Sandbox</span>

        <button
          onClick={() => setCurrentView("html-adder")}
          className={cn(
            "flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-xs font-bold leading-none cursor-pointer",
            currentView === "html-adder"
              ? "bg-red-600 text-white shadow-md scale-100 font-extrabold"
              : "text-foreground/75 hover:bg-foreground/5 hover:text-foreground scale-95 hover:scale-100"
          )}
        >
          <div className="flex items-center gap-3">
            <Code className="w-4 h-4 shrink-0" />
            <span>HTML Adder</span>
          </div>
        </button>
      </nav>

      <div className="mt-auto border-t border-border pt-4">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg hover:bg-foreground/5 transition-all text-xs font-bold text-foreground/70 hover:text-foreground group cursor-pointer"
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
