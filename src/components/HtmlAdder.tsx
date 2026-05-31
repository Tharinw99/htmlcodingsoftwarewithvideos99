import React, { useState } from "react";
import { AddIcon, CloseIcon, ImageIcon, CodeIcon, DiskIcon, FileCodeIcon, PlayIcon } from "./Icons";
import { useAppStore } from "../store";
import { HtmlSnippet } from "../types";

type ViewState = "grid" | "add" | "view";

export function HtmlAdder() {
  const { htmlSnippets, addHtmlSnippet, removeHtmlSnippet } = useAppStore();
  const [view, setView] = useState<ViewState>("grid");
  const [activeSnippet, setActiveSnippet] = useState<HtmlSnippet | null>(null);

  // Form State
  const [name, setName] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [content, setContent] = useState("");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !content.trim()) return;

    addHtmlSnippet({
      name,
      coverUrl: coverUrl || "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80",
      content,
    });
    
    // Reset form
    setName("");
    setCoverUrl("");
    setContent("");
    setView("grid");
  };

  const handleOpenSnippet = (snippet: HtmlSnippet) => {
    setActiveSnippet(snippet);
    setView("view");
  };

  if (view === "view" && activeSnippet) {
    return (
      <div className="flex flex-col h-full w-full bg-background relative animate-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-4 border-b border-border bg-card shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-blue-500/20 outline outline-1 outline-primary/20 flex items-center justify-center text-primary shadow-inner">
              <FileCodeIcon className="w-5 h-5" />
            </span>
            <div>
               <h2 className="font-bold text-lg tracking-tight leading-tight">{activeSnippet.name}</h2>
               <p className="text-xs text-foreground/50 font-medium">Local HTML Preview</p>
            </div>
          </div>
          <button
            onClick={() => {
              setView("grid");
              setActiveSnippet(null);
            }}
            className="p-2.5 bg-foreground/5 hover:bg-red-500/10 hover:text-red-500 rounded-xl transition-all text-foreground/60 shadow-sm active:scale-95"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex-grow bg-white overflow-hidden relative">
          <iframe
            title={activeSnippet.name}
            className="w-full h-full absolute inset-0 border-none bg-white text-black"
            srcDoc={activeSnippet.content}
            sandbox="allow-scripts allow-same-origin"
          />
        </div>
      </div>
    );
  }

  if (view === "add") {
    return (
      <div className="flex flex-col h-full w-full p-6 animate-in slide-in-from-right-8 duration-500 overflow-y-auto">
        <div className="flex items-center justify-between mb-8 max-w-4xl mx-auto w-full sticky top-0 bg-background/80 backdrop-blur z-10 py-4 border-b border-border/50">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-1 bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">Create HTML Block</h2>
            <p className="text-foreground/60 text-sm font-medium">Design your structure and save it for later viewing.</p>
          </div>
          <button
            onClick={() => setView("grid")}
            className="p-3 bg-card hover:bg-foreground/5 border border-border shadow-sm rounded-2xl transition-all text-foreground/60 hover:text-foreground active:scale-95"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="flex-grow flex flex-col max-w-4xl mx-auto w-full gap-8 pb-12">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <div className="space-y-6 md:col-span-4">
              <div className="bg-card p-5 rounded-3xl border border-border/50 shadow-sm space-y-5">
                <div>
                  <label className="block text-sm font-bold mb-2 text-foreground/80">Snippet Name</label>
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Cool Button Animation"
                    className="w-full px-4 py-3 bg-background border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm text-sm"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-bold mb-2 text-foreground/80">
                    Cover Image URL
                  </label>
                  <div className="relative">
                    <ImageIcon className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-foreground/40" />
                    <input
                      type="url"
                      value={coverUrl}
                      onChange={(e) => setCoverUrl(e.target.value)}
                      placeholder="https://image-url.com/img.jpg"
                      className="w-full pl-10 pr-4 py-3 bg-background border border-border/60 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:col-span-8 bg-card rounded-3xl border border-border/50 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 bg-muted px-4 py-3 border-b border-border/50">
                <div className="flex gap-1.5 mr-2">
                   <div className="w-3 h-3 rounded-full bg-red-400"></div>
                   <div className="w-3 h-3 rounded-full bg-amber-400"></div>
                   <div className="w-3 h-3 rounded-full bg-green-400"></div>
                </div>
                <CodeIcon className="w-4 h-4 text-foreground/40" />
                <span className="text-xs font-mono text-foreground/50 tracking-wider">index.html</span>
              </div>
              <textarea
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="<!DOCTYPE html>..."
                className="w-full flex-grow min-h-[400px] px-5 py-4 bg-background focus:outline-none transition-all font-mono text-sm leading-relaxed resize-none text-foreground/90 placeholder:text-foreground/20"
                spellCheck={false}
              ></textarea>
            </div>
          </div>

          <div className="flex justify-end sticky bottom-6 z-10 pt-4">
            <button
              type="submit"
              className="bg-primary text-primary-foreground hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/20 hover:-translate-y-0.5 px-8 py-3.5 rounded-2xl font-bold flex items-center gap-2.5 transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <DiskIcon className="w-5 h-5" />
              Save Snippet
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full w-full p-8 overflow-y-auto animate-in fade-in duration-700 bg-background/50">
      <div className="flex items-center justify-between mb-10 max-w-7xl mx-auto w-full">
        <div>
          <h2 className="text-4xl font-bold tracking-tight mb-2">HTML Vault</h2>
          <p className="text-foreground/60 text-base font-medium">Manage and preview your saved HTML creations with ease.</p>
        </div>
        <button
          onClick={() => setView("add")}
          className="bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5 px-6 py-3 rounded-2xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-primary/20 active:scale-95 cursor-pointer"
        >
          <AddIcon className="w-5 h-5" />
          Add HTML
        </button>
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 pb-24">
        {htmlSnippets.length === 0 ? (
          <div className="col-span-full py-24 flex flex-col items-center justify-center text-center bg-card rounded-3xl border border-dashed border-border/60 shadow-sm">
            <div className="w-20 h-20 bg-primary/5 rounded-3xl flex items-center justify-center text-primary mb-6 outline outline-1 outline-primary/10">
              <CodeIcon className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight mb-3">No HTML Snippets yet</h3>
            <p className="text-foreground/60 max-w-md text-base leading-relaxed">
              Create your first HTML block to preview it instantly. You can add external covers and give it a custom name.
            </p>
            <button
               onClick={() => setView("add")}
               className="mt-8 text-primary font-bold hover:underline underline-offset-4"
            >
               Create one now -&gt;
            </button>
          </div>
        ) : (
          htmlSnippets.map((snippet) => (
            <div 
              key={snippet.id}
              className="group bg-card border border-border/50 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col"
              onClick={() => handleOpenSnippet(snippet)}
            >
              <div className="h-48 w-full overflow-hidden relative bg-muted">
                <img 
                  src={snippet.coverUrl} 
                  alt={snippet.name} 
                  className="w-full h-full object-cover group-hover:scale-110 group-hover:rotate-1 transition-all duration-700 ease-out" 
                  onError={(e) => {
                    // Fallback image if broken
                    (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=500&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                     <PlayIcon className="w-5 h-5 ml-1 fill-current" />
                  </div>
                </div>
              </div>
              <div className="p-5 flex-grow flex flex-col justify-between bg-card relative z-10">
                <div>
                  <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">{snippet.name}</h3>
                  <p className="text-xs text-foreground/40 font-medium mt-2 flex items-center gap-1.5 uppercase tracking-wider">
                     <CodeIcon className="w-3 h-3" /> HTML • {new Date(snippet.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    if(confirm('Are you sure you want to delete this snippet?')) {
                      removeHtmlSnippet(snippet.id);
                    }
                  }}
                  className="self-start mt-6 text-xs font-bold text-red-500/80 hover:text-red-500 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

