import { createDialog } from "../../../lib/useDialog";
import { getFormFields } from "@ludekarts/utility-belt";
import { useState } from "react";

export default function UseDialogSection() {
  const [fruit, setFruit] = useState("apple");

  async function handleOpenDialog() {
    const result = await SimpleDialog.open(fruit);
    if (result) {
      console.log(result);
    } else {
      console.log("Dialog was closed without submitting");
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-frame">
        Simpler version of Dialog that only provides the Hook API.
      </p>

      <div className="flex items-center gap-4">
        <select
          id="fruits"
          name="fruits"
          onChange={(e) => setFruit(e.target.value)}
          className="rounded-lg border-2 border-black bg-white p-2 text-black"
        >
          <option value="apple">Apple 🍎</option>
          <option value="banana">Banana 🍌</option>
          <option value="orange">Orange 🍊</option>
        </select>
        <button className="h-10" onClick={handleOpenDialog}>
          Open Simple Dialog
        </button>
      </div>
      <SimpleDialog />
    </div>
  );
}

// ---- SIMPLE DIALOG ----------------

type ReturnValue = {
  name: string;
  age: number;
};

type OpenProps = string;

const [useDialog, openDialog] = createDialog<ReturnValue, OpenProps>(
  getFormFields<ReturnValue>,
);

const SimpleDialog = () => {
  const [showAdders, setShowAdders] = useState(false);
  const { dialogRef, closeDialog, useOpenProps } = useDialog();
  const fruitName = useOpenProps();

  return (
    <dialog className="bg-black text-white" ref={dialogRef}>
      <header className="mb-4 flex items-center justify-between gap-4 text-lg">
        <span className="capitalize">{fruitName} is my favorite fruit!</span>

        <form method="dialog">
          <button
            className="text-black focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            type="submit"
          >
            ✕
          </button>
        </form>
      </header>
      <form className="flex flex-col gap-2" onSubmit={closeDialog}>
        <input
          className="focus:ring-2 focus:ring-yellow-500 focus:outline-none"
          name="name"
          placeholder="Your name"
        />
        <input
          className="focus:ring-2 focus:ring-yellow-500 focus:outline-none"
          name="age"
          placeholder="Your age"
        />
        <select
          id="fruit"
          name="fruit"
          className="rounded-lg border-2 border-black bg-white p-2 text-black focus:ring-2 focus:ring-yellow-500 focus:outline-none"
        >
          <option value="strawberry">Strawberry 🍓</option>
          <option value="pineapple">Pineapple 🍍</option>
          <option value="mango">Mango 🥭</option>
        </select>
        <button
          className="text-black focus:ring-2 focus:ring-yellow-500 focus:outline-none"
          type="button"
          onClick={() => setShowAdders(!showAdders)}
        >
          Show adders
        </button>
        {showAdders && (
          <input
            className="focus:ring-2 focus:ring-yellow-500 focus:outline-none"
            name="adders"
            placeholder="Your adders"
          />
        )}
        <button
          className="text-black focus:ring-2 focus:ring-yellow-500 focus:outline-none"
          type="submit"
        >
          Submit
        </button>
        <button
          className="text-black focus:ring-2 focus:ring-yellow-500 focus:outline-none"
          type="button"
          onClick={() => closeDialog({ name: "John", age: 30 })}
        >
          Exit with fixed value
        </button>
      </form>
    </dialog>
  );
};

SimpleDialog.open = openDialog;
