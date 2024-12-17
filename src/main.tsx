import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Hello } from "@ludekarts/scrap-ui";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <h1>SCRAP UI</h1>
    <Hello>World</Hello>
  </StrictMode>
);
