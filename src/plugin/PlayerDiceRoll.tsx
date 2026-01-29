import React, { useCallback } from "react";
import { Player } from "@owlbear-rodeo/sdk";

import { usePlayerDice } from "./usePlayerDice";
import { DiceRoll } from "../dice/DiceRoll";
import { Dice } from "../dice/Dice";
import { Die } from "../types/Die";
import { usePopoverHover } from "./PopoverHoverContext";

export function PlayerDiceRoll({ player }: { player?: Player }) {
  const {
    diceRoll,
    rollThrows,
    finishedRollTransforms,
    finishedRolling,
    finishedRollValues,
    transformsRef,
  } = usePlayerDice(player);

  const popoverHover = usePopoverHover();

  // Create a hoverable Dice component with access to roll values
  const HoverableDice = useCallback(
    React.forwardRef<THREE.Group, JSX.IntrinsicElements["group"] & { die: Die }>(
      ({ die, ...props }, ref) => {
        const value = finishedRollValues?.[die.id] ?? null;

        const handlePointerEnter = () => {
          if (popoverHover && value !== null) {
            popoverHover.setHoveredDie(die.id, value);
            document.body.style.cursor = "pointer";
          }
        };

        const handlePointerLeave = () => {
          if (popoverHover) {
            popoverHover.setHoveredDie(null, null);
            document.body.style.cursor = "auto";
          }
        };

        return (
          <Dice
            ref={ref}
            die={die}
            onPointerEnter={handlePointerEnter}
            onPointerLeave={handlePointerLeave}
            {...props}
          />
        );
      }
    ),
    [finishedRollValues, popoverHover]
  );

  if (!diceRoll || !rollThrows || !finishedRollTransforms) {
    return null;
  }

  return (
    <DiceRoll
      roll={diceRoll}
      rollThrows={rollThrows}
      finishedTransforms={finishedRolling ? finishedRollTransforms : undefined}
      transformsRef={transformsRef}
      Dice={HoverableDice}
    />
  );
}
