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
            primaryColor: "#ffffff",
            primaryTextColor: "#ffffff",
            primaryBorderColor: "#ffffff",

            lineColor: "#ffffff",

            edgeLabelBackground: "transparent",

            actorBorder: "#ffffff",
            actorBkg: "transparent",
            actorTextColor: "#ffffff",
            actorLineColor: "#ffffff",
            signalColor: "#ffffff",
            signalTextColor: "#ffffff",

            gridColor: "#ffffff",

            git0: "#ffffff",
            git1: "#ffffff",
            git2: "#ffffff",
            git3: "#ffffff",
            git4: "#ffffff",
            git5: "#ffffff",
            git6: "#ffffff",
            git7: "#ffffff",

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
                path.setAttribute("stroke", "#ffffff");
              }
              if (
                path.getAttribute("fill") !== "none" &&
                path.getAttribute("fill") !== "transparent"
              ) {
                path.setAttribute("fill", "#ffffff");
              }
            });

            const markers = svgElement.querySelectorAll("marker path");
            markers.forEach((marker) => {
              marker.setAttribute("fill", "#ffffff");
              marker.setAttribute("stroke", "#ffffff");
            });

            const polylines = svgElement.querySelectorAll("polyline");
            polylines.forEach((polyline) => {
              polyline.setAttribute("stroke", "#ffffff");
            });

            const lines = svgElement.querySelectorAll("line");
            lines.forEach((line) => {
              line.setAttribute("stroke", "#ffffff");
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
  }, [chart, id]);

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
