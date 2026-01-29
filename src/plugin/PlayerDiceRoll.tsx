import React, { useMemo } from "react";
import { Player } from "@owlbear-rodeo/sdk";

import { usePlayerDice } from "./usePlayerDice";
import { DiceRoll } from "../dice/DiceRoll";
import { Dice } from "../dice/Dice";
import { Die } from "../types/Die";
import { usePopoverHover } from "./PopoverHoverContext";

// Create hoverable dice component that uses context
const HoverableDice = React.forwardRef<
  THREE.Group,
  JSX.IntrinsicElements["group"] & { die: Die; rollValues?: Record<string, number> }
>(({ die, rollValues, ...props }, ref) => {
  const popoverHover = usePopoverHover();
  const value = rollValues?.[die.id] ?? null;

  const handlePointerOver = (e: any) => {
    e.stopPropagation();
    if (popoverHover && value !== null) {
      popoverHover.setHoveredDie(die.id, value);
      document.body.style.cursor = "pointer";
    }
  };

  const handlePointerOut = (e: any) => {
    e.stopPropagation();
    if (popoverHover) {
      popoverHover.setHoveredDie(null, null);
      document.body.style.cursor = "auto";
    }
  };

  return (
    <Dice
      ref={ref}
      die={die}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      {...props}
    />
  );
});

export function PlayerDiceRoll({ player }: { player?: Player }) {
  const {
    diceRoll,
    rollThrows,
    finishedRollTransforms,
    finishedRolling,
    finishedRollValues,
    transformsRef,
  } = usePlayerDice(player);

  // Create a wrapper component that passes rollValues to HoverableDice
  const DiceWithValues = useMemo(() => {
    return React.forwardRef<
      THREE.Group,
      JSX.IntrinsicElements["group"] & { die: Die }
    >((props, ref) => (
      <HoverableDice ref={ref} rollValues={finishedRollValues} {...props} />
    ));
  }, [finishedRollValues]);

  if (!diceRoll || !rollThrows || !finishedRollTransforms) {
    return null;
  }

  return (
    <DiceRoll
      roll={diceRoll}
      rollThrows={rollThrows}
      finishedTransforms={finishedRolling ? finishedRollTransforms : undefined}
      transformsRef={transformsRef}
      Dice={DiceWithValues}
    />
  );
}
