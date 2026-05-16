import { useState, useCallback, createContext, useContext } from 'react';
import { Theme } from '../types';
import { lightTheme, darkTheme } from '../themes';

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Partial<Theme>) => void;
  resetTheme: () => void;
  toggleTheme: () => void;
  mode: 'light' | 'dark';
}

const defaultTheme = lightTheme;

const ThemeContext = createContext<ThemeContextValue>({
  theme: defaultTheme,
  setTheme: () => {},
  resetTheme: () => {},
  toggleTheme: () => {},
  mode: 'light',
});

function deepMerge<T extends object>(target: T, source: Partial<T>): T {
  const result = { ...target };
  for (const key of Object.keys(source) as Array<keyof T>) {
    const sourceValue = source[key];
    const targetValue = target[key];
    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      targetValue &&
      typeof targetValue === 'object' &&
      !Array.isArray(targetValue)
    ) {
      (result as any)[key] = deepMerge(targetValue, sourceValue as any);
    } else if (sourceValue !== undefined) {
      (result as any)[key] = sourceValue;
    }
  }
  return result;
}

export function useTheme(initialTheme?: Partial<Theme>): ThemeContextValue {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const [baseTheme, setBaseTheme] = useState<Theme>(
    initialTheme ? deepMerge(defaultTheme, initialTheme) : defaultTheme
  );

  const setTheme = useCallback((partial: Partial<Theme>) => {
    setBaseTheme((prev) => deepMerge(prev, partial));
  }, []);

  const resetTheme = useCallback(() => {
    setBaseTheme(defaultTheme);
    setMode('light');
  }, []);

  const toggleTheme = useCallback(() => {
    setMode((prev) => {
      const newMode = prev === 'light' ? 'dark' : 'light';
      setBaseTheme(newMode === 'dark' ? darkTheme : lightTheme);
      return newMode;
    });
  }, []);

  return {
    theme: baseTheme,
    setTheme,
    resetTheme,
    toggleTheme,
    mode,
  };
}

export function useThemeContext(): ThemeContextValue {
  return useContext(ThemeContext);
}

export { ThemeContext };
export default useTheme;
