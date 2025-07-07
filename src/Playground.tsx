import "./styles/preflight.css";
import "./styles/playground.css";
import { useState } from "react";
import { createDialog } from "@ludekarts/scrap-ui";

const [MainDialog, ctrl] = createDialog({ animate: true });
const [SubDialog, subCtrl] = createDialog({ outDelay: 500 });

export default function Playground() {
  let icon = "🏖️";

  const showBaseDialog = async () => {
    const result = await ctrl.show({ icon });
    console.log("Dialog closed with:", result);
  };

  return (
    <div>
      <h1>Hello Playground!</h1>
      <div className="rail">
        <button onClick={showBaseDialog}>SHOW DIALOG</button>
        <button
          onClick={() => {
            icon = "💎";
          }}
        >
          Change Label
        </button>
      </div>
      <MainDialogComponent />
    </div>
  );
}

function MainDialogComponent() {
  const [expended, setExpanded] = useState(false);
  const { icon = "🌋" } = ctrl.getState();

  const openSubdialog = async () => {
    subCtrl.show();
  };

  return (
    <MainDialog className={`border-dailog ${expended ? "" : "max-w-21"}`}>
      <div className="rail spread">
        <h2>{icon} Base Dialog</h2>
        <button className="ghost" onClick={() => setExpanded(!expended)}>
          {expended ? "↙️" : "↗️"}
        </button>
      </div>
      <p>
        This is a MainDialog component. You can use it to create your own
        dialogs.
      </p>
      <form className="name-form" onSubmit={ctrl.close}>
        <input type="text" name="name" placeholder="Enter your name" />
        <div className="rail px-2">
          <input type="radio" name="toggle" value="☀️" defaultChecked />
          <input type="radio" name="toggle" value="🌙" />
        </div>
        <button type="submit">Submit</button>
      </form>
      <div className="rail">
        <button onClick={openSubdialog}>Subdialog</button>
        <button onClick={() => ctrl.close()}>Close</button>
      </div>
      <SubDialogComponent />
    </MainDialog>
  );
}

function SubDialogComponent() {
  return (
    <SubDialog noDismiss className="animated">
      <div className="rail spread">
        <h2>🐋 Sub Dialog</h2>
        <button className="ghost" onClick={() => subCtrl.close()}>
          ✖️
        </button>
      </div>
      <p>This is a SubDialog component.</p>
    </SubDialog>
  );
}
