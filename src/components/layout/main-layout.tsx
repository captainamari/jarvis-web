'use client';

import { useState } from 'react';
import { Sidebar } from './sidebar';
import { cn } from '@/lib/utils';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar - Fixed width */}
      <Sidebar
        collapsed={sidebarCollapsed}
        onCollapsedChange={setSidebarCollapsed}
      />

      {/* Main Content Area */}
      <main
        className={cn(
          'flex-1 overflow-auto scrollbar-thin transition-all duration-300'
        )}
      >
        {children}
      </main>
    </div>
  );
}
