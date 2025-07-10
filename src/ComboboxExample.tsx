import { useState } from "react";
import {
  Combobox,
  ComboboxInput,
  ComboboxList,
  ComboboxItem,
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
  const [phrase, setPhrase] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<string>("");
  const displayFruits = initFruits.filter((f) =>
    f.name.toLocaleLowerCase().includes(phrase)
  );

  // const selectOption = (index: ComboboxSlection) => {
  //   setSelectedValue(displayFruits[index]?.name || "");
  // };

  return (
    <Combobox
      name="basic"
      className="bearbone-combobox"
      selectedValue={selectedValue}
      // onOptionSelected={selectOption}
    >
      <ComboboxInput
        onChange={(event) => setPhrase(event.target.value.toLocaleLowerCase())}
      />
      <ComboboxList>
        {displayFruits.map((fruit) => (
          <li key={fruit.id}>{fruit.name}</li>
        ))}
      </ComboboxList>
    </Combobox>
  );
}

export default function ComboboxExample() {
  const [fruits, setFruits] = useState<Fruit[]>(initFruits);
  const [phrase, setPhrase] = useState<string>("");
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
        onOptionSelected={selectFruit}
        selectedValue={selected?.name || ""}
        submitValue={!selected ? undefined : selected.id}
      >
        <div className="combobox-rail">
          <ComboboxInput
            className="combobox-input"
            placeholder="🔍 Search for a fruit"
            onChange={(event) =>
              setPhrase(event.target.value.toLocaleLowerCase())
            }
          />
          <span className="combobox-icon">
            {!selected ? "🌚" : selected.icon}
          </span>
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
      <div>
        <br />
        <button type="submit">Send form</button>
      </div>
    </form>
  );
}
