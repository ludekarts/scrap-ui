import { useState } from "react";

import { Combobox, ComboboxInput, ComboboxList } from "@ludekarts/scrap-ui";

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

export default function ComboboxExample() {
  const [fruits, setFruits] = useState<Fruit[]>(initFruits);
  const [phrase, setPhrase] = useState<string>("");
  const [selected, setSelected] = useState<Fruit | null>(null);
  const displayFruits = fruits.filter((f) =>
    f.name.toLocaleLowerCase().includes(phrase)
  );

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

  const selectFruit = (index: number, isEmptyOption: boolean) => {
    if (isEmptyOption) {
      addFruit();
    } else {
      setPhrase("");
      setSelected(displayFruits[index]);
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
          {displayFruits.map((fruit) => (
            <li key={fruit.id}>
              <span>{fruit.icon}</span>
              <span>{fruit.name}</span>
            </li>
          ))}
          <li data-empty-option="true">
            <span>➕</span>
            <span>Add new fruit</span>
          </li>
        </ComboboxList>
      </Combobox>
      <div>
        <br />
        <button type="submit">Send form</button>
      </div>
    </form>
  );
}
