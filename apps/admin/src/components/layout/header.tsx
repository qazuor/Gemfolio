import { Button } from '@gemfolio/ui';
import { Bell, Menu, Moon, Search, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';

import { UserNav } from '@/components/auth';
import { useUIStore } from '@/stores/ui';

export function Header() {
  const { theme, setTheme } = useTheme();
  const { toggleMobileSidebar } = useUIStore();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={toggleMobileSidebar}>
          <Menu className="h-5 w-5" />
          <span className="sr-only">Abrir menú</span>
        </Button>

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

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="rounded-lg p-2 hover:bg-accent"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Cambiar tema</span>
        </button>

        <button type="button" className="relative rounded-lg p-2 hover:bg-accent">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive" />
        </button>

        <div className="ml-2">
          <UserNav />
        </div>
      </div>
    </header>
  );
}
