import "./styles/preflight.css";
import "./styles/playground.css";
import { useState } from "react";
import {
  Combobox2,
  ComboboxInput,
  ComboboxList,
  createDialog,
} from "@ludekarts/scrap-ui";

interface DialogReturnData {
  name?: string;
  toggle?: string;
}

interface DialogProps {
  icon: string;
}

interface SubDialogProps {
  parentIcon: string;
}

const [MainDialog, ctrl] = createDialog<DialogReturnData, DialogProps>({
  animate: true,
});

const [SubDialog, subCtrl] = createDialog<undefined, SubDialogProps>({
  outDelay: 500,
});

const fruits = [
  { id: "1", name: "Apple", icon: "🍎" },
  { id: "2", name: "Banana", icon: "🍌" },
  { id: "3", name: "Cherry", icon: "🍒" },
  { id: "4", name: "Coconut", icon: "🥥" },
  { id: "5", name: "Watermelon", icon: "🍉" },
  { id: "6", name: "Orange", icon: "🍊" },
  { id: "7", name: "Grape", icon: "🍇" },
  { id: "8", name: "Strawberry", icon: "🍓" },
];

export default function Playground() {
  let icon = "🏖️";

  const showBaseDialog = async () => {
    const result = await ctrl.show({ icon });
    console.log("Dialog closed with:", result);
  };

  return (
    <main>
      <h1>Dialog</h1>
      <div className="rail">
        <button onClick={showBaseDialog}>SHOW DIALOG</button>
        <button
          onClick={() => {
            icon = "💎";
          }}
        >
          Change Label
        </button>
      </div>
      <hr />

      <h1>Combobox</h1>
      <FruitSearch />
      <hr />

      <MainDialogComponent />
    </main>
  );
}

function MainDialogComponent() {
  const [expended, setExpanded] = useState(false);
  const { icon = "🌋" } = ctrl.useDialogState();

  const openSubdialog = async () => {
    subCtrl.show({ parentIcon: icon });
  };

  return (
    <MainDialog className={`border-dailog ${expended ? "" : "max-w-21"}`}>
      <div className="rail spread">
        <h2>{icon} Base Dialog</h2>
        <button className="ghost" onClick={() => setExpanded(!expended)}>
          {expended ? "↙️" : "↗️"}
        </button>
      </div>
      <p>
        This is a MainDialog component. You can use it to create your own
        dialogs.
      </p>
      <form className="name-form" onSubmit={ctrl.close}>
        <input type="text" name="name" placeholder="Enter your name" />
        <div className="rail px-2">
          <input type="radio" name="toggle" value="☀️" defaultChecked />
          <input type="radio" name="toggle" value="🌙" />
        </div>
        <button type="submit">Submit</button>
      </form>
      <div className="rail">
        <button onClick={openSubdialog}>Subdialog</button>
        <button onClick={() => ctrl.close()}>Close</button>
      </div>
      <SubDialogComponent />
    </MainDialog>
  );
}

function SubDialogComponent() {
  const { parentIcon } = subCtrl.useDialogState();

  return (
    <SubDialog noDismiss className="animated">
      <div className="rail spread">
        <h2>🐋 Sub Dialog</h2>
        <button className="ghost" onClick={() => subCtrl.close()}>
          ✖️
        </button>
      </div>
      <p>
        This is a SubDialog component, and this is my parent icon: {parentIcon}
      </p>
    </SubDialog>
  );
}

function FruitSearch() {
  const [phrases, setPhrases] = useState<string>("");
  const [selected, setSelected] = useState<string>("");
  const displayFruits = fruits.filter((f) =>
    f.name.toLocaleLowerCase().includes(phrases)
  );
  return (
    <Combobox2 name="fruits" className="combobox">
      <ComboboxInput
        className="combobox-input"
        placeholder="🔍 Search for a fruit"
        onChange={(value) => setPhrases(value.toLocaleLowerCase())}
      />
      <ComboboxList
        className="combobox-list"
        onSelect={(value) => setSelected(displayFruits[value].name)}
      >
        {displayFruits.map((fruit) => (
          <li key={fruit.id}>
            <span>{fruit.icon}</span>
            <span>{fruit.name}</span>
          </li>
        ))}
      </ComboboxList>
    </Combobox2>
  );
}

// function FruitSearch() {
//   const [phrases, setPhrases] = useState<string>("");
//   const [selected, setSelected] = useState<string>("");
//   const displayFruits = fruits.filter((f) =>
//     f.name.toLocaleLowerCase().includes(phrases)
//   );
//   return (
//     <div className="combobox-wrapper">
//       <Combobox
//         name="fruits"
//         className="combobox"
//         placeholder="🔍 Search for a fruit"
//         selectedItem={selected}
//         onChange={(value) => setPhrases(value.toLocaleLowerCase())}
//         onSelect={(value) => setSelected(displayFruits[value].name)}
//       >
//         {displayFruits.map((fruit) => (
//           <li key={fruit.id}>
//             <span>{fruit.icon}</span>
//             <span>{fruit.name}</span>
//           </li>
//         ))}
//       </Combobox>
//     </div>
//   );
// }
