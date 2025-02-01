"use client";
import Button from "@/components/button";
import Image from "next/image";
import s from "./Modal.module.css";
import { H3, H5, P } from "@/components/text";
import { useState } from "react";
import CodeBlock from "@/components/codeblock";
import { CircleX } from "lucide-react";
import { ShowcaseContent } from "@/types/showcase";

interface ModalProps {
  onClose: () => void;
  content: ShowcaseContent;
}

export default function Modal({ onClose, content }: ModalProps) {
  const [viewMode, setViewMode] = useState<"detail" | "config">("detail");
  const { code, title, description, author, images } = content;

  return (
    <section className={s.modal}>
      <dialog className={s.dialog} open>
        <div className={s.closeContainer}>
          <button className={s.closeButton} onClick={onClose}>
            <CircleX color="white" />
          </button>
        </div>
        <Image
          src={images[0].src}
          alt={images[0].alt}
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
              title={title}
              author={author}
              description={description}
            />
          ) : (
            <CodeBlock className={s.codeBlock}>{code}</CodeBlock>
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
