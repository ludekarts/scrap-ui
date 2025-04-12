import {
  Dialog,
  openDialog,
  useDialogData,
  closeDialog,
} from "@ludekarts/scrap-ui";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import "./styles/preflight.css";
import "./styles/playground.css";

type DialogResult = {
  login: string;
  password: string;
};

type DialogProps = {
  label: string;
};

export default function Playground() {
  const [emoji, setEmoji] = useState("🍓");
  const [show, toggleShow] = useState(false);

  const randomEmoji = () => {
    setEmoji(
      ["🍎", "🍐", "🍊", "🍋", "🍌", "🍉", "🍇", "🍓", "🫐", "🍒"][
        Math.floor(Math.random() * 10)
      ]
    );
  };
  return (
    <main>
      <button
        onClick={async () =>
          console.log(
            await openDialog<DialogResult, DialogProps>("dialogOne", {
              label: emoji,
            })
          )
        }
      >
        Open Dialog Two
      </button>
      <br />
      <button
        onClick={async () => {
          const count = await openDialog<number>("dialogThree", {
            label: emoji,
          });
          console.log("count", count);
        }}
      >
        Open Dialog Three
      </button>
      <br />
      <button onClick={randomEmoji}>EMOJI</button>
      <br />
      <button
        onClick={() => {
          openDialog("d1");
        }}
      >
        TEST dialog
      </button>
      <br />
      <button
        onClick={() => {
          toggleShow(true);
          openDialog("d1");
        }}
      >
        Toggle
      </button>
      {/* <DialogTwo /> */}
      {/* <DialogThree /> */}
      <TestDialog
        open={show}
        onClick={() => {
          toggleShow(false);
          setTimeout(() => {
            closeDialog("d1");
          }, 300);
        }}
      />
      <DialogOne />
    </main>
  );
}

function DialogTwo() {
  return (
    <Dialog name="dialogTwo" className="d bottom">
      Hello dialog 2️⃣
    </Dialog>
  );
}

function DialogThree() {
  const { label } = useDialogData<DialogProps>("dialogThree");
  return (
    <Dialog name="dialogThree" className="d bottom">
      <h1>Hello dialog 3️⃣ {label}</h1>
      <button onClick={() => closeDialog("dialogThree")}>✖️</button>
    </Dialog>
  );
}

function TestDialog({ open, onClick }) {
  const { isOpen } = useDialogData("d1");
  console.log(open);

  return (
    <Dialog name="d1" className="testDialog isOpen">
      <AnimatePresence>
        {open && (
          <motion.div
            exit={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            initial={{ opacity: 0, x: 20 }}
          >
            <div className="frame">
              <h1>
                <span>Hello Test Dialog</span>
                <button onClick={onClick}>✖️</button>
              </h1>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Dialog>
  );
}

function DialogOne() {
  const { label } = useDialogData<DialogProps>("dialogOne");

  return (
    <Dialog name="dialogOne">
      <form onSubmit={closeDialog}>
        <h1>Hello Dialog {label}</h1>
        <input name="login" type="text" placeholder="Login" />
        <input name="password" type="password" placeholder="Password" />
        <button
          type="button"
          onClick={() => openDialog("din").then((r) => console.log(">>", r))}
        >
          Open IN
        </button>
        <span> | </span>
        <button type="submit">SAVE</button>
      </form>
      <Dialog noDismiss name="din">
        <div>
          <h1 tabIndex={0}>Dialog inside dialog</h1>
          <button onClick={closeDialog}>X</button>
        </div>
        <div>
          <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</p>
          <p>
            Inventore architecto dicta, repellendus quisquam debitis beatae est
            totam numquam itaque rem, iure modi vero saepe commodi molestiae hic
            exercitationem dignissimos dolorum?
          </p>
          <div>
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
