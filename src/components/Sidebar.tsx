import { useAppStore } from "../store";
import { cn } from "../lib/utils";
import { Display2Icon, SunIcon, MoonIcon } from "./Icons";
import { Tv, Radio, DownloadCloud, Heart, Download, Code, Menu } from "lucide-react";

interface SidebarProps {
  currentView: "browse" | "channels" | "downloader" | "playlists" | "offline" | "html-adder";
  setCurrentView: (view: "browse" | "channels" | "downloader" | "playlists" | "offline" | "html-adder") => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ currentView, setCurrentView, isCollapsed, setIsCollapsed }: SidebarProps) {
  const { theme, toggleTheme, playlists, offlineVideos } = useAppStore();

  const totalPlaylistVideos = playlists.reduce((acc, p) => acc + p.videos.length, 0);
  const totalOfflineVideos = offlineVideos.length;

  return (
    <aside className={cn(
      "h-screen max-h-screen bg-card text-card-foreground border-r border-border flex flex-col p-3 shrink-0 z-10 transition-all duration-300 ease-in-out shadow-lg",
      isCollapsed ? "w-20" : "w-64"
    )}>
      {/* Top Header Row with Logo & Burger Toggle */}
      <div className={cn(
        "flex items-center mb-6 mt-2 shrink-0 justify-between",
        isCollapsed ? "flex-col gap-4 px-0" : "px-2"
      )}>
        {!isCollapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-md">
              <Display2Icon className="w-4.5 h-4.5" />
            </div>
            <div>
              <h1 className="font-black text-sm tracking-tight text-red-600 dark:text-red-500 leading-none">Media Vault</h1>
              <span className="text-[10px] text-foreground/45 font-mono">Workspace v2</span>
            </div>
          </div>
        ) : (
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-sm">
            <Display2Icon className="w-4.5 h-4.5" />
          </div>
        )}

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)} 
          className="p-1.5 rounded-lg hover:bg-foreground/10 text-foreground/70 hover:text-foreground cursor-pointer transition-colors"
          title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Main Navigation Items */}
      <nav className="flex flex-col gap-1.5 flex-grow overflow-y-auto pr-0.5 scrollbar-none">
        
        {/* Render fully expanded Sidebar */}
        {!isCollapsed ? (
          <>
            <span className="text-[10px] font-extrabold text-foreground/40 uppercase tracking-widest px-3 mb-1">Live streaming content</span>
            
            <button
              onClick={() => setCurrentView("browse")}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-xs font-bold leading-none cursor-pointer",
                currentView === "browse"
                  ? "bg-red-600 text-white shadow-md font-extrabold"
                  : "text-foreground/75 hover:bg-foreground/5"
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
                "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-xs font-bold leading-none cursor-pointer",
                currentView === "channels"
                  ? "bg-red-600 text-white shadow-md font-extrabold"
                  : "text-foreground/75 hover:bg-foreground/5"
              )}
            >
              <div className="flex items-center gap-3">
                <Radio className="w-4 h-4 shrink-0" />
                <span>Creators Hub</span>
              </div>
            </button>

            <button
              onClick={() => setCurrentView("downloader")}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-xs font-bold leading-none cursor-pointer",
                currentView === "downloader"
                  ? "bg-red-600 text-white shadow-md font-extrabold"
                  : "text-foreground/75 hover:bg-foreground/5"
              )}
            >
              <div className="flex items-center gap-3">
                <DownloadCloud className="w-4 h-4 shrink-0" />
                <span>YouTube Downloader</span>
              </div>
            </button>

            <span className="text-[10px] font-extrabold text-foreground/40 uppercase tracking-widest px-3 mt-5 mb-1">Personal Library</span>

            <button
              onClick={() => setCurrentView("playlists")}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-xs font-bold leading-none cursor-pointer",
                currentView === "playlists"
                  ? "bg-red-600 text-white shadow-md font-extrabold"
                  : "text-foreground/75 hover:bg-foreground/5"
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
                "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-xs font-bold leading-none cursor-pointer",
                currentView === "offline"
                  ? "bg-red-600 text-white shadow-md font-extrabold"
                  : "text-foreground/75 hover:bg-foreground/5"
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

            <span className="text-[10px] font-extrabold text-foreground/40 uppercase tracking-widest px-3 mt-5 mb-1">Developer Sandbox</span>

            <button
              onClick={() => setCurrentView("html-adder")}
              className={cn(
                "flex items-center justify-between px-3 py-2.5 rounded-xl transition-all text-xs font-bold leading-none cursor-pointer",
                currentView === "html-adder"
                  ? "bg-red-600 text-white shadow-md font-extrabold"
                  : "text-foreground/75 hover:bg-foreground/5"
              )}
            >
              <div className="flex items-center gap-3">
                <Code className="w-4 h-4 shrink-0" />
                <span>HTML Adder</span>
              </div>
            </button>
          </>
        ) : (
          /* Render compact/collapsed Sidebar (Minimal icons row mimicking YouTube) */
          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={() => setCurrentView("browse")}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl transition-all cursor-pointer group",
                currentView === "browse"
                  ? "bg-red-600/10 text-red-500 font-extrabold"
                  : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
              )}
              title="Browse Streams"
            >
              <Tv className="w-5 h-5" />
              <span className="text-[9px] font-black group-hover:scale-105 transition-transform">Browse</span>
            </button>

            <button
              onClick={() => setCurrentView("channels")}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl transition-all cursor-pointer group",
                currentView === "channels"
                  ? "bg-red-600/10 text-red-500 font-extrabold"
                  : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
              )}
              title="Creators Hub"
            >
              <Radio className="w-5 h-5 text-red-500" />
              <span className="text-[9px] font-black group-hover:scale-105 transition-transform">Creators</span>
            </button>

            <button
              onClick={() => setCurrentView("downloader")}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl transition-all cursor-pointer group",
                currentView === "downloader"
                  ? "bg-red-600/10 text-red-500 font-extrabold"
                  : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
              )}
              title="YouTube Downloader"
            >
              <DownloadCloud className="w-5 h-5 text-rose-500" />
              <span className="text-[9px] font-black group-hover:scale-105 transition-transform">Download</span>
            </button>

            <button
              onClick={() => setCurrentView("playlists")}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl transition-all relative cursor-pointer group",
                currentView === "playlists"
                  ? "bg-red-600/10 text-red-500 font-extrabold"
                  : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
              )}
              title="My Playlists"
            >
              <Heart className="w-5 h-5 text-rose-500 fill-current" />
              <span className="text-[9px] font-black group-hover:scale-105 transition-transform">Playlists</span>
              {totalPlaylistVideos > 0 && (
                <span className="absolute top-1.5 right-1.5 text-[8px] font-bold bg-rose-500 text-white w-4 h-4 rounded-full flex items-center justify-center">
                  {totalPlaylistVideos}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentView("offline")}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl transition-all relative cursor-pointer group",
                currentView === "offline"
                  ? "bg-red-600/10 text-red-500 font-extrabold"
                  : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
              )}
              title="Offline Vault"
            >
              <Download className="w-5 h-5 text-emerald-500" />
              <span className="text-[9px] font-black group-hover:scale-105 transition-transform">Offline</span>
              {totalOfflineVideos > 0 && (
                <span className="absolute top-1.5 right-1.5 text-[8px] font-bold bg-emerald-500 text-white w-4 h-4 rounded-full flex items-center justify-center">
                  {totalOfflineVideos}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentView("html-adder")}
              className={cn(
                "flex flex-col items-center justify-center gap-1.5 py-3.5 rounded-xl transition-all cursor-pointer group",
                currentView === "html-adder"
                  ? "bg-red-600/10 text-red-500 font-extrabold"
                  : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
              )}
              title="HTML SNIPPET SANDBOX"
            >
              <Code className="w-5 h-5" />
              <span className="text-[9px] font-black group-hover:scale-105 transition-transform">Sandbox</span>
            </button>
          </div>
        )}
      </nav>

      {/* Theme Options */}
      <div className="mt-auto border-t border-border pt-4">
        <button
          onClick={toggleTheme}
          className={cn(
            "flex items-center rounded-lg hover:bg-foreground/5 transition-all text-xs font-bold text-foreground/70 hover:text-foreground group cursor-pointer",
            isCollapsed ? "justify-center p-2.5 w-full" : "gap-3 px-3 py-2.5 w-full"
          )}
          title="Toggle UI Color Theme"
        >
          <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden shrink-0">
            <SunIcon className={cn("absolute w-5 h-5 transition-all duration-500", theme === "dark" ? "opacity-0 rotate-90 scale-50" : "opacity-100 rotate-0 scale-100 text-amber-500 group-hover:rotate-45")} />
            <MoonIcon className={cn("absolute w-5 h-5 transition-all duration-500", theme === "light" ? "opacity-0 -rotate-90 scale-50" : "opacity-100 rotate-0 scale-100 text-blue-400 group-hover:-rotate-12")} />
          </div>
          {!isCollapsed && (theme === "dark" ? "Light Mode" : "Dark Mode")}
        </button>
      </div>
    </aside>
  );
}
