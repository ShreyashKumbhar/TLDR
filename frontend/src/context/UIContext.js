import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

export const LayoutModes = {
  DYNAMIC_CANVAS: 'dynamic-canvas',
  RIBBON_STREAM: 'ribbon-stream',
  MAGAZINE_SPREAD: 'magazine-spread',
  SPATIAL_TILES: 'spatial-tiles',
  STACKED_NEWSPAPER: 'stacked-newspaper'
};

export const MoodFilters = {
  CALM: 'calm',
  QUICK_READ: 'quick-read',
  DEEP_DIVE: 'deep-dive',
  MOST_DEBATED: 'most-debated'
};

export const Themes = {
  LIGHT: 'light',
  DARK: 'dark'
};

const MoodTokens = {
  [MoodFilters.CALM]: {
    name: 'Calm',
    description: 'Slower animations, gentle gradients.',
    speedFactor: 1.4,
    parallax: 0.4,
    theme: 'neo-editorial'
  },
  [MoodFilters.QUICK_READ]: {
    name: 'Quick Read',
    description: 'Compressed summaries, fast motion.',
    speedFactor: 0.7,
    parallax: 0.2,
    theme: 'nordic-minimal'
  },
  [MoodFilters.DEEP_DIVE]: {
    name: 'Deep Dive',
    description: 'Expanded summaries, deliberate pacing.',
    speedFactor: 1.1,
    parallax: 0.6,
    theme: 'neo-editorial'
  },
  [MoodFilters.MOST_DEBATED]: {
    name: 'Most Debated',
    description: 'Highlighted discussion density.',
    speedFactor: 0.85,
    parallax: 0.5,
    theme: 'soft-cyberpunk'
  }
};

const LayoutTokens = {
  [LayoutModes.DYNAMIC_CANVAS]: {
    name: 'Dynamic Reading Canvas'
  },
  [LayoutModes.RIBBON_STREAM]: {
    name: 'Ribbon Stream 2.0'
  },
  [LayoutModes.MAGAZINE_SPREAD]: {
    name: 'Magazine Spread'
  },
  [LayoutModes.SPATIAL_TILES]: {
    name: 'Spatial Tiles'
  },
  [LayoutModes.STACKED_NEWSPAPER]: {
    name: 'Stacked Newspaper'
  }
};

const UIContext = createContext(null);

export function UIProvider({ children }) {
  const [layoutMode, setLayoutMode] = useState(LayoutModes.DYNAMIC_CANVAS);
  const [mood, setMood] = useState(MoodFilters.CALM);
  const [theme, setTheme] = useState(Themes.LIGHT);
  const [isCommandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [badge, setBadge] = useState(null);

  useEffect(() => {
    const token = MoodTokens[mood];
    const root = document.documentElement;
    root.style.setProperty('--motion-speed-factor', token.speedFactor.toString());
    root.style.setProperty('--parallax-strength', token.parallax.toString());
    root.dataset.tldrTheme = token.theme;
    root.dataset.theme = theme;
  }, [mood, theme]);

  const toggleCommandPalette = useCallback(() => {
    setCommandPaletteOpen((prev) => !prev);
  }, []);

  const openCommandPalette = useCallback(() => {
    setCommandPaletteOpen(true);
  }, []);

  const closeCommandPalette = useCallback(() => {
    setCommandPaletteOpen(false);
  }, []);

  const triggerBadge = useCallback((payload) => {
    setBadge(payload);
    const timeout = setTimeout(() => setBadge(null), 2400);
    return () => clearTimeout(timeout);
  }, []);

  const value = useMemo(() => ({
    layoutMode,
    setLayoutMode,
    layoutTokens: LayoutTokens,
    mood,
    setMood,
    moodTokens: MoodTokens,
    theme,
    setTheme,
    themes: Themes,
    isCommandPaletteOpen,
    toggleCommandPalette,
    openCommandPalette,
    closeCommandPalette,
    badge,
    triggerBadge
  }), [layoutMode, mood, theme, isCommandPaletteOpen, toggleCommandPalette, openCommandPalette, closeCommandPalette, badge, triggerBadge]);

  return (
    <UIContext.Provider value={value}>
      {children}
    </UIContext.Provider>
  );
}

export function useUI() {
  const ctx = useContext(UIContext);
  if (!ctx) {
    throw new Error('useUI must be used within UIProvider');
  }
  return ctx;
}
