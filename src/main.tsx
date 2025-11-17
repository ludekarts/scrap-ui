import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// Styles.
import "./styles/preflight.css";
import "./styles/main.css";
import "./styles/popupmenu.css";
import "../lib/style.css";

import PopupMenuSection from "./sections/PopupMenuSection";
import ComboboxSection from "./sections/combobox/ComboboxSection";

// Sections.

// Playground.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <div className="header">
      <h1>
        <svg viewBox="0 0 65 25">
          <text
            x="2"
            y="20"
            fill="white"
            fontSize="20"
            stroke="black"
            strokeWidth="2"
            paintOrder="stroke fill"
            fontFamily="Bangers, system-ui, sans-serif"
          >
            Scrap UI
          </text>
        </svg>
      </h1>
      <p>Set of various React UI elements</p>
    </div>
    <nav>
      <a href="#dialog">Dialog</a>
      <a href="#combobox">Combobox</a>
      <a href="#popupmenu">PoupMenu</a>
      <a href="#show">Show</a>
    </nav>
    <main>
      <section id="dialog">
        <h2 className="bangers shadow-hard">Dialog</h2>
      </section>
      <section id="combobox">
        <h2 className="bangers shadow-hard">Combobox</h2>
        <ComboboxSection />
      </section>
      <section id="popupmenu">
        <h2 className="bangers shadow-hard">PoupMenu</h2>
        <PopupMenuSection />
      </section>
      <section id="show">
        <h2 className="bangers shadow-hard">Show</h2>
      </section>
    </main>
  </StrictMode>
);

/*
  <h1>Dialog</h1>
      <DialogExample />
      <hr />

      <h1>Combobox</h1>
      <ComboboxExample />
      <br />
      <h2>Bearbone Combobox</h2>
      <BearboneComboboxExample />
      <hr />
      <h2>Combo Dialog</h2>
      <ComboDialogExample />
*/
