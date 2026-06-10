import { createDialog } from "../../../lib/useDialog";

export default function UseDialogSection() {
  async function handleOpenDialog() {
    const result = await SimpleDialog.open("apple");
    console.log(result.name, result.age);
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

const [useDialog, openDialog] = createDialog<ReturnValue, OpenProps>();

const SimpleDialog = () => {
  const { dialogRef, closeDialog, useProps } = useDialog();
  const fruitName = useProps();

  return (
    <dialog className="bg-black text-white" ref={dialogRef}>
      <header className="mb-4 flex items-center justify-between gap-4 text-lg">
        <span className="capitalize">{fruitName} is my favorite fruit!</span>
        <button
          className="text-black"
          onClick={() => closeDialog({ name: "John", age: 30 })}
        >
          ✕
        </button>
      </header>
      <form className="flex flex-col gap-2" onSubmit={closeDialog}>
        <input name="name" placeholder="Your name" />
        <input name="age" placeholder="Your age" />
        <button className="text-black" type="submit">
          Submit
        </button>
      </form>
    </dialog>
  );
};

SimpleDialog.open = openDialog;
