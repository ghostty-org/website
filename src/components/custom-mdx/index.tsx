import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { useEffect, ReactElement } from "react";
import Blockquote from "../blockquote";
import ButtonLinks from "../button-links";
import Callout, { Caution, Important, Note, Tip, Warning } from "../callout";
import CardLinks from "../card-links";
import CodeBlock from "../codeblock";
import GitHub from "../github";
import { processGitHubLinks } from "../github/mdx";
import JumplinkHeader from "../jumplink-header";
import Mermaid from "../mermaid";
import { BodyParagraph, LI } from "../text";
import VTSequence from "../vt-sequence";
import Video from "../video";
import s from "./CustomMDX.module.css";
import { useStore } from "@/lib/use-store";

interface CustomMDXProps {
  content: MDXRemoteSerializeResult;
}

function isReactElement(children: any): children is ReactElement {
  return children && typeof children === "object" && "props" in children;
}

export default function CustomMDX({ content }: CustomMDXProps) {
  const resetHeaderIdsInView = useStore((state) => state.resetHeaderIdsInView);

  useEffect(() => {
    // When we do a client-side navigation to another page
    // the content will change & we will need to do a reset.
    resetHeaderIdsInView();
  }, [content]);

  return (
    <div className={s.customMDX}>
      <MDXRemote
        {...content}
        components={{
          h1: (props) => JumplinkHeader({ ...props, as: "h1" }),
          h2: (props) => JumplinkHeader({ ...props, as: "h2" }),
          h3: (props) => JumplinkHeader({ ...props, as: "h3" }),
          h4: (props) => JumplinkHeader({ ...props, as: "h4" }),
          h5: (props) => JumplinkHeader({ ...props, as: "h5" }),
          h6: (props) => JumplinkHeader({ ...props, as: "h6" }),
          li: (props) => {
            const processedChildren = processGitHubLinks(props.children);
            return <LI {...props}>{processedChildren}</LI>;
          },
          p: (props) => {
            const processedChildren = processGitHubLinks(props.children);
            return <BodyParagraph {...props}>{processedChildren}</BodyParagraph>;
          },
          code: (props) => {
            if (!props.className) {
              return <code {...props} />;
            }
            const language = props.className?.replace("language-", "");
            if (language === "mermaid") {
              return (
                <Mermaid
                  chart={props.children as string}
                  className="mdx-mermaid"
                />
              );
            }
            return <code {...props} />;
          },
          pre: (props) => {
            const { children, ...rest } = props;
            if (isReactElement(children)) {
              const className = children.props?.className;
              if (
                className === "language-mermaid" ||
                (typeof className === "string" &&
                  className.includes("language-mermaid"))
              ) {
                return (
                  <Mermaid
                    chart={children.props.children}
                    className="mdx-mermaid"
                  />
                );
              }
            }
            return <CodeBlock {...props} />;
          },
          blockquote: Blockquote,
          img: (props) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={s.image} src={props.src} alt={props.alt} />
          ),
          VTSequence,
          CardLinks,
          ButtonLinks,
          GitHub,
          Video,
          /* Callout Variants */
          Callout,
          Note,
          Tip,
          Important,
          Warning,
          Caution,
          "callout-title": () => null,
          Mermaid: (props: {
            chart: string;
            id?: string;
            className?: string;
          }) => <Mermaid {...props} />,
        }}
      />
    </div>
  );
}
