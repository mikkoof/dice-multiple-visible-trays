import OBR, { Player } from "@owlbear-rodeo/sdk";
import { memo, useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import { PopoverTray } from "./PopoverTray";
import { getPluginId } from "./getPluginId";
import { usePlayerDice } from "./usePlayerDice";

function MemoizedPopoverTray({
  player,
  onOpen,
  onVisibilityChange,
  onPin,
  pinned,
}: {
  player: Player;
  onOpen: (connectionId: string) => void;
  onVisibilityChange: (visibile: boolean) => void;
  onPin: () => void;
  pinned: boolean;
}) {
  const { diceRoll, finalValue, finishedRolling, finishedRollTransforms } =
    usePlayerDice(player);

  const [timedOut, setTimedOut] = useState(finishedRolling);

  useEffect(() => {
    if (finishedRolling && !pinned) {
      const timeout = setTimeout(() => {
        setTimedOut(true);
      }, 15000);
      return () => {
        clearTimeout(timeout);
      };
    } else {
      setTimedOut(false);
    }
  }, [finishedRolling, pinned]);

  const shown = !!diceRoll && !diceRoll.hidden && !timedOut;

  useEffect(() => {
    onVisibilityChange(shown);
  }, [shown]);

  function handleClick() {
    if (shown) {
      setTimedOut(true);
      onOpen(player.connectionId);
    }
  }

  return (
    <PopoverTray
      player={player}
      shown={shown}
      onClick={handleClick}
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

  function handleTrayOpen(connectionId: string) {
    if (window.BroadcastChannel) {
      OBR.action.open();
      const channel = new BroadcastChannel(getPluginId("focused-tray"));
      channel.postMessage(connectionId);
      channel.close();
    }
  }

  // Hide popover when no trays are visible
  useEffect(() => {
    // Defer sizing to allow all visibility changes to be batched
    const timeout = setTimeout(() => {
      const visibleCount = Object.values(visibleTrays).filter(Boolean).length;
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
    }, 50);

    return () => clearTimeout(timeout);
  }, [visibleTrays]);

  function handleVisibilityChange(connectionId: string, visible: boolean) {
    setVisibleTrays((v) => ({ ...v, [connectionId]: visible }));
  }

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
            onOpen={handleTrayOpen}
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
