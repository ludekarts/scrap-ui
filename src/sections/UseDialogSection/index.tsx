import { createDialog } from "../../../lib/useDialog";
import { getFormFields } from "@ludekarts/utility-belt";

export default function UseDialogSection() {
  async function handleOpenDialog() {
    const result = await SimpleDialog.open("apple");
    if (result) {
      console.log(result.name, result.age);
    } else {
      console.log("Dialog was closed without submitting");
    }
  }

  return (
    <div className="space-y-6">
      <p className="text-frame">
        Simpler version of Dialog that only provides the Hook API.
      </p>

      <div>
        <SimpleDialog />
        <button className="h-10" onClick={handleOpenDialog}>
          Open Simple Dialog
        </button>
      </div>
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
  const { dialogRef, closeDialog, useProps } = useDialog();
  const fruitName = useProps();

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
          Exirt with fixed value
        </button>
      </form>
    </dialog>
  );
};

SimpleDialog.open = openDialog;
