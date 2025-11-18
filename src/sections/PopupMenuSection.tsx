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
      `Settings saved:\nDate: ${date}\nUsername: ${username}\nEmoji: ${emoji}`,
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

      <div className="mt-10 grid grid-cols-2 gap-6">
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

        <div className="examplebox flex items-center justify-center">
          <div className="flex items-center gap-6">
            <PopupMenu name="tooltip">
              <button className="h-10">Show tooltip</button>
              <dialog className="my-1 max-w-72 rounded-md p-2 shadow-lg">
                Lorem ipsum dolor, sit amet consectetur adipisicing elit.
                Molestias maiores error at totam mollitia, architecto, amet
                cumque explicabo incidunt ipsa eum culpa ullam itaque dicta quod
                iusto. Esse, id eius?
              </dialog>
            </PopupMenu>
            <PopupMenu name="settings" allowInsideClick>
              <button className="h-10">Open Settings</button>
              <dialog className="my-1 rounded-md p-2 shadow-lg">
                <form onSubmit={handleSettings} className="grid">
                  <div className="flex flex-col gap-1">
                    <label className="text-sm" htmlFor="username">
                      Username:
                    </label>
                    <input
                      id="username"
                      type="text"
                      name="username"
                      autoComplete="off"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-sm" htmlFor="date">
                      Date:
                    </label>
                    <input
                      id="date"
                      type="date"
                      name="date"
                      defaultValue={todayDate}
                    />
                  </div>
                  <hr className="-mx-2 my-2 border-gray-200" />

                  <button type="button" onClick={chanegeEmoji}>
                    <span>{emoji}</span>
                    <span> Change emoji</span>
                  </button>

                  <hr className="-mx-2 my-2 border-gray-200" />

                  <input type="hidden" name="emoji" value={emoji} />

                  <button type="submit" data-close aria-label="Save & close">
                    Save settings
                  </button>
                </form>
              </dialog>
            </PopupMenu>

            <PopupMenu name="usermenu" position="bl">
              <button className="flex h-10 items-center gap-2">
                <img
                  className="size-7 rounded-full"
                  src="/assets/avatar.svg"
                  alt="avatar"
                />
                <span>John Doe</span>
              </button>
              <dialog className="my-1 rounded-md p-2 shadow-lg">
                <div
                  className="flex w-24 flex-col gap-1"
                  onClick={handleButtonClick}
                >
                  <button>My profile</button>
                  <button>Account</button>
                  <button>Payments</button>
                  <hr className="-mx-2 my-2 border-gray-200" />

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
