/**
 * Gemfolio Theme Configuration
 *
 * This file centralizes all theme configuration for easy customization.
 * To change the color scheme:
 * 1. Modify the color values in lightTheme and darkTheme
 * 2. Regenerate CSS variables using the generateCSSVariables function
 *
 * Colors are defined in HSL format (hue, saturation%, lightness%)
 * Example: { h: 221, s: 83, l: 53 } = hsl(221, 83%, 53%)
 */

type HSLColor = {
  h: number;
  s: number;
  l: number;
};

type ThemeColors = {
  background: HSLColor;
  foreground: HSLColor;
  card: HSLColor;
  cardForeground: HSLColor;
  popover: HSLColor;
  popoverForeground: HSLColor;
  primary: HSLColor;
  primaryForeground: HSLColor;
  secondary: HSLColor;
  secondaryForeground: HSLColor;
  muted: HSLColor;
  mutedForeground: HSLColor;
  accent: HSLColor;
  accentForeground: HSLColor;
  destructive: HSLColor;
  destructiveForeground: HSLColor;
  border: HSLColor;
  input: HSLColor;
  ring: HSLColor;
  // Sidebar specific
  sidebarBackground: HSLColor;
  sidebarForeground: HSLColor;
  sidebarPrimary: HSLColor;
  sidebarPrimaryForeground: HSLColor;
  sidebarAccent: HSLColor;
  sidebarAccentForeground: HSLColor;
};

/**
 * Light theme color configuration
 * Default: Blue primary with light gray backgrounds
 */
export const lightTheme: ThemeColors = {
  background: { h: 0, s: 0, l: 100 },
  foreground: { h: 222, s: 84, l: 5 },
  card: { h: 0, s: 0, l: 100 },
  cardForeground: { h: 222, s: 84, l: 5 },
  popover: { h: 0, s: 0, l: 100 },
  popoverForeground: { h: 222, s: 84, l: 5 },
  primary: { h: 221, s: 83, l: 53 },
  primaryForeground: { h: 210, s: 40, l: 98 },
  secondary: { h: 210, s: 40, l: 96 },
  secondaryForeground: { h: 222, s: 47, l: 11 },
  muted: { h: 210, s: 40, l: 96 },
  mutedForeground: { h: 215, s: 16, l: 47 },
  accent: { h: 210, s: 40, l: 96 },
  accentForeground: { h: 222, s: 47, l: 11 },
  destructive: { h: 0, s: 84, l: 60 },
  destructiveForeground: { h: 210, s: 40, l: 98 },
  border: { h: 214, s: 32, l: 91 },
  input: { h: 214, s: 32, l: 91 },
  ring: { h: 221, s: 83, l: 53 },
  sidebarBackground: { h: 0, s: 0, l: 100 },
  sidebarForeground: { h: 222, s: 84, l: 5 },
  sidebarPrimary: { h: 221, s: 83, l: 53 },
  sidebarPrimaryForeground: { h: 210, s: 40, l: 98 },
  sidebarAccent: { h: 210, s: 40, l: 96 },
  sidebarAccentForeground: { h: 222, s: 47, l: 11 },
};

/**
 * Dark theme color configuration
 * Default: Blue primary with dark gray backgrounds
 */
export const darkTheme: ThemeColors = {
  background: { h: 222, s: 84, l: 5 },
  foreground: { h: 210, s: 40, l: 98 },
  card: { h: 222, s: 84, l: 5 },
  cardForeground: { h: 210, s: 40, l: 98 },
  popover: { h: 222, s: 84, l: 5 },
  popoverForeground: { h: 210, s: 40, l: 98 },
  primary: { h: 217, s: 91, l: 60 },
  primaryForeground: { h: 222, s: 47, l: 11 },
  secondary: { h: 217, s: 33, l: 18 },
  secondaryForeground: { h: 210, s: 40, l: 98 },
  muted: { h: 217, s: 33, l: 18 },
  mutedForeground: { h: 215, s: 20, l: 65 },
  accent: { h: 217, s: 33, l: 18 },
  accentForeground: { h: 210, s: 40, l: 98 },
  destructive: { h: 0, s: 63, l: 31 },
  destructiveForeground: { h: 210, s: 40, l: 98 },
  border: { h: 217, s: 33, l: 18 },
  input: { h: 217, s: 33, l: 18 },
  ring: { h: 224, s: 76, l: 48 },
  sidebarBackground: { h: 222, s: 84, l: 5 },
  sidebarForeground: { h: 210, s: 40, l: 98 },
  sidebarPrimary: { h: 217, s: 91, l: 60 },
  sidebarPrimaryForeground: { h: 222, s: 47, l: 11 },
  sidebarAccent: { h: 217, s: 33, l: 18 },
  sidebarAccentForeground: { h: 210, s: 40, l: 98 },
};

/**
 * Convert HSL object to CSS value format
 */
function hslToCSS(color: HSLColor): string {
  return `${color.h} ${color.s}% ${color.l}%`;
}

/**
 * Generate CSS variables from theme configuration
 */
export function generateCSSVariables(theme: ThemeColors): string {
  const variables: Record<string, string> = {
    '--background': hslToCSS(theme.background),
    '--foreground': hslToCSS(theme.foreground),
    '--card': hslToCSS(theme.card),
    '--card-foreground': hslToCSS(theme.cardForeground),
    '--popover': hslToCSS(theme.popover),
    '--popover-foreground': hslToCSS(theme.popoverForeground),
    '--primary': hslToCSS(theme.primary),
    '--primary-foreground': hslToCSS(theme.primaryForeground),
    '--secondary': hslToCSS(theme.secondary),
    '--secondary-foreground': hslToCSS(theme.secondaryForeground),
    '--muted': hslToCSS(theme.muted),
    '--muted-foreground': hslToCSS(theme.mutedForeground),
    '--accent': hslToCSS(theme.accent),
    '--accent-foreground': hslToCSS(theme.accentForeground),
    '--destructive': hslToCSS(theme.destructive),
    '--destructive-foreground': hslToCSS(theme.destructiveForeground),
    '--border': hslToCSS(theme.border),
    '--input': hslToCSS(theme.input),
    '--ring': hslToCSS(theme.ring),
    '--sidebar-background': hslToCSS(theme.sidebarBackground),
    '--sidebar-foreground': hslToCSS(theme.sidebarForeground),
    '--sidebar-primary': hslToCSS(theme.sidebarPrimary),
    '--sidebar-primary-foreground': hslToCSS(theme.sidebarPrimaryForeground),
    '--sidebar-accent': hslToCSS(theme.sidebarAccent),
    '--sidebar-accent-foreground': hslToCSS(theme.sidebarAccentForeground),
  };

  return Object.entries(variables)
    .map(([key, value]) => `${key}: ${value};`)
    .join('\n    ');
}

/**
 * Pre-generated CSS for light theme
 * Copy this to your globals.css :root block
 */
export const lightThemeCSS = `
:root {
    ${generateCSSVariables(lightTheme)}
    --radius: 0.5rem;
}
`;

/**
 * Pre-generated CSS for dark theme
 * Copy this to your globals.css .dark block
 */
export const darkThemeCSS = `
.dark {
    ${generateCSSVariables(darkTheme)}
}
`;

// Example alternative themes for quick customization:

/**
 * Gold/Jewelry theme (ideal for jewelry stores)
 */
export const goldLightTheme: Partial<ThemeColors> = {
  primary: { h: 43, s: 74, l: 49 }, // Gold
  primaryForeground: { h: 0, s: 0, l: 100 },
  ring: { h: 43, s: 74, l: 49 },
};

/**
 * Rose Gold theme
 */
export const roseGoldLightTheme: Partial<ThemeColors> = {
  primary: { h: 351, s: 55, l: 67 }, // Rose gold
  primaryForeground: { h: 0, s: 0, l: 100 },
  ring: { h: 351, s: 55, l: 67 },
};

/**
 * Emerald theme
 */
export const emeraldLightTheme: Partial<ThemeColors> = {
  primary: { h: 152, s: 69, l: 31 }, // Emerald
  primaryForeground: { h: 0, s: 0, l: 100 },
  ring: { h: 152, s: 69, l: 31 },
};

/**
 * Merge a partial theme with the base theme
 */
export function mergeTheme(base: ThemeColors, overrides: Partial<ThemeColors>): ThemeColors {
  return { ...base, ...overrides };
}
