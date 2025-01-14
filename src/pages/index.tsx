import AnimatedTerminal from "@/components/animated-terminal";
import GridContainer from "@/components/grid-container";
import { ButtonLink } from "@/components/link";
import { TerminalFontSize } from "@/components/terminal";
import RootLayout from "@/layouts/root-layout";
import {
  loadAllTerminalFiles,
  TerminalsMap,
} from "@/lib/fetch-terminal-content";
import { useEffect, useState } from "react";
import s from "./Home.module.css";
import { P } from "@/components/text";

export async function getStaticProps() {
  return {
    props: {
      terminalData: await loadAllTerminalFiles("/home"),
    },
  };
}

interface HomePageProps {
  terminalData: TerminalsMap;
}

function useWindowSize() {
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  useEffect(() => {
    function updateSize() {
      setWidth(window.innerWidth);
      setHeight(window.innerHeight);
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);
  return [width, height];
}

export default function Home({ terminalData }: HomePageProps) {
  const animationFrames = Object.keys(terminalData)
    .filter((k) => {
      return k.startsWith("home/animation_frames");
    })
    .map((k) => terminalData[k]);

  // Calculate what font size we should use based off of
  // Width & Height considerations. We will pick the smaller
  // of the two values.
  const [windowWidth, windowHeight] = useWindowSize();
  const widthSize =
    windowWidth > 1100 ? "small" : windowWidth > 674 ? "tiny" : "xtiny";
  const heightSize =
    windowHeight > 900 ? "small" : windowHeight > 750 ? "tiny" : "xtiny";
  var fontSize: TerminalFontSize = "small";
  const sizePriority = ["xtiny", "tiny", "small"];
  for (const size of sizePriority) {
    if (widthSize === size || heightSize === size) {
      fontSize = size;
      break;
    }
  }

  return (
    <RootLayout
      meta={{
        title: "Ghostty",
        description:
          "Ghostty is a fast, feature-rich, and cross-platform terminal emulator that uses platform-native UI and GPU acceleration.",
      }}
    >
      <main className={s.homePage}>
        {/* Don't render the content until the window width has been
          calculated, else there will be a flash from the smallest size
          of the terminal to the true calculated size */}
        {windowWidth > 0 && (
          <>
            <section className={s.terminalWrapper} aria-hidden={true}>
              <AnimatedTerminal
                title={"👻 Ghostty"}
                fontSize={fontSize}
                whitespacePadding={
                  windowWidth > 950 ? 20 : windowWidth > 850 ? 10 : 0
                }
                className={s.animatedTerminal}
                columns={100}
                rows={41}
                frames={animationFrames}
                frameLengthMs={31}
              />
            </section>

            <GridContainer>
              <P weight="regular" className={s.tagline}>
                Ghostty is a fast, feature-rich, and cross-platform terminal
                emulator that uses platform-native UI and GPU acceleration.
              </P>
            </GridContainer>

            <GridContainer className={s.buttonsList}>
              <ButtonLink href="/download" text="Download" size="large" />
              <ButtonLink
                href="/docs"
                text="Documentation"
                size="large"
                theme="neutral"
              />
            </GridContainer>
          </>
        )}
      </main>
    </RootLayout>
  );
}
