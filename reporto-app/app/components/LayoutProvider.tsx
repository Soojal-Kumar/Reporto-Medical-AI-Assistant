// app/components/LayoutProvider.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { Sidebar } from "./Sidebar";
import { PanelRightOpen } from "lucide-react";
import { useAppContext } from "./AppContext";
import { useRouter, usePathname } from "next/navigation";

export default function LayoutProvider({ children }: { children: React.ReactNode }) {
  const { user, authLoading } = useAppContext();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const hasRedirected = useRef(false);

  useEffect(() => {
    // Prevent multiple redirects
    if (authLoading || hasRedirected.current) return;

    if (!user && pathname !== '/login') {
      hasRedirected.current = true;
      router.push('/login');
    } else if (user && pathname === '/login') {
      hasRedirected.current = true;
      router.push('/');
    }

    // Reset redirect flag after a delay to allow for future navigation
    const timeout = setTimeout(() => {
      hasRedirected.current = false;
    }, 1000);

    return () => clearTimeout(timeout);
  }, [user, authLoading, pathname, router]);

  // Reset redirect flag when user state changes
  useEffect(() => {
    hasRedirected.current = false;
  }, [user]);

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#202123] text-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          <p>Authenticating...</p>
        </div>
      </div>
    );
  }
  
  // Show login page or unauthenticated content
  if (!user || pathname === '/login') {
    return <div className="bg-[#202123] min-h-screen">{children}</div>;
  }

  // Main authenticated app layout
  return (
    <div className="flex h-screen bg-[#202123]">
      <aside 
        className={`bg-[#202123] text-white transition-all duration-300 border-r border-gray-700/50 ${
          isSidebarOpen ? 'w-72' : 'w-0'
        }`}
      >
        <div className={`h-full overflow-hidden transition-all duration-300 ${
          isSidebarOpen ? 'p-2' : 'p-0'
        }`}>
          <Sidebar
            isOpen={isSidebarOpen}
            toggleSidebar={() => setIsSidebarOpen(false)}
          />
        </div>
      </aside>
      
      <main className="flex-1 overflow-hidden relative bg-black">
        {!isSidebarOpen && (
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="absolute top-4 left-4 z-10 p-2 rounded-md bg-[#202123] hover:bg-[#2a2b32] transition-colors border border-gray-700/50"
            aria-label="Open sidebar"
          >
            <PanelRightOpen size={20} className="text-white" />
          </button>
        )}
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}