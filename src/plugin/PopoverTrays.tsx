import OBR, { Player } from "@owlbear-rodeo/sdk";
import { memo, useCallback, useEffect, useRef, useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import { PopoverTray } from "./PopoverTray";
import { getPluginId } from "./getPluginId";
import { usePlayerDice } from "./usePlayerDice";
import { DiceTransform } from "../types/DiceTransform";

// Layout constants
const TRAY_WIDTH = 250;
const TRAY_HEIGHT = 298;
const TRAY_SPACING = 16;
const CONTAINER_PADDING = 16;
const TRAY_AUTO_HIDE_DELAY = 15000;

interface CachedTrayState {
  finalValue: number | null;
  finishedRollTransforms: Record<string, DiceTransform>;
}

function MemoizedPopoverTray({
  player,
  onVisibilityChange,
  onPin,
  pinned,
}: {
  player: Player;
  onVisibilityChange: (visible: boolean) => void;
  onPin: () => void;
  pinned: boolean;
}) {
  const { diceRoll, finalValue, finishedRolling, finishedRollTransforms } =
    usePlayerDice(player);

  const [hideAfter, setHideAfter] = useState<number | null>(null);
  const [, forceUpdate] = useState(0);

  // Cache the last known good state for pinned trays
  const cachedStateRef = useRef<CachedTrayState | null>(null);

  // Check if we have valid current data
  const hasValidData =
    diceRoll &&
    !diceRoll.hidden &&
    finishedRollTransforms &&
    Object.keys(finishedRollTransforms).length > 0 &&
    finishedRolling;

  // Update cache when we have valid data
  useEffect(() => {
    if (hasValidData && finishedRollTransforms && finalValue !== null) {
      cachedStateRef.current = {
        finalValue,
        finishedRollTransforms,
      };
    }
  }, [hasValidData, finalValue, finishedRollTransforms]);

  // Clear cache when unpinned and tray hides
  useEffect(() => {
    if (!pinned && hideAfter && Date.now() >= hideAfter) {
      cachedStateRef.current = null;
    }
  }, [pinned, hideAfter]);

  // When a roll finishes or is unpinned, set when it should hide
  useEffect(() => {
    if (hasValidData && !pinned) {
      setHideAfter(Date.now() + TRAY_AUTO_HIDE_DELAY);
    }
  }, [hasValidData, pinned]);

  // Set a timer to trigger re-render when the timeout expires
  useEffect(() => {
    if (hideAfter && !pinned) {
      const timeRemaining = hideAfter - Date.now();
      if (timeRemaining > 0) {
        const timer = setTimeout(() => forceUpdate((n) => n + 1), timeRemaining);
        return () => clearTimeout(timer);
      }
    }
  }, [hideAfter, pinned]);

  // Determine what to display - use cache for pinned trays when live data is unavailable
  const displayFinalValue = hasValidData ? finalValue : cachedStateRef.current?.finalValue ?? null;
  const displayTransforms = hasValidData
    ? finishedRollTransforms
    : cachedStateRef.current?.finishedRollTransforms;
  const displayFinishedRolling = hasValidData ? finishedRolling : !!cachedStateRef.current;

  // Show if: we have valid data OR (pinned with cached data), and within time window
  const now = Date.now();
  const hasSomethingToShow = hasValidData || (pinned && cachedStateRef.current);
  const shown = hasSomethingToShow && (pinned || !hideAfter || now < hideAfter);

  useEffect(() => {
    onVisibilityChange(!!shown);
  }, [shown, onVisibilityChange]);

  return (
    <PopoverTray
      player={player}
      shown={!!shown}
      finalValue={displayFinalValue}
      finishedRolling={displayFinishedRolling}
      finishedRollTransforms={displayTransforms}
      onPin={onPin}
      pinned={pinned}
    />
  );
}

const MemoPopoverTray = memo(MemoizedPopoverTray);

export function PopoverTrays() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [visibleTrays, setVisibleTrays] = useState<Record<string, boolean>>({});
  const [pinnedTrays, setPinnedTrays] = useState<string[]>([]);

  useEffect(() => {
    OBR.party.getPlayers().then(setPlayers);
  }, []);
  useEffect(() => OBR.party.onChange(setPlayers), []);

  // Update popover size based on visible trays
  const visibleCount = Object.values(visibleTrays).filter(Boolean).length;

  useEffect(() => {
    if (visibleCount === 0) {
      OBR.popover.setHeight(getPluginId("popover"), 0);
      OBR.popover.setWidth(getPluginId("popover"), 0);
    } else {
      OBR.popover.setHeight(getPluginId("popover"), TRAY_HEIGHT);
      OBR.popover.setWidth(
        getPluginId("popover"),
        TRAY_WIDTH * visibleCount +
          TRAY_SPACING * (visibleCount - 1) +
          CONTAINER_PADDING * 2
      );
    }
  }, [visibleCount]);

  const handleVisibilityChange = useCallback(
    (connectionId: string, visible: boolean) => {
      setVisibleTrays((v) => ({ ...v, [connectionId]: visible }));
    },
    []
  );

  const handlePin = useCallback((connectionId: string) => {
    setPinnedTrays((pinned) =>
      pinned.includes(connectionId)
        ? pinned.filter((id) => id !== connectionId)
        : [...pinned, connectionId]
    );
  }, []);

  return (
    <Box
      component="div"
      position="absolute"
      bottom="0"
      left="0"
      right="0"
      top="0"
      overflow="hidden"
      p={2}
      sx={{ pointerEvents: "none" }}
    >
      <Stack
        direction="row"
        spacing={2}
        justifyContent="flex-end"
        alignItems="flex-end"
        height="100%"
      >
        {players.map((player) => (
          <MemoPopoverTray
            key={player.connectionId}
            player={player}
            onVisibilityChange={(visible) =>
              handleVisibilityChange(player.connectionId, visible)
            }
            onPin={() => handlePin(player.connectionId)}
            pinned={pinnedTrays.includes(player.connectionId)}
          />
        ))}
      </Stack>
    </Box>
  );
}
