"use client";

import { useEffect } from "react";
import docsearch from "@docsearch/js";
import "@docsearch/css";
import s from "./DocSearch.module.css";

export default function DocSearch() {
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_DOCSEARCH_APP_ID
      && process.env.NEXT_PUBLIC_DOCSEARCH_INDEX
      && process.env.NEXT_PUBLIC_DOCSEARCH_API_KEY
    ) {
      docsearch({
        container: "#docsearch",
        appId: process.env.NEXT_PUBLIC_DOCSEARCH_APP_ID,
        indexName: process.env.NEXT_PUBLIC_DOCSEARCH_INDEX,
        apiKey: process.env.NEXT_PUBLIC_DOCSEARCH_API_KEY,
      })
    }
  }, []);

  return <div className={s.docsearch}>
    <div id="docsearch" />
  </div>;
};
