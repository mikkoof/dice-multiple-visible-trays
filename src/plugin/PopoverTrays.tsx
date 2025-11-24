import OBR, { Player } from "@owlbear-rodeo/sdk";
import { memo, useCallback, useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import { PopoverTray } from "./PopoverTray";
import { getPluginId } from "./getPluginId";
import { usePlayerDice } from "./usePlayerDice";

function MemoizedPopoverTray({
  player,
  onVisibilityChange,
  onPin,
  pinned,
}: {
  player: Player;
  onVisibilityChange: (visibile: boolean) => void;
  onPin: () => void;
  pinned: boolean;
}) {
  const { diceRoll, finalValue, finishedRolling, finishedRollTransforms } =
    usePlayerDice(player);

  const [hideAfter, setHideAfter] = useState<number | null>(null);

  // When a roll finishes, set when it should hide
  useEffect(() => {
    if (diceRoll && !diceRoll.hidden && finishedRolling && !pinned) {
      setHideAfter(Date.now() + 15000);
    }
  }, [diceRoll, finishedRolling, pinned]);

  // Reset hide timer when unpinned while visible
  useEffect(() => {
    if (!pinned && diceRoll && !diceRoll.hidden && finishedRolling) {
      setHideAfter(Date.now() + 15000);
    }
  }, [pinned, diceRoll, finishedRolling]);

  // Show if there's a roll and either: it's pinned, or we haven't reached hide time yet
  const now = Date.now();
  const shown = !!(
    diceRoll &&
    !diceRoll.hidden &&
    finishedRollTransforms &&
    Object.keys(finishedRollTransforms).length > 0 && // Only show when transforms have data
    (pinned || !hideAfter || now < hideAfter)
  );

  useEffect(() => {
    onVisibilityChange(shown);
  }, [shown, onVisibilityChange]);

  return (
    <PopoverTray
      player={player}
      shown={shown}
      onClick={() => {}}
      finalValue={finalValue}
      finishedRolling={finishedRolling}
      finishedRollTransforms={finishedRollTransforms}
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
      // Height = Tray + Name + Bottom
      OBR.popover.setHeight(getPluginId("popover"), 298);
      // Width = (Tray * Number of trays) + (Spacing * (Number of trays - 1)) + (Padding * 2)
      OBR.popover.setWidth(
        getPluginId("popover"),
        250 * visibleCount + 16 * (visibleCount - 1) + 16 * 2
      );
    }
  }, [visibleCount]);

  const handleVisibilityChange = useCallback(
    (connectionId: string, visible: boolean) => {
      setVisibleTrays((v) => {
        const newValue = { ...v, [connectionId]: visible };
        return newValue;
      });
    },
    []
  );

  function handlePin(connectionId: string) {
    setPinnedTrays((pinned) => {
      if (pinned.includes(connectionId)) {
        return pinned.filter((id) => id !== connectionId);
      } else {
        return [...pinned, connectionId];
      }
    });
  }

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
