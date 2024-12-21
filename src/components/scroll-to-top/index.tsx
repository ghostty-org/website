import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import s from "./ScrollToTop.module.css";

export default function ScrollToTopButton() {
  const [showScrollToTopButton, setShowScrollToTopButton] = useState(false);
  const setScrollToTopButtonRef = useRef<HTMLButtonElement>(
    null
  );
  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;

      // Show button when scrolled down more than 100px AND not at bottom
      const isNotAtBottom = documentHeight - (scrollTop + windowHeight) > 50;
      if (scrollTop > 100 && isNotAtBottom) {
        setShowScrollToTopButton(true);
      } else {
        setShowScrollToTopButton(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    showScrollToTopButton &&
    <button
      ref={setScrollToTopButtonRef}
      className={s.scrollToTopButton}
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <ArrowUp size={16} />
    </button>
  );
};
