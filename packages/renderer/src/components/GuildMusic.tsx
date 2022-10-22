
import styles from "@/styles/guild_music.module.scss";
import { Box } from "./Box";
import { FC, useEffect, useRef, useState } from "react";
import { IpcRendererEvent } from "electron/renderer";
import { GuildInfo, PlayerChangeEvent, PlayerInfo } from "packages/UpdatedIpc";
import { Button, IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";

interface Props {
  guild: GuildInfo,
  onClose: () => void
}
export const GuildMusic: FC<Props> = ({ guild, onClose }) => {


  /**
   * The player represents the player session taking place at the current {@link guild}.
   */
  const [player, setPlayer] = useState<PlayerInfo | undefined>();
  const updatePlayer = () => {
    window.ipcRenderer.invoke("player-info", guild.id).then((info) => setPlayer(info))
  }

  /**
   * Handler for ipc "player-change".
   * Check if the change is coming from the current guild being viewed.
   * If it is, update the player.
   */
  const changeHandler = (event: IpcRendererEvent, result: PlayerChangeEvent) => {
    if (result.id !== guild.id) return
    updatePlayer()
  }

  /**
   * Attach a listener to ipcRenderer for "player-change", to listen for updates at this guild session.
   */
  useEffect(() => {
    window.ipcRenderer.removeAllListeners("player-change")
    window.ipcRenderer.on("player-change", changeHandler)
    return () => {
      window.ipcRenderer.removeAllListeners("player-change")
    }
  }, [])

  /**
  * When the guild changes, update the player to view that guild's session.
  * Also update the "player-change" listener for the new {@link changeHandler} with new
  * {@link guild} value.
  */
  useEffect(() => {
    if (!guild) return setPlayer(undefined)
    updatePlayer()
    window.ipcRenderer.removeAllListeners("player-change")
    window.ipcRenderer.on("player-change", changeHandler)
  }, [guild])


  return <Box>
    <h1 className={styles.header}> Music Controls
      <div style={{marginLeft: "auto"}}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          color="error"
        >
          <CloseIcon />
        </IconButton>
      </div>
    </h1>
    <h3>
      Channel:
    </h3>
  </Box>
}