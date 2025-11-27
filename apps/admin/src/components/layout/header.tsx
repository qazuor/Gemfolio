'use client';

import { Bell, Menu, Moon, Search, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { UserNav } from '@/components/auth';

export function Header() {
  const { theme, setTheme } = useTheme();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      {/* Left side */}
      <div className="flex items-center gap-4">
        {/* Mobile menu button */}
        <button type="button" className="rounded-lg p-2 hover:bg-accent lg:hidden">
          <Menu className="h-5 w-5" />
        </button>

        {/* Search */}
        <div className="hidden items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 md:flex">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-64 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="hidden rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground lg:inline">
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-2">
        {/* Theme toggle */}
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-lg p-2 hover:bg-accent"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Cambiar tema</span>
        </button>

        {/* Notifications */}
        <button type="button" className="relative rounded-lg p-2 hover:bg-accent">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>

        {/* User menu */}
        <div className="ml-2">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
