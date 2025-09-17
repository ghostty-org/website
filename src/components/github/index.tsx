import { Github } from "lucide-react";
import Link from "../link";
import s from "./GitHub.module.css";

interface GitHubProps {
  number: number;
}

export default function GitHub({
  number,
}: GitHubProps) {
  return (
    <Link 
      href={`https://github.com/ghostty-org/ghostty/issues/${number}`} 
      text={`#${number}`} 
      showExternalIcon={false}
      className={s.github}
    />
  );
}
