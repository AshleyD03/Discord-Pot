import { FC, useEffect, useRef, LegacyRef } from "react";
import styles from "@/styles/box.module.scss";

interface Props {
  children?: JSX.Element | string | Array<JSX.Element | string>;
  className?: string;
}
export const Box: FC<Props> = ({
  children = "",
  className
}) => {
  const containerRef: LegacyRef<HTMLDivElement> | null = useRef(null);
  const boxRef: LegacyRef<HTMLDivElement> | null = useRef(null);

  const handleHeightChange = () => {
    if (!containerRef.current || !boxRef.current) return;
    const container = containerRef.current.clientHeight + 0;
    const box = boxRef.current.clientHeight + 0;
    const style = parseInt(containerRef.current.style.height);
    const minStyle =  parseInt(containerRef.current.style.minHeight);

    if (container !== box) {
      containerRef.current.style.height = `${box}px`;

      /**
       * If the transition is beginning or ending, change the minHeight
       */
      if (style === box || style === container || box < minStyle) {
        containerRef.current.style.minHeight = `${Math.min(container, box)}px`;
      }
    }
    if (container === box) {
      containerRef.current.style.minHeight = `${Math.min(container, box)}px`;
    }
  };

  /**
   * Have box grow when it first spawns.
   */
  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.style.transform = "scale(1)";

    window.addEventListener("resize", handleHeightChange);
    return () => {
      window.removeEventListener("resize", handleHeightChange)
    };
  }, []);

  /**
   * Listen for children hooks to trigger, then check if the height of the elements has changed.
   */
  useEffect(handleHeightChange);

  return (
    <div className={`${styles["box-container"]}`} ref={containerRef}>
      <div className={`${styles.box} ${className}`} ref={boxRef}>
        {children}
      </div>
    </div>
  );
};
