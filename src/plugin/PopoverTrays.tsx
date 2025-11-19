import OBR, { Player } from "@owlbear-rodeo/sdk";
import { useEffect, useState } from "react";

import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";

import { PopoverTray } from "./PopoverTray";
import { getPluginId } from "./getPluginId";

export function PopoverTrays() {
  const [players, setPlayers] = useState<Player[]>([]);

  useEffect(() => {
    OBR.party.getPlayers().then(setPlayers);
  }, []);
  useEffect(() => OBR.party.onChange(setPlayers), []);

  const [visibleTrays, setVisibleTrays] = useState<string[]>([]);

  useEffect(() => {
    const playerIds = players.map((p) => p.connectionId);
    setVisibleTrays((visible) =>
      visible.filter((id) => playerIds.includes(id))
    );
  }, [players]);

  function handleTrayToggle(connectionId: string, shown: boolean) {
    if (shown) {
      setVisibleTrays((visible) =>
        visible.includes(connectionId) ? visible : [...visible, connectionId]
      );
    } else {
      setVisibleTrays((visible) => visible.filter((id) => id !== connectionId));
    }
  }

  function handleTrayOpen(connectionId: string) {
    if (window.BroadcastChannel) {
      OBR.action.open();
      const channel = new BroadcastChannel(getPluginId("focused-tray"));
      channel.postMessage(connectionId);
      channel.close();
    }
  }

  // Hide popover when no trays are visible
  const hidden = visibleTrays.length === 0;
  useEffect(() => {
    if (hidden) {
      OBR.popover.setHeight(getPluginId("popover"), 0);
      OBR.popover.setWidth(getPluginId("popover"), 0);
    } else {
      // Height = Tray + Name + Bottom
      OBR.popover.setHeight(getPluginId("popover"), 298);
      // Width = (Tray * Number of trays) + (Spacing * (Number of trays - 1)) + (Padding * 2)
      OBR.popover.setWidth(
        getPluginId("popover"),
        250 * visibleTrays.length + 16 * (visibleTrays.length - 1) + 16 * 2
      );
    }
  }, [hidden, visibleTrays.length]);

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
          <PopoverTray
            key={player.connectionId}
            player={player}
            onToggle={handleTrayToggle}
            onOpen={handleTrayOpen}
          />
        ))}
      </Stack>
    </Box>
  );
}
