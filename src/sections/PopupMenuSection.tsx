import { PopupMenu } from "../../lib/PopupMenu";
import { useState } from "react";

const emojis = ["😀", "😎", "🤠", "🥳", "🤖", "👻", "💩", "👽", "🎃", "🐵"];

export default function PopupMenuSection() {
  const [emoji, setEmoji] = useState("😀");
  const todayDate = new Date().toISOString().split("T")[0];

  const chanegeEmoji = () => {
    const randomIndex = Math.floor(Math.random() * emojis.length);
    setEmoji(emojis[randomIndex]);
  };

  const handleButtonClick = (event: React.MouseEvent) => {
    if (event.target instanceof HTMLButtonElement) {
      alert(`${event.target.textContent} button clicked!`);
    }
  };

  const handleSettings = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const date = formData.get("date");
    const emoji = formData.get("emoji");
    const username = formData.get("username");
    alert(
      `Settings saved:\nDate: ${date}\nUsername: ${username}\nEmoji: ${emoji}`
    );
  };

  return (
    <div>
      <p className="text-frame">
        A PopupMenu allows you to display a small, temporary menu that appears
        on a screen when user clicks on a button. It can be used for menus,
        contextual messages, tooltips, and more. It contains a "focus trap" to
        keep the focus inside the popup when it's open. You can use Esc key or
        click outside to close the menu.
      </p>

      <div className="columns-2">
        <div className="scrap-frame">
          <h3>
            <strong>Props</strong>
          </h3>
          <ul>
            <li>
              <code>name</code>
              <span> string</span>
            </li>
            <li>
              <code>position?</code>
              <span> tl , tr , bl , br</span>
            </li>
            <li>
              <code>children</code>
              <span> button, dialog</span>
            </li>
            <li>
              <code>allowInsideClick?</code>
              <span> boolean (false)</span>
            </li>
          </ul>
        </div>

        <div className="examplebox flex center-content">
          <div className="flex gap">
            <PopupMenu name="settings" allowInsideClick>
              <button>Open Settings</button>
              <dialog className="popupmenu-dialog">
                <form
                  onSubmit={handleSettings}
                  className="popupmenu-dialog-list p-2"
                >
                  <div className="stack">
                    <label className="text-xs" htmlFor="username">
                      Username:
                    </label>
                    <input id="username" type="text" name="username" />
                  </div>

                  <div className="stack">
                    <label className="text-xs" htmlFor="date">
                      Date:
                    </label>
                    <input
                      id="date"
                      type="date"
                      name="date"
                      defaultValue={todayDate}
                    />
                  </div>
                  <hr className="lg" />

                  <button type="button" onClick={chanegeEmoji}>
                    <span>{emoji}</span>
                    <span> Change emoji</span>
                  </button>

                  <hr className="lg" />

                  <input type="hidden" name="emoji" value={emoji} />

                  <button type="submit" data-close aria-label="Save & close">
                    Save settings
                  </button>
                </form>
              </dialog>
            </PopupMenu>

            <PopupMenu name="usermenu" position="bl">
              <button className="usermenu-btn">
                <img src="/assets/avatar.svg" alt="avatar" />
                <span>John Doe</span>
              </button>
              <dialog className="popupmenu-dialog ">
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
    </div>
  );
}
