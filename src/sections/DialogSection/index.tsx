import { useState } from "react";
import { createDialog } from "../../../lib/Dialog";

const [BasicDialog, basicController] = createDialog<
  { name: string; notes?: string },
  { title?: string }
>({ animate: true, name: "basic-dialog" });

const [LockedDialog, lockedController] = createDialog({
  animate: true,
  name: "locked-dialog",
});

export default function DialogSection() {
  const [basicResult, setBasicResult] = useState("No result yet");
  const [lockedResult, setLockedResult] = useState("No result yet");
  const [lockedHint, setLockedHint] = useState("No action yet");

  const openBasic = async () => {
    const result = await basicController.open({ title: "Basic dialog" });
    setBasicResult(
      result ? JSON.stringify(result, null, 2) : "Closed without data",
    );
  };

  const openLocked = async () => {
    const result = await lockedController.open();
    setLockedResult(result ? JSON.stringify(result, null, 2) : "Closed");
  };

  const handleLockedSubmit = () => {
    setLockedHint("Submit captured (dialog stays open)");
  };

  return (
    <div>
      <p className="text-frame">
        Dialog2 is a small helper for building modal dialogs with an imperative
        controller. The example below shows a normal form close and a no-dismiss
        dialog where method="dialog" submits do not close it.
      </p>

      <div className="mt-10 grid grid-cols-2 gap-6">
        <div className="scrap-frame">
          <h3>
            <strong>Props</strong>
          </h3>
          <ul>
            <li>
              <code>name?</code>
              <span> string</span>
            </li>
            <li>
              <code>animate?</code>
              <span> boolean</span>
            </li>
            <li>
              <code>noDismiss?</code>
              <span> boolean</span>
            </li>
            <li>
              <code>outDelay?</code>
              <span> number</span>
            </li>
          </ul>
        </div>

        <div className="examplebox flex items-start justify-center">
          <div className="grid gap-6">
            <div className="grid gap-3">
              <button className="h-10" onClick={openBasic}>
                Open basic dialog
              </button>
              <pre className="text-xs">{basicResult}</pre>
            </div>

            <div className="grid gap-3">
              <button className="h-10" onClick={openLocked}>
                Open no-dismiss dialog
              </button>
              <pre className="text-xs">{lockedResult}</pre>
              <div className="text-xs">{lockedHint}</div>
            </div>
          </div>
        </div>
      </div>

      <BasicDialog>
        <form
          className="grid gap-3"
          onSubmit={(event) => basicController.close(event)}
        >
          <h3>Basic dialog</h3>
          <label className="text-sm" htmlFor="name">
            Name
          </label>
          <input id="name" name="name" autoComplete="off" />
          <label className="text-sm" htmlFor="notes">
            Notes
          </label>
          <textarea id="notes" name="notes" rows={3} />
          <div className="flex gap-2">
            <button type="submit">Save and close</button>
            <button type="button" onClick={() => basicController.close()}>
              Close
            </button>
          </div>
        </form>
      </BasicDialog>

      <LockedDialog noDismiss>
        <form
          className="grid gap-3"
          method="dialog"
          onSubmit={handleLockedSubmit}
        >
          <h3>No-dismiss dialog</h3>
          <p className="text-sm">
            Submit uses method="dialog" but the dialog stays open.
          </p>
          <label className="text-sm" htmlFor="reason">
            Reason
          </label>
          <input id="reason" name="reason" autoComplete="off" />
          <div className="flex gap-2">
            <button type="submit">Submit</button>
            <button type="button" onClick={() => lockedController.close()}>
              Close
            </button>
            <button
              type="button"
              onClick={() => lockedController.close({ status: "saved" })}
            >
              Save and close
            </button>
          </div>
        </form>
      </LockedDialog>
    </div>
  );
}
