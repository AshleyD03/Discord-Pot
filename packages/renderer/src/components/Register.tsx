import { FC, useEffect, useRef, useState } from "react";
import store from "../util/electron-store";
import { Box } from "./Box";
import LoadingButton from "@mui/lab/LoadingButton";
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  TextField,
  InputLabel,
  OutlinedInput,
  InputAdornment,
  IconButton
} from "@mui/material";
import styles from "@/styles/register.module.scss";
import { Visibility, VisibilityOff } from "@mui/icons-material";

export const Register: FC = () => {
  const [id, setId] = useState("");
  const [save, setSave] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showId, setShowId] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    store.get("bot-token").then((stored) => {
      if (typeof stored === "string") {
        console.log(stored);
        setId(stored);
        setSave(true);
      } else {
        setSave(false);
      }
    });
  }, []);

  return (
    <Box className={styles["login-box"]}>
      <h2>Register your Bot</h2>

      <p className={styles.description}>
        To run your bot, first go over to the&nbsp;
        <a
          href="https://discord.com/developers"
          onClick={(e) => {
            e.preventDefault();
            window.open("https://discord.com/developers");
          }}
        >
          Discord Developer Portal
        </a>{" "}
        to set-up your bot.Then generate a new secret-token to paste down here
        to get your bot online.
      </p>
      <form
        className={styles.form}
        onSubmit={(e) => {
          e.preventDefault();
          setLoading(true);
          const result = window.ipcRenderer.invoke("bot-login", id);

          result.then((result) => {
            console.log(`LOGIN: result "${result}"`);
            setLoading(false);
            if (!result) return setErrorMessage("ERROR: Your token is invalid");
            if (save) {
              store.set("bot-token", id);
            } else {
              store.set("bot-token", null);
            }
          });
        }}
      >
        <FormControl sx={{ marginBottom: "1em",width: '420px' }} variant="outlined">
          <InputLabel htmlFor="outlined-register-token">Token</InputLabel>
          <OutlinedInput
            id="outlined-register-token"
            type={showId ? 'text' : 'password'}
            value={id}
            onChange={(e) => {
              setId(e.target.value);
              if (errorMessage !== "") setErrorMessage("");
            }}
            endAdornment={
              <InputAdornment position="end">
                <IconButton 
                  aria-label="toggle token visibility"
                  onClick={() => setShowId(!showId)}
                  onMouseDown={() => setShowId(!showId)}
                  edge="end"
                >
                  {showId ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            }
            label="Password"
          />
        </FormControl>
        <div className={styles["bottom-line"]}>
          <FormGroup>
            <FormControlLabel
              style={{ marginLeft: ".5em" }}
              labelPlacement="start"
              control={
                <Checkbox
                  aria-label="Remember token"
                  style={{ marginLeft: ".5em" }}
                  checked={save}
                  onChange={(e) => setSave(e.target.checked)}
                />
              }
              label="Remember token"
            />
          </FormGroup>
          <LoadingButton
            type="submit"
            size="large"
            disabled={loading}
            loading={loading}
          >
            Submit
          </LoadingButton>
        </div>
      </form>
      <p className={styles["error-message"]}>{errorMessage}</p>
    </Box>
  );
};
