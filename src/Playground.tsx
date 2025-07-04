import "./styles/preflight.css";
import "./styles/playground.css";
import { useState } from "react";
import { createDialog } from "@ludekarts/scrap-ui";

const [Dialog, ctrl] = createDialog({ forceOpen: true });

export default function Playground() {
  let label = "Initail label 🏖️";

  const showBaseDialog = () => {
    ctrl.show({
      label,
    });
  };

  return (
    <div>
      <h1>Hello Playground!</h1>
      <div className="rail">
        <button onClick={showBaseDialog}>SHOW DIALOG</button>
        <button
          onClick={() => {
            label = "Updated label 💎";
          }}
        >
          Change Label
        </button>
      </div>
      <BaseDialog />
    </div>
  );
}

function BaseDialog() {
  const [expended, setExpanded] = useState(false);
  const { label = "🌋" } = ctrl.getState();

  return (
    <Dialog className={`border-dailog ${expended ? "" : "max-w-21"}`}>
      <div className="rail spread">
        <h2>Base Dialog</h2>
        <button className="ghost" onClick={() => setExpanded(!expended)}>
          {expended ? "↙️" : "↗️"}
        </button>
      </div>
      <p>
        This is a BaseDialog component. You can use it to create your own
        dialogs 😉.
      </p>
      <p>Here you have an {label}</p>
      <div className="rail">
        <button onClick={() => ctrl.close()}>Close</button>
      </div>
    </Dialog>
  );
}
