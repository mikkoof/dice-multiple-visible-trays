import { Environment } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Player } from "@owlbear-rodeo/sdk";

import Box from "@mui/material/Box";
import Slide from "@mui/material/Slide";
import Typography from "@mui/material/Typography";
import { useTheme } from "@mui/material/styles";
import Paper from "@mui/material/Paper";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";

import PushPinIcon from "@mui/icons-material/PushPin";
import PushPinOutlinedIcon from "@mui/icons-material/PushPinOutlined";

import environment from "../environment.hdr";
import { PlayerDiceRoll } from "./PlayerDiceRoll";
import { AudioListenerProvider } from "../audio/AudioListenerProvider";
import { Tray } from "../tray/Tray";
import { TraySuspense } from "../tray/TraySuspense";
import { AnimatedPlayerCamera } from "./AnimatedPlayerCamera";
import { DiceTransform } from "../types/DiceTransform";

export function PopoverTray({
  player,
  shown,
  onClick,
  finalValue,
  finishedRolling,
  finishedRollTransforms,
  onPin,
  pinned,
}: {
  player: Player;
  shown: boolean;
  onClick: () => void;
  finalValue: number | null;
  finishedRolling: boolean;
  finishedRollTransforms?: Record<string, DiceTransform>;
  onPin: () => void;
  pinned: boolean;
}) {
  const theme = useTheme();

  return (
    <Slide in={shown} direction="up" mountOnEnter unmountOnExit>
      <Box component="div" position="relative" sx={{ pointerEvents: "all" }}>
        <Paper
          elevation={8}
          sx={{
            width: "250px",
            height: "282px",
            borderRadius: 2,
            overflow: "hidden",
            backgroundColor:
              theme.palette.mode === "dark"
                ? "rgba(34, 38, 57, 0.8)"
                : "rgba(255, 255, 255, 0.4)",
            position: "relative",
          }}
        >
          <ButtonBase
            onClick={onClick}
            sx={{
              width: "100%",
              height: "100%",
              flexDirection: "column",
            }}
          >
            <Box component="div" height="250px" width="250px">
              <TraySuspense>
                <Canvas frameloop="demand">
                  <AudioListenerProvider volume={0.25}>
                    <Environment files={environment} />
                    <Tray />
                    <PlayerDiceRoll player={player} />
                    <AnimatedPlayerCamera
                      rollTransforms={
                        finishedRolling ? finishedRollTransforms : undefined
                      }
                    />
                  </AudioListenerProvider>
                </Canvas>
              </TraySuspense>
            </Box>
            <Typography
              variant="subtitle1"
              color="text.secondary"
              textAlign="center"
              lineHeight="32px"
              sx={{
                bgcolor: "background.default",
              }}
              noWrap
            >
              {player?.name}
              {finishedRolling && <span> | {finalValue}</span>}
            </Typography>
          </ButtonBase>
          <IconButton
            onClick={onPin}
            sx={{ position: "absolute", top: 0, right: 0 }}
          >
            {pinned ? <PushPinIcon /> : <PushPinOutlinedIcon />}
          </IconButton>
        </Paper>
      </Box>
    </Slide>
  );
}
