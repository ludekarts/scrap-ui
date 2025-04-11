import { Dialog, closeDialog, openDialog } from "@ludekarts/scrap-ui";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import "./styles/preflight.css";
import "./styles/playground.css";

export default function Playground() {
  const [show, setShow] = useState(false);

  return (
    <main>
      {/* <button onClick={() => openDialog("dialog")}>OpenDialog</button> */}
      <button onClick={() => setShow(!show)}>Open Dialog</button>

      <TestDialog open={show} onClose={() => setShow(false)} />

      {/* <AnimatePresence>
        {show && (
          <motion.div
            exit={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            initial={{ opacity: 0, y: 20 }}
          >

          </motion.div>
        )}
      </AnimatePresence> */}

      {/*
      <Dialog name="dialog">
        <form onSubmit={closeDialog}>
          <h1>Hello Dialog</h1>
          <input name="login" type="text" placeholder="Login" />
          <input name="password" type="password" placeholder="Password" />
          <button
            type="button"
            onClick={() => openDialog("din").then((r) => console.log(">>", r))}
          >
            Open IN
          </button>
          <button type="submit">Close</button>
        </form>
        <Dialog noDismiss name="din">
          <div>
            <h1 tabIndex={0}>Dialog inside dialog</h1>
            <button onClick={closeDialog}>X</button>
          </div>
          <div>
            <p>Lorem ipsum, dolor sit amet consectetur adipisicing elit.</p>
            <p>
              Inventore architecto dicta, repellendus quisquam debitis beatae
              est totam numquam itaque rem, iure modi vero saepe commodi
              molestiae hic exercitationem dignissimos dolorum?
            </p>
            <div>
              <button onClick={() => closeDialog("din", 12)}>CLOSE</button>
              <form method="dialog">
                <button type="submit">CLOSE SUBMIT</button>
              </form>
            </div>
          </div>
        </Dialog>
      </Dialog> */}
    </main>
  );
}

function TestDialog({ open, onClose }: { open: boolean }) {
  return (
    <Dialog name="d1" open={open} className="d bottom no-backdrop-">
      <div className="frame">
        <h1>
          <span>Hello Dialog</span>
          <button onClick={onClose}>✖️</button>
        </h1>
      </div>
    </Dialog>
  );
}
