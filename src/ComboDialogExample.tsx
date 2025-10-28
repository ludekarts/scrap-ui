import { createDialog } from "@ludekarts/scrap-ui";
import { BearboneComboboxExample } from "./ComboboxExample";

const [ComboDialog, ctrl] = createDialog({
  animate: true,
});

export default function ComboDialogExample() {
  return (
    <div className="rail">
      <button onClick={() => ctrl.open()}>SHOW COMBO DIALOG</button>
      <MainDialogComponent />
    </div>
  );
}

function MainDialogComponent() {
  return (
    <ComboDialog className="stack">
      <h2>Combo Dialog</h2>
      <input type="text" />
      <BearboneComboboxExample />
    </ComboDialog>
  );
}
