import { ReactElement } from "react";
import GitHub from "./index";

function isReactElement(children: any): children is ReactElement {
  return children && typeof children === "object" && "props" in children;
}

export function processGitHubLinks(children: any): any {
  if (typeof children === "string") {
    const ghPattern = /GH-(\d+)/g;
    const parts = children.split(ghPattern);
    
    if (parts.length === 1) return children;
    
    const result = [];
    for (let i = 0; i < parts.length; i++) {
      if (i % 2 === 0) {
        if (parts[i]) result.push(parts[i]);
      } else {
        result.push(<GitHub key={`gh-${i}`} number={parseInt(parts[i])} />);
      }
    }
    
    return result.length === 1 ? result[0] : result;
  }
  
  if (Array.isArray(children)) {
    return children.map((child, index) => processGitHubLinks(child));
  }
  
  if (isReactElement(children)) {
    return children;
  }
  
  return children;
}