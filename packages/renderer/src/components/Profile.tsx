import { FC, useEffect, useState } from "react";
import { Box } from "./Box";
import styles from "@/styles/profile.module.scss";
import { LoadingButton } from "@mui/lab";

interface Props {
  botInfo: BotInfo;
  loggedIn: boolean;
  deleteBot: () => void;
}
export const Profile: FC<Props> = ({ botInfo, loggedIn, deleteBot }) => {
  /**
   * The status of the login / logout buttons.
   * If true: active
   * If false: in-active
   * If null: loading
   */
  const [loginStatus, setLoginStatus] = useState<boolean | null>(!loggedIn);
  const [logoutStatus, setlogoutStatus] = useState<boolean | null>(loggedIn);

  /**
   * Loading button states
   */
  const [linkLoading, setLinkLoading] = useState<boolean | null>();

  useEffect(() => {
    setLoginStatus(!loggedIn)
    setlogoutStatus(loggedIn)
  }, [loggedIn])

  return (
    <Box className={styles["login-box"]}>
      <span className={styles["pfp-container"]}>
        <span
          className={styles.pfp}
          style={{
            backgroundImage: `url(${botInfo.iconURL})`,
          }}
        />
        <span
          className={styles["pfp-status"]}
          style={{
            backgroundColor: `${loggedIn ? "#3BA55D" : "grey"}`,
          }}
        />
      </span>
      <span className={styles["controls-container"]}>
        <h2>
          {botInfo.user.username}
          <span>{`#${botInfo.user.discriminator}`}</span>
        </h2>
        <div>
          <LoadingButton
            color="success"
            disabled={loginStatus !== true}
            loading={loginStatus === null}
            onClick={(_) => {
              setLoginStatus(null);
              window.ipcRenderer.invoke("bot-login").then(status => {
                if (!status) setLoginStatus(true);
              });
            }}
          >
            Login
          </LoadingButton>
          <LoadingButton
            color="warning"
            disabled={logoutStatus !== true}
            loading={logoutStatus === null}
            onClick={(_) => {
              setlogoutStatus(null);
              window.ipcRenderer.invoke("bot-logout").then(status => {
                if (!status) setLoginStatus(true)
              });
            }}
          >
            Log out
          </LoadingButton>
          <LoadingButton
            color={(linkLoading === false) ? 'success' : undefined}
            disabled={linkLoading || false}
            loading={linkLoading || false}
            onClick={(e) => {
              const link = `https://discord.com/api/oauth2/authorize?client_id=${botInfo.user.id}&permissions=274881136704&scope=applications.commands%20bot`
              window.clipboard.writeText(link);
              setLinkLoading(true)
              setTimeout(() => setLinkLoading(false), 250)
            }}
          >
            {(linkLoading === false) ? "link copied" : "Invite Link"}          
          </LoadingButton>
          <LoadingButton
            color="error"
            onClick={deleteBot}
          >
            delete bot
          </LoadingButton>
        </div>
      </span>
    </Box>
  );
};
