import {
  Dialog,
  openDialog,
  closeDialog,
  useDialogData,
  PopupMenu,
} from "@ludekarts/scrap-ui";

// import { useState } from "react";
import "./styles/preflight.css";
import "./styles/playground.css";

// type DialogResult = {
//   login: string;
//   password: string;
// };

type DialogProps = {
  label: string;
};

export default function Playground() {
  // const [emoji, setEmoji] = useState("🍓");
  // const [show, toggleShow] = useState(false);

  const showDialog = () => {
    openDialog("basicDialog");
  };

  return (
    <main className="playground">
      <div>
        <button onClick={showDialog}>Show dialog</button>
      </div>
      <DialogInDialog />

      <div style={{ textAlign: "center" }}>
        <PopupMenu name="menu" position="tl">
          <button className="popup-button">Menu</button>
          <dialog className="popup">
            <button>A</button>
            <button>B</button>
          </dialog>
        </PopupMenu>
      </div>
    </main>
  );
}

function DialogInDialog() {
  const { label } = useDialogData<DialogProps>("basicDialog");

  return (
    <Dialog name="basicDialog" className="dialog center ">
      <form onSubmit={closeDialog}>
        <h1>Hello Dialog {label}</h1>
        <div>
          <input name="login" type="text" placeholder="Login" />
          <input name="password" type="password" placeholder="Password" />
        </div>
        <button
          type="button"
          onClick={() => openDialog("din").then((r) => console.log(">>", r))}
        >
          Open IN
        </button>
        <span> | </span>
        <button type="submit">SAVE</button>
      </form>
      <Dialog noDismiss name="din" className="dialog xl center blue">
        <div className="rail spread">
          <h1 tabIndex={0}>Dialog inside dialog</h1>
          <button onClick={closeDialog}>X</button>
        </div>
        <br />
        <div>
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</p>
          <p>
            Inventore architecto dicta, repellendus quisquam debitis beatae est
            totam numquam itaque rem, iure modi vero saepe commodi molestiae hic
            exercitationem dignissimos dolorum?
          </p>
          <br />
          <div className="rail">
            <button onClick={() => closeDialog("din", 12)}>CLOSE</button>
            <form method="dialog">
              <button type="submit">CLOSE SUBMIT</button>
            </form>
          </div>
        </div>
      </Dialog>
    </Dialog>
  );
}
