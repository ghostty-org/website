"use client";
import Button from "@/components/button";
import Image from "next/image";
import s from "./Modal.module.css";
import { H3, H5, P } from "@/components/text";
import { useState } from "react";
import CodeBlock from "@/components/codeblock";
import { CircleX } from "lucide-react";

interface ModalProps {
  onClose: () => void;
}

const code = `
###------------------------------------
##   Window
#--------------------------------------
title = Ghostty
background-opacity = 0.6
background-blur-radius = 8
window-padding-x = 8
window-padding-y = 8
window-theme = dark
# Remove when TMUX proficient  
# window-decoration = false
window-padding-color = extend

###------------------------------------
##   Font
#--------------------------------------
font-family = Berkeley Mono
font-style = Regular
font-size = 16

font-family-bold = Berkeley Mono
font-family-italic = Berkeley Mono
`;

export default function Modal({ onClose }: ModalProps) {
  const [viewMode, setViewMode] = useState<"detail" | "config">("detail");

  return (
    <section className={s.modal}>
      <dialog className={s.dialog} open>
        <button className={s.closeButton} onClick={onClose}>
          <CircleX />
        </button>
        <Image
          src="/placeholder.png"
          alt="placeholder image"
          width={700}
          height={500}
        />
        <section className={s.content}>
          <div className={s.buttonContainer}>
            <Button theme="brand" onClick={() => setViewMode("detail")}>
              Detail
            </Button>
            <Button theme="brand" onClick={() => setViewMode("config")}>
              Config
            </Button>
          </div>
          {viewMode === "detail" ? (
            <DetailContent
              title="Ghostty config"
              author="Liam Canetti"
              description="This is my ghostty config, there are many like it but this is my
            own."
            />
          ) : (
            <CodeBlock>{code}</CodeBlock>
          )}
        </section>
      </dialog>
    </section>
  );
}

interface DetailContentProps {
  title: string;
  author: string;
  description: string;
}

function DetailContent({ title, author, description }: DetailContentProps) {
  return (
    <>
      <H3 className={s.title}>{title}</H3>
      <H5 className={s.author}>{author}</H5>
      <P>{description}</P>
    </>
  );
}
