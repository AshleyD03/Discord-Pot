import styles from "@/styles/app.module.scss";
import { useEffect, useState } from "react";
import { Frame } from "./components/Frame";
import { Register } from "./components/Register";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { IpcRendererEvent } from "electron/renderer";
import { Profile } from "./components/Profile";
import { GuildList } from "./components/GuildList";
import { OAuth2Guild, Collection } from "discord.js";
import { GuildInfo } from "packages/UpdatedIpc";

/**
 * Set the Theme for the MUI components to dark
 */
const darkTheme = createTheme({
  palette: {
    mode: "dark",
    secondary: {
      main: "#808080"
    }
  },
});

/**
 * The Application Component.
 * This will change the components on show, reacting to event listeners with {@link ipcRenderer}.
 * @returns
 */
const App = () => {
  const [botInfo, setBotInfo] = useState<BotInfo | undefined>();
  const [guilds, setGuilds] = useState<Collection<string, OAuth2Guild> | undefined>()
  const [loggedIn, setLoggedIn] = useState<boolean>(false);

  useEffect(() => {
    /**
     * On Initialisation add state listeners.
     */
    const updateInfo = (count: number) => {
      window.ipcRenderer.invoke("bot-info").then((info) => {
        console.log(info);
        if (count > 3) return
        if (info) setBotInfo(info);
        else updateInfo(count + 1);
      });
    };
    const updateGuilds = (count: number) => {
      window.ipcRenderer.invoke("guilds-info").then((guilds) => {
        console.log(guilds)
        if (count > 3) return
        if (guilds) setGuilds(guilds)
        else updateGuilds(count + 1)
      })
    }

    const handleLoginChange = (event: IpcRendererEvent, result: boolean) => {
      console.log(`APP: login ${result}`);
      if (result && result === true) {
        console.log(result);
        updateInfo(0);
        updateGuilds(0);
      }
      setLoggedIn(result);
    };
    window.ipcRenderer.on("bot-login-change", handleLoginChange);

    /**
     * On tear down remove listeners.
     */
    return () => {
      window.ipcRenderer.removeListener("bot-login-change", handleLoginChange);
    };
  }, []);

  const deleteBot = () => {
    setBotInfo(undefined)
    window.ipcRenderer.invoke("bot-logout")
  }

  return (
    <ThemeProvider theme={darkTheme}>
      <Frame>
        {!botInfo ? (
          <Register />
        ) : (
          <>
            <Profile botInfo={botInfo} loggedIn={loggedIn} deleteBot={deleteBot}/>

            {(guilds && loggedIn) ? <GuildList guilds={guilds}/> : ''}
          </>
        )}
      </Frame>
    </ThemeProvider>
  );
};

export default App;
