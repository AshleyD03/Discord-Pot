import { FC } from "react";
import styles from "@/styles/frame.module.scss";
import CloseSharpIcon from "@mui/icons-material/CloseSharp";
import CropSquareSharpIcon from "@mui/icons-material/CropSquareSharp";
import MinimizeSharpIcon from "@mui/icons-material/MinimizeSharp";

interface Props {
  children?: JSX.Element | string | Array<JSX.Element | string>;
}
export const Frame: FC<Props> = ({ children }) => {

  /**
   * Very weird block of code to convert children into an array or just be JSX.
   * TODO: Make this cleaner.
   */
  if (!children) children = [];
  if (typeof children === "string") children = [children];
  if (!Array.isArray(children)) {
    const props = children.props;
    if (props.children && Array.isArray(props.children))
      children = props.children || [children];
    else children = [children];
  }
  if (typeof children === "string") children = [children];
  if (!children) children = [];

  let i = 0;
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div
          className={styles.button}
          onClick={() => window.ipcRenderer.invoke("window-change", "minimize")}
        >
          <MinimizeSharpIcon />
        </div>
        <div
          className={styles.button}
          onClick={() => window.ipcRenderer.invoke("window-change", "maximize")}
        >
          <CropSquareSharpIcon />
        </div>
        <div
          className={styles.button}
          onClick={() => window.ipcRenderer.invoke("window-change", "close")}
        >
          <CloseSharpIcon />
        </div>
      </div>
      <div className={styles.screen}>
        {Array.isArray(children) ? (
          children.map((child) => (
            <span className={styles["scroll-snap"]} key={i++}>
              {child}
            </span>
          ))
        ) : (
          <span className={styles["scroll-snap"]} key={i++}>
            {children}
          </span>
        )}
        <span className={styles.filler} />
      </div>
    </div>
  );
};
