import { useStore } from '@nanostores/react';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';
import { $theme, applyTheme, setTheme, type Theme } from '@/stores/ui';

export default function ThemeToggle() {
  const theme = useStore($theme);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Apply theme on mount and listen for system preference changes
    applyTheme(theme);

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const handleSelect = (newTheme: Theme) => {
    setTheme(newTheme);
    setIsOpen(false);
  };

  const getIcon = () => {
    if (!mounted) return <Sun className="h-4 w-4" />;

    if (theme === 'system') {
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      return isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />;
    }
    return theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />;
  };

  const options: { value: Theme; label: string; icon: React.ReactNode }[] = [
    { value: 'light', label: 'Claro', icon: <Sun className="h-4 w-4" /> },
    { value: 'dark', label: 'Oscuro', icon: <Moon className="h-4 w-4" /> },
    { value: 'system', label: 'Sistema', icon: <Monitor className="h-4 w-4" /> },
  ];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-input bg-background text-muted-foreground transition-colors hover:bg-accent hover:text-foreground btn-press"
        aria-label="Cambiar tema"
        aria-expanded={isOpen}
      >
        {getIcon()}
      </button>

      {isOpen && (
        <>
          {/* biome-ignore lint/a11y/noStaticElementInteractions: Backdrop overlay for closing dropdown */}
          {/* biome-ignore lint/a11y/useKeyWithClickEvents: Escape key handled by dropdown options */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full z-50 mt-2 w-36 rounded-lg border bg-popover p-1 shadow-lg animate-fade-in-down">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={`flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${
                  theme === option.value
                    ? 'bg-accent text-accent-foreground'
                    : 'text-popover-foreground hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
