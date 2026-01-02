"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface SidebarContextType {
  isOpen: boolean;
  toggleSidebar: () => void;
  setIsOpen: (isOpen: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

interface SidebarProviderProps {
  children: ReactNode;
}

export const SidebarProvider = ({ children }: SidebarProviderProps) => {
  // Default to false (collapsed) for mobile-first or cleaner look,
  // but we'll read from localStorage immediately if possible.
  const [isOpen, setIsOpenState] = useState(true);

  // Initialize from localStorage on mount
  useEffect(() => {
    const savedState = localStorage.getItem("sidebar_state");
    if (savedState !== null) {
      setIsOpenState(savedState === "true");
    }
  }, []);

  const setIsOpen = (value: boolean) => {
    setIsOpenState(value);
    localStorage.setItem("sidebar_state", String(value));
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const value = {
    isOpen,
    toggleSidebar,
    setIsOpen,
  };

  return (
    <SidebarContext.Provider value={value}>{children}</SidebarContext.Provider>
  );
};
