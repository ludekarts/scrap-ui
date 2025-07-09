import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Styles.
import "./styles/preflight.css";
import "./styles/playground.css";

// Examles.
import ComboboxExample from "./ComboboxExample";
import DialogExample from "./DialogExample";

// Playground.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <main>
      <h1>Dialog</h1>
      <DialogExample />
      <hr />

      <h1>Combobox</h1>
      <ComboboxExample />
      <hr />
    </main>
  </StrictMode>
);
