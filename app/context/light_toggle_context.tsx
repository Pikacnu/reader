import { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '~/hooks/uselocalstorage';

export const LightToggleContext = createContext<{
  isLightMode: boolean;
  toggleLightMode: () => boolean; // Return state after toggle
}>({
  isLightMode: false,
  toggleLightMode: () => false,
});

export const useLightMode = () => {
  const context = useContext(LightToggleContext);
  if (!context) {
    throw new Error('useLightMode must be used within a LightToggleProvider');
  }
  return context;
};

export const LightToggleProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isLightMode, setIsLightMode] = useLocalStorage('lightMode', true);

  useEffect(() => {
    // Check for saved preference or default to false
    const savedMode = localStorage.getItem('lightMode');
    if (savedMode !== null) {
      setIsLightMode(savedMode === 'true');
    }
  }, []);

  useEffect(() => {
    // Update document class and save preference
    if (isLightMode) {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('lightMode', isLightMode.toString());
  }, [isLightMode]);

  const toggleLightMode = () => {
    setIsLightMode((prev) => !prev);
    return !isLightMode;
  };

  return (
    <LightToggleContext.Provider value={{ isLightMode, toggleLightMode }}>
      {children}
    </LightToggleContext.Provider>
  );
};
