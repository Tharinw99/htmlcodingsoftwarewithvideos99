/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { YouTubeViewer } from './components/YouTubeViewer';
import { HtmlAdder } from './components/HtmlAdder';
import { useAppStore } from './store';

export default function App() {
  const [currentView, setCurrentView] = useState<"youtube" | "html-adder">("youtube");
  const { theme } = useAppStore();

  useEffect(() => {
    // Apply theme to document
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground transition-colors duration-300">
      <Sidebar currentView={currentView} setCurrentView={setCurrentView} />
      
      <main className="flex-grow flex flex-col relative overflow-hidden bg-muted/20">
        {currentView === "youtube" ? <YouTubeViewer /> : <HtmlAdder />}
      </main>
    </div>
  );
}
