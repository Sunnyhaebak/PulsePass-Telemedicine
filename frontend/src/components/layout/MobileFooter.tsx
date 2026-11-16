'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, MessageSquare, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export const MobileFooter: React.FC = () => {
  const pathname = usePathname();

  const links = [
    { href: '/patient', label: 'Home', icon: Home },
    { href: '/patient/book', label: 'Book Slot', icon: Calendar },
    { href: '/patient/chat', label: 'Consult', icon: MessageSquare },
  ];

  return (
    <footer className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 px-6 py-2 flex items-center justify-around">
      {links.map((link) => {
        const Icon = link.icon;
        const isActive = pathname === link.href;

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'flex flex-col items-center gap-1 text-[11px] font-medium transition-colors',
              isActive ? 'text-primary font-bold' : 'text-slate-500 hover:text-slate-800',
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </footer>
  );
};
