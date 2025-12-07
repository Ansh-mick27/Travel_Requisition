/**
 * Premium Corporate Theme for Travel Requisition
 * Primary: Deep Royal Blue (Trust, Professionalism)
 * Accent: Golden Amber (Action, Warmth)
 */


const tintColorLight = '#1E3A8A'; // Deep Blue
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#1E293B',        // Slate 800
    background: '#F1F5F9',  // Slate 100 (Light Gray-Blue background)
    tint: tintColorLight,
    icon: '#64748B',        // Slate 500
    tabIconDefault: '#94A3B8',
    tabIconSelected: tintColorLight,
    primary: '#1E3A8A',     // Royal Blue
    secondary: '#F59E0B',   // Amber
    accent: '#8B5CF6',      // Violet (New Accent)
    card: '#FFFFFF',
    border: '#E2E8F0',
    error: '#EF4444',
  },
  dark: {
    text: '#ECEDEE',
    background: '#0F172A',  // Slate 900
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    primary: '#3B82F6',     // Brighter Blue for Dark Mode
    secondary: '#FBBF24',
    card: '#1E293B',
    border: '#334155',
    error: '#EF4444',
    accent: '#8B5CF6',
  },
};

export const Shadows = {
  light: {
    small: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 6,
      elevation: 4,
    },
    large: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 12,
      elevation: 8,
    },
  }
};
