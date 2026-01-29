import { useRef } from "react";
import { DiceTransform } from "../types/DiceTransform";
import { DiceRoll } from "./DiceRoll";
import { InteractiveDice } from "./InteractiveDice";
import { useDiceRollStore } from "./store";

/** Dice roll based off of the values from the dice roll store */
export function InteractiveDiceRoll() {
  const roll = useDiceRollStore((state) => state.roll);
  const rollThrows = useDiceRollStore((state) => state.rollThrows);
  const finishDieRoll = useDiceRollStore((state) => state.finishDieRoll);

  const finishedTransforms = useDiceRollStore((state) => {
    const values = Object.values(state.rollTransforms);
    if (values.some((v) => v === null)) {
      return undefined;
    }
    return state.rollTransforms as Record<string, DiceTransform>;
  });

  const rollTransforms = useDiceRollStore((state) => state.rollTransforms);
  const transformsRef = useRef<Record<string, DiceTransform | null>>(
    rollTransforms
  );
  // Keep ref in sync with state
  transformsRef.current = rollTransforms;

  // DEBUG
  console.log("InteractiveDiceRoll render:", {
    hasRoll: !!roll,
    rollDiceCount: roll?.dice?.length,
    finishedTransforms: finishedTransforms ? Object.keys(finishedTransforms).length : "undefined",
    rollTransformsKeys: Object.keys(rollTransforms),
    rollThrowsKeys: Object.keys(rollThrows),
  });

  if (!roll) {
    return null;
  }

  return (
    <DiceRoll
      roll={roll}
      rollThrows={rollThrows}
      finishedTransforms={finishedTransforms}
      onRollFinished={finishDieRoll}
      Dice={InteractiveDice}
      transformsRef={transformsRef}
    />
  );
}
