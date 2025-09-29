import classNames from "classnames";
import { jetbrainsMono } from "../text";
import s from "./CodeBlock.module.css";
import { useCallback, useState } from "react";
import { CheckIcon, CopyIcon } from "lucide-react";

interface CodeblockProps {
  children?: React.ReactNode;
  className?: string;
}

export default function CodeBlock({ children, className }: CodeblockProps) {
  return (
    <pre
      className={classNames(s.codeBlock, jetbrainsMono.className, className)}
    >
      {children}
      <CopyButton />
    </pre>
  );
}

function CopyButton() {
  const [isCopied, setIsCopied] = useState(false);

  const copyToClipboard = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      await navigator.clipboard.writeText(
        e.currentTarget.parentNode?.textContent ?? "",
      );
      setIsCopied(true);
      const timeout = setTimeout(() => setIsCopied(false), 1000);
      return () => clearTimeout(timeout);
    },
    [],
  );

  return (
    <button
      className={classNames(s.copyButton, isCopied && s.copyButtonSuccess)}
      type="button"
      aria-label={isCopied ? "Copied!" : "Copy to clipboard"}
      onClick={copyToClipboard}
    >
      {isCopied ? <CheckIcon size={20} /> : <CopyIcon size={20} />}
    </button>
  );
}
