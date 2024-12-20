import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import CodeBlock from "../codeblock";
import JumplinkHeader from "../jumplink-header";
import { LI, BodyParagraph } from "../text";
import s from "./CustomMDX.module.css";
import Blockquote from "../blockquote";
import Callout, { Note, Tip, Important, Warning, Caution } from "../callout";
import CardLinks from "../card-links";
import VTSequence from "../vt-sequence";
import ButtonLinks from "../button-links";
import HashLink from "../hashlink";

interface CustomMDXProps {
  content: MDXRemoteSerializeResult;
}

export default function CustomMDX({ content }: CustomMDXProps) {
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
          li: LI,
          a: HashLink as any,
          p: BodyParagraph,
          pre: CodeBlock,
          blockquote: Blockquote,
          img: (props) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img className={s.image} src={props.src} alt={props.alt} />
          ),
          VTSequence,
          CardLinks,
          ButtonLinks,
          /* Callout Variants */
          Callout,
          Note,
          Tip,
          Important,
          Warning,
          Caution,
        }}
      />
    </div>
  );
}
