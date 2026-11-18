'use client';

import React, { useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';

interface AdminLayoutClientProps {
  children: React.ReactNode;
  boardingName?: string;
}

export function AdminLayoutClient({ children, boardingName }: AdminLayoutClientProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        <Header onOpenSidebar={() => setSidebarOpen(true)} boardingName={boardingName} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
