import { Dialog, closeDialog, openDialog } from "@ludekarts/scrap-ui";

export default function Playground() {
  return (
    <main>
      <button onClick={() => openDialog("dialog")}>OpenDialog</button>

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
      </Dialog>
    </main>
  );
}
