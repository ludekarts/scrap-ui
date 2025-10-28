import { useState } from "react";
import { createDialog } from "@ludekarts/scrap-ui";

interface DialogReturnData {
  name?: string;
  toggle?: string;
}

interface DialogProps {
  icon: string;
}

interface SubDialogProps {
  parentIcon: string;
}

const [MainDialog, ctrl] = createDialog<DialogReturnData, DialogProps>({
  animate: true,
});

const [SubDialog, subCtrl] = createDialog<undefined, SubDialogProps>({
  outDelay: 500,
});

export default function DialogExample() {
  let icon = "🏖️";

  const showBaseDialog = async () => {
    const result = await ctrl.open({ icon });
    console.log("Dialog closed with:", result);
  };

  return (
    <div className="rail">
      <button onClick={showBaseDialog}>SHOW DIALOG</button>
      <button
        onClick={() => {
          icon = "💎";
        }}
      >
        Change Label
      </button>
      <MainDialogComponent />
    </div>
  );
}

function MainDialogComponent() {
  const [expended, setExpanded] = useState(false);
  const { icon = "🌋" } = ctrl.useDialogState();

  const openSubdialog = async () => {
    subCtrl.open({ parentIcon: icon });
  };

  return (
    <MainDialog className={`border-dialog ${expended ? "" : "max-w-21"}`}>
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
  const { parentIcon } = subCtrl.useDialogState();

  return (
    <SubDialog noDismiss className="animated">
      <div className="rail spread">
        <h2>🐋 Sub Dialog</h2>
        <button className="ghost" onClick={() => subCtrl.close()}>
          ✖️
        </button>
      </div>
      <p>
        This is a SubDialog component, and this is my parent icon: {parentIcon}
      </p>
    </SubDialog>
  );
}
