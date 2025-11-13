import { useState } from "react";
import {
  Combobox,
  ComboboxList,
  ComboboxItem,
  ComboboxInput,
} from "@ludekarts/scrap-ui";

import type { ComboboxSlection } from "@ludekarts/scrap-ui";

type Fruit = {
  id: string;
  name: string;
  icon: string;
};

const initFruits: Fruit[] = [
  { id: "1", name: "Apple", icon: "🍎" },
  { id: "2", name: "Banana", icon: "🍌" },
  { id: "3", name: "Cherry", icon: "🍒" },
  { id: "4", name: "Coconut", icon: "🥥" },
  { id: "5", name: "Watermelon", icon: "🍉" },
  { id: "6", name: "Orange", icon: "🍊" },
  { id: "7", name: "Grape", icon: "🍇" },
  { id: "8", name: "Strawberry", icon: "🍓" },
];

export function BearboneComboboxExample() {
  const [fruits] = useState<string[]>(initFruits.map((f) => f.name));
  const [phrase, setPhrase] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<string>();

  const selectOption = (value: ComboboxSlection) => {
    setSelectedValue(fruits.find((f) => f === value));
  };

  return (
    <div>
      <label id="basic-label" htmlFor="basic-input">
        Fruits
      </label>
      <Combobox
        name="basic"
        label="basic-Label"
        className="bearbone-combobox"
        selectedValue={selectedValue}
        onOptionSelected={selectOption}
      >
        <ComboboxInput
          onChange={(event) =>
            setPhrase(event.target.value.toLocaleLowerCase())
          }
        />
        <ComboboxList>
          {fruits
            .filter((f) => f.toLocaleLowerCase().includes(phrase))
            .map((fruit) => (
              <ComboboxItem key={fruit} value={fruit}>
                {fruit}
              </ComboboxItem>
            ))}
        </ComboboxList>
      </Combobox>
    </div>
  );
}

export default function ComboboxExample() {
  const [fruits, setFruits] = useState<Fruit[]>(initFruits);
  const [phrase, setPhrase] = useState<string>("");
  const [isRequired, toggleRequired] = useState<boolean>(false);
  const [selected, setSelected] = useState<Fruit | null>(null);

  const addFruit = (initFruit?: string) => {
    const fruit =
      initFruit || prompt("Enter new fruit: (Format: 🍍 Pineapple)");

    if (!fruit) return;

    const [icon, fruitName] = fruit.split(" ", 2);

    if (!icon || !fruitName) {
      return alert("Invalid input. Please use the format: 🍍 Pineapple");
    }

    const newFruit: Fruit = {
      id: (fruits.length + 1).toString(),
      name: fruitName.trim(),
      icon: icon.trim(),
    };

    if (fruits.some((f) => f.name === newFruit.name)) {
      return alert("This fruit already exists.");
    }

    setFruits((fruits) => [...fruits, newFruit]);
    setSelected(newFruit);
  };

  const selectFruit = (value: ComboboxSlection, isEmptyOption: boolean) => {
    if (isEmptyOption) {
      addFruit();
    } else {
      const fruit = fruits.find((f) => f.id === value);
      if (fruit) {
        setSelected(fruit);
      } else {
        setSelected(null);
      }
    }
  };

  const showFormData = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    console.log(Object.fromEntries(data));
  };

  return (
    <form onSubmit={showFormData}>
      <Combobox
        name="fruit"
        className="combobox"
        required={isRequired}
        onOptionSelected={selectFruit}
        selectedValue={selected?.name || ""}
        submitValue={!selected ? undefined : selected.id}
      >
        <div className="combobox-rail">
          <ComboboxInput
            pattern="[a-zA-Z]+"
            className="combobox-input"
            placeholder="🔍 Search for a fruit"
            onChange={(event) =>
              setPhrase(event.target.value.toLocaleLowerCase())
            }
          />
          <span className="combobox-icon">
            {!selected ? "🌚" : selected.icon}
          </span>
          <span className="combobox-error">Only letters are allowed</span>
        </div>
        <ComboboxList className="combobox-list">
          {fruits
            .filter((f) => f.name.toLocaleLowerCase().includes(phrase))
            .map((fruit) => (
              <ComboboxItem key={fruit.id} value={fruit.id}>
                <span>{fruit.icon}</span>
                <span>{fruit.name}</span>
              </ComboboxItem>
            ))}
          <ComboboxItem empty>
            <span>➕</span>
            <span>Add new fruit</span>
          </ComboboxItem>
        </ComboboxList>
      </Combobox>
      <br />
      <div>
        <button type="button" onClick={() => toggleRequired(!isRequired)}>
          Require fruit selection: {isRequired ? "ON" : "OFF"}
        </button>
        <span> | </span>
        <button type="submit">Send form</button>
      </div>
    </form>
  );
}
