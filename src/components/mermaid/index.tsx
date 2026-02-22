"use client";
import { useEffect, useRef, useState } from "react";

interface MermaidProps {
  chart: string;
  id?: string;
  className?: string;
}

export default function Mermaid({ chart, id, className = "" }: MermaidProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#ffffff");
  const [brandColor, setBrandColor] = useState("#3551F3");


  useEffect(() => {
    const colorSchemeMatch = window.matchMedia("(prefers-color-scheme: dark)");
    const computedStyle = window.getComputedStyle(document.body);
    const brandColor = computedStyle.getPropertyValue("--brand-color");

    setBrandColor(brandColor);
    setPrimaryColor(colorSchemeMatch.matches ? "#ffffff" : "#000000")

    const cb = (e: MediaQueryListEvent) => {
      setPrimaryColor(e.matches ? "#ffffff" : "#000000")
    };

    colorSchemeMatch.addEventListener("change", cb);

    return () => {
      colorSchemeMatch.removeEventListener("change", cb);
    }
  }, []);

  useEffect(() => {
    let mermaidInstance: any;
    const element = elementRef.current;
    
    const renderMermaid = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const mermaid = (await import("mermaid")).default;

        mermaid.initialize({
          startOnLoad: false,
          theme: "dark",
          securityLevel: "loose",
          fontFamily: "inherit",
          fontSize: 14,
          themeVariables: {
            primaryColor: brandColor,
            primaryTextColor: primaryColor,
            primaryBorderColor: primaryColor,

            lineColor: primaryColor,

            edgeLabelBackground: "transparent",

            actorBorder: primaryColor,
            actorBkg: brandColor,
            actorTextColor: "white",
            actorLineColor: primaryColor,
            signalColor: primaryColor,
            signalTextColor: primaryColor,

            gridColor: primaryColor,

            git0: primaryColor,
            git1: primaryColor,
            git2: primaryColor,
            git3: primaryColor,
            git4: primaryColor,
            git5: primaryColor,
            git6: primaryColor,
            git7: primaryColor,

            background: "transparent",
            secondaryColor: "transparent",
            tertiaryColor: "transparent",
          },
          flowchart: {
            useMaxWidth: true,
            htmlLabels: true,
            curve: "basis",
          },
          sequence: {
            useMaxWidth: true,
            wrap: true,
          },
          gantt: {
            useMaxWidth: true,
          },
          journey: {
            useMaxWidth: true,
          },
        });

        mermaidInstance = mermaid;

        if (element) {
          element.innerHTML = "";

          const diagramId =
            id || `mermaid-${Math.random().toString(36).substr(2, 9)}`;

          const { svg } = await mermaid.render(diagramId, chart.trim());
          element.innerHTML = svg;

          const svgElement = element.querySelector("svg");
          if (svgElement) {
            svgElement.style.maxWidth = "100%";
            svgElement.style.height = "auto";

            const paths = svgElement.querySelectorAll("path");
            paths.forEach((path) => {
              if (path.getAttribute("stroke") !== "none") {
                path.setAttribute("stroke", primaryColor);
              }
              if (
                path.getAttribute("fill") !== "none" &&
                path.getAttribute("fill") !== "transparent"
              ) {
                path.setAttribute("fill", primaryColor);
              }
            });

            const markers = svgElement.querySelectorAll("marker path");
            markers.forEach((marker) => {
              marker.setAttribute("fill", primaryColor);
              marker.setAttribute("stroke", primaryColor);
            });
          }
        }
      } catch (err) {
        console.error("Mermaid rendering error:", err);
        setError(
          err instanceof Error ? err.message : "Failed to render diagram",
        );
      } finally {
        setIsLoading(false);
      }
    };

    renderMermaid();

    return () => {
      if (element) {
        element.innerHTML = "";
      }
    };
  }, [chart, id, primaryColor]);

  if (error) {
    return (
      <div
        className={`mermaid-error ${className}`}
        style={{
          padding: "1rem",
          border: "1px solid #ef4444",
          borderRadius: "0.5rem",
          backgroundColor: "#fef2f2",
          color: "#dc2626",
        }}
      >
        <strong>Mermaid Error:</strong> {error}
        <details style={{ marginTop: "0.5rem" }}>
          <summary>Chart source</summary>
          <pre style={{ fontSize: "0.875rem", marginTop: "0.5rem" }}>
            {chart}
          </pre>
        </details>
      </div>
    );
  }

  return (
    <div
      className={`mermaid-container ${className}`}
      style={{ margin: "1rem 0" }}
    >
      {isLoading && (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            color: "#6b7280",
            backgroundColor: "#f9fafb",
            borderRadius: "0.5rem",
          }}
        >
          Loading diagram...
        </div>
      )}
      <div
        ref={elementRef}
        className="mermaid-diagram"
        style={{
          display: isLoading ? "none" : "block",
          textAlign: "center",
          overflow: "auto",
        }}
      />
    </div>
  );
}
