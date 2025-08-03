import { useEffect, useState } from "react";
import Terminal, { TerminalProps } from "../terminal";

// A simple animation frame loop manager that's tied to requestAnimationFrame
// and should always keep frames in lock step with timing updates
class AnimationManager {
  _animation: number | null = null;
  callback: () => void;
  lastFrame = -1;
  frameTime = 1000 / 30; // 30fps

  constructor(callback: () => void, fps = 30) {
    this.callback = callback;
    this.frameTime = 1000 / fps;
  }

  updateFPS(fps: number) {
    this.frameTime = 1000 / fps;
  }

  start() {
    if (this._animation != null) return;
    this._animation = requestAnimationFrame(this.update);
  }

  pause() {
    if (this._animation == null) return;
    this.lastFrame = -1;
    cancelAnimationFrame(this._animation);
    this._animation = null;
  }

  update = (time: number) => {
    const { lastFrame } = this;
    let delta = time - lastFrame;
    if (this.lastFrame === -1) {
      this.lastFrame = time;
    } else {
      while (delta >= this.frameTime) {
        this.callback();
        delta -= this.frameTime;
        this.lastFrame += this.frameTime;
      }
    }
    this._animation = requestAnimationFrame(this.update);
  };
}

const KONAMI_CODE = [
  "arrowup",
  "arrowup",
  "arrowdown",
  "arrowdown",
  "arrowleft",
  "arrowright",
  "arrowleft",
  "arrowright",
  "b",
  "a",
];

export type AnimationFrame = string[];

export type AnimatedTerminalProps = Omit<TerminalProps, "lines"> & {
  frames: AnimationFrame[];
  frameLengthMs: number;
};

export default function AnimatedTerminal({
  className,
  columns,
  rows,
  fontSize,
  title,
  frames,
  whitespacePadding,
  frameLengthMs,
}: AnimatedTerminalProps) {
  const [currentFrame, setCurrentFrame] = useState(16);
  const [animationManager] = useState(
    () =>
      new AnimationManager(() => {
        setCurrentFrame((currentFrame) => (currentFrame + 1) % frames.length);
      }),
  );

  useEffect(() => {
    const reducedMotion =
      window.matchMedia(`(prefers-reduced-motion: reduce)`).matches === true;
    if (reducedMotion) {
      return;
    }

    const handleFocus = () => animationManager.start();
    const handleBlur = () => animationManager.pause();
    const codeInProgress: string[] = [];
    const handleKeyUp = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if (KONAMI_CODE[codeInProgress.length] === key) {
        codeInProgress.push(key);
      } else {
        codeInProgress.length = 0;
      }
      if (codeInProgress.length !== KONAMI_CODE.length) {
        return;
      }
      if (animationManager.frameTime === 1000 / 30) {
        animationManager.updateFPS(240);
      } else {
        animationManager.updateFPS(30);
      }
      codeInProgress.length = 0;
    };
    window.addEventListener("focus", handleFocus);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("keyup", handleKeyUp);

    if (document.visibilityState === "visible") {
      animationManager.start();
    }
    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [animationManager, frames.length]);

  return (
    <Terminal
      className={className}
      columns={columns}
      whitespacePadding={whitespacePadding}
      rows={rows}
      title={title}
      fontSize={fontSize}
      lines={frames[currentFrame]}
      disableScrolling={true}
    />
  );
}
