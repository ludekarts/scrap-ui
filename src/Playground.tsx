import "./styles/preflight.css";
import "./styles/playground.css";
import { useState } from "react";
import { createDialog } from "@ludekarts/scrap-ui";

const [BaseDialog, ctrl] = createDialog({ forceOpen: true });

export default function Playground() {
  const showBaseDialog = () => {
    ctrl.show();
  };

  const [expended, setExpanded] = useState(false);

  return (
    <div>
      <h1>Hello Playground!</h1>
      <div className="rail">
        <button onClick={showBaseDialog}>SHOW DIALOG</button>
      </div>
      <BaseDialog className={`border-dailog ${expended ? "" : "max-w-21"}`}>
        <div className="rail spread">
          <h2>Base Dialog</h2>
          <button className="ghost" onClick={() => setExpanded(!expended)}>
            {expended ? "↔" : "⇹"}
          </button>
        </div>
        <p>
          This is a BaseDialog component. You can use it to create your own
          dialogs 😉.
        </p>
        <button onClick={() => ctrl.close()}>Close</button>
      </BaseDialog>
    </div>
  );
}
