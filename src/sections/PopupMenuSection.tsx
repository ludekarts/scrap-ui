import { PopupMenu } from "@ludekarts/scrap-ui";

export default function PopupMenuSection() {
  const handleButtonClick = (event: React.MouseEvent) => {
    if (event.target instanceof HTMLButtonElement) {
      alert(`${event.target.textContent} button clicked!`);
    }
  };

  const handleSettings = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const date = formData.get("date");
    const username = formData.get("username");
    alert(`Settings saved:\nDate: ${date}\nUsername: ${username}`);
  };

  return (
    <div>
      <p className="text-frame">
        A PopupMenu is a small, temporary menu that appears on a screen when
        user performs a specific action (usually a right-click or long-press)
        providing quick access to relevant commands or options.
      </p>

      <div className="examplebox flex center-content">
        <div className="flex gap">
          <PopupMenu name="settings">
            <button>Open Settings</button>
            <dialog className="popupmenu-dialog">
              <form
                onSubmit={handleSettings}
                className="popupmenu-dialog-list "
              >
                <div className="stack">
                  <label className="text-xs" htmlFor="date">
                    Date:
                  </label>
                  <input id="date" type="date" name="date" />
                </div>

                <div className="stack">
                  <label className="text-xs" htmlFor="username">
                    Username:
                  </label>
                  <input id="username" type="text" name="username" />
                </div>
                <hr />
                <button type="submit">Save settings</button>
              </form>
            </dialog>
          </PopupMenu>

          <PopupMenu name="usermenu">
            <button className="usermenu-btn">
              <img src="/assets/avatar.svg" alt="avatar" />
              <span>John Doe</span>
            </button>
            <dialog className="popupmenu-dialog">
              <div
                className="popupmenu-dialog-list"
                onClick={handleButtonClick}
              >
                <button>My profile</button>
                <button>Account</button>
                <button>Payments</button>
                <hr />
                <button>Logout</button>
              </div>
            </dialog>
          </PopupMenu>
        </div>
      </div>
    </div>
  );
}
