import React, { createContext, useContext, useState, useCallback } from "react";

interface PopoverHoverContextValue {
  hoveredDieId: string | null;
  hoveredValue: number | null;
  setHoveredDie: (id: string | null, value: number | null) => void;
}

const PopoverHoverContext = createContext<PopoverHoverContextValue | null>(null);

export function PopoverHoverProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [hoveredDieId, setHoveredDieId] = useState<string | null>(null);
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  const setHoveredDie = useCallback(
    (id: string | null, value: number | null) => {
      setHoveredDieId(id);
      setHoveredValue(value);
    },
    []
  );

  return (
    <PopoverHoverContext.Provider
      value={{ hoveredDieId, hoveredValue, setHoveredDie }}
    >
      {children}
    </PopoverHoverContext.Provider>
  );
}

export function usePopoverHover() {
  const context = useContext(PopoverHoverContext);
  return context;
}
