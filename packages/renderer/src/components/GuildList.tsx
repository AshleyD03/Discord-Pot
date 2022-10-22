import { FC, useEffect, useState } from "react";
import { Box } from "./Box";
import styles from "@/styles/guild_list.module.scss";
import { ReactJSXElement } from "@emotion/react/types/jsx-namespace";
import { OAuth2Guild, Collection, GuildMember } from "discord.js";
import { IconButton } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import PeopleIcon from "@mui/icons-material/People";
import LibraryMusicIcon from "@mui/icons-material/LibraryMusic";
import { GuildInfo } from "packages/UpdatedIpc";
import { GuildMusic } from "./GuildMusic";
import SmartToyIcon from '@mui/icons-material/SmartToy';
import Tooltip from '@mui/material/Tooltip';
import { GuildMembers } from "./GuildMembers";

interface Props {
  guilds: Collection<string, OAuth2Guild>;
}
type Option = "members" | "music";
export const GuildList: FC<Props> = ({ guilds }) => {
  
  // Selected guild
  const [guild, setGuild] = useState<OAuth2Guild | undefined>();
  // Info on all guilds that has been fetched
  const [guildsInfo, setGuildsInfo] = useState<{ [key: string]: GuildInfo }>({});

  /**
   * When the selected guild changes, fetch the info on that guild and add to storage
   */
  useEffect(() => {
    if (!guild) return;

    window.ipcRenderer.invoke("guild-info", guild.id).then((info) => {
      if (!info) return console.log("couldn't get guild info");
      setGuildsInfo({
        ...guildsInfo,
        [info.id]: info,
      });
    });

  }, [guild]);

  // Info on current guild (if fetched / selected)
  const info = guildsInfo[guild?.id || ""];

  type panel = "music" | "members" | "pilot"
  const [panels, setPanels] = useState<{ [key: string]: boolean }>({});
  const pannelToggle = (name: panel, setStatus?: boolean) => {
    let newStatus = false;
    if (setStatus) newStatus = setStatus;
    else newStatus = !panels[name]
    console.log(panels)
    setPanels({
      ...panels,
      [name]: newStatus
    })
  }
  const pannelStatus = (name: panel) => !!panels[name]

  return (
    <>
      <Box className={styles["guild-list"]}>
        <h2>Servers</h2>

        <div className={styles["icon-list"]}>
          {(() => {
            /**
             * For each guild, generate a button to let you select that guild.
             */
            let items: ReactJSXElement[] = [];
            const selectedGuild = guild;
            guilds.forEach((guild) => {
              items.push(
                <span
                  className={styles["icon-option"]}
                  key={guild.id}
                  style={{
                    backgroundImage: `url("https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.webp")`,
                    boxShadow: `${
                      selectedGuild && guild.id === selectedGuild.id
                        ? "0px 0px 0px 4px rgba(59, 165, 93, 1)"
                        : ""
                    }`,
                  }}
                  onClick={() => {
                    setGuild(guild);
                  }}
                >
                  <div>
                    {
                      /**
                       * If the guild has no icon image, make letter image using first letter of each word in the guilds name.
                       */
                      guild.icon ? (
                        <br />
                      ) : (
                        guild.name
                          .split(" ")
                          .map((word) => word[0] || "")
                          .join("")
                      )
                    }
                  </div>
                </span>
              );
            });
            if (guild) items.push();
            return <>{items}</>;
          })()}
        </div>

        {guild ? (
          <div className={styles["guild-info"]}>
            <span className={styles.line} />
            <h3>
              {guild.name}
              <IconButton
                aria-label="close"
                onClick={() => {
                  setGuild(undefined)
                  setPanels({})
                }}
                color="error"
              >
                <CloseIcon />
              </IconButton>
            </h3>


            <div className={styles["guild-options"]}>
              <Tooltip title="members" arrow>
                <IconButton
                  aria-label="members"
                  size="large"
                  color={pannelStatus("members") ? "success" : "primary"}
                  onClick={() => pannelToggle("members")}
                >
                  <PeopleIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>

              <Tooltip title="music" arrow>
                <IconButton
                  aria-label="music"
                  size="large"
                  color={pannelStatus("music") ? "success" : "primary"}
                  onClick={() => pannelToggle("music")}
                >
                  <LibraryMusicIcon fontSize="inherit" />
                </IconButton>
              </Tooltip>

              <Tooltip title="pilot" arrow>
                <IconButton
                  aria-label="pilot"
                  size="large"
                  color={pannelStatus("pilot") ? "success" : "primary"}
                  onClick={() => pannelToggle("pilot")}
                >
                  <SmartToyIcon/>
                </IconButton>
              </Tooltip>
            </div>
          </div>
        ) : (
          ""
        )}
      </Box>
      {pannelStatus("members") ? <GuildMembers guild={info}/> : ""}
      {pannelStatus("music") ? <GuildMusic guild={info} onClose={() => pannelToggle("music", false)}/> : ""}
      {pannelStatus("pilot") ? <Box> Pilot </Box> : ""}
    </>
  );
};
