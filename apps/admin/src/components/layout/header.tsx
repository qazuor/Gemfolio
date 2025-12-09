import { Button } from '@gemfolio/ui';
import { Bell, Menu, Moon, Search, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useState } from 'react';

import { UserNav } from '@/components/auth';
import { useUIStore } from '@/stores/ui';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { toggleMobileSidebar } = useUIStore();
  const [showMobileSearch, setShowMobileSearch] = useState(false);

  return (
    <header className="flex h-14 sm:h-16 items-center justify-between border-b bg-background px-3 sm:px-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden h-9 w-9"
          onClick={toggleMobileSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>

        {/* Desktop Search */}
        <div className="hidden items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2 md:flex">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar..."
            className="w-40 lg:w-64 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="hidden rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground lg:inline">
            ⌘K
          </kbd>
        </div>

        {/* Mobile Search Toggle */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden h-9 w-9"
          onClick={() => setShowMobileSearch(!showMobileSearch)}
        >
          <Search className="h-5 w-5" />
          <span className="sr-only">Buscar</span>
        </Button>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-lg p-2 hover:bg-accent h-9 w-9 flex items-center justify-center"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Cambiar tema</span>
        </button>

        <button
          type="button"
          className="relative rounded-lg p-2 hover:bg-accent h-9 w-9 flex items-center justify-center"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
        </button>

        <div className="ml-1 sm:ml-2">
          <UserNav />
        </div>
      </div>

      {/* Mobile Search Overlay */}
      {showMobileSearch && (
        <div className="absolute top-14 left-0 right-0 z-50 border-b bg-background p-3 md:hidden">
          <div className="flex items-center gap-2 rounded-lg border bg-muted/50 px-3 py-2">
            <Search className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <input
              type="text"
              placeholder="Buscar..."
              className="flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
            />
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2 text-xs"
              onClick={() => setShowMobileSearch(false)}
            >
              Cerrar
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
