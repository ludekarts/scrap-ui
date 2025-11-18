import { useState, useEffect } from "react";

import {
  Combobox,
  ComboboxList,
  ComboboxItem,
  ComboboxInput,
} from "../../../lib/Combobox";

import type { ComboboxSlection } from "../../../lib/Combobox";
import type { Fruit } from "./index";

interface ExampleProps {
  onSubmit: (data: any) => void;
  fruits: Fruit[];
}

export default function BasicComboboxExample(props: ExampleProps) {
  const { onSubmit, fruits } = props;

  const [fruitsNames] = useState<string[]>(fruits.map((f) => f.name));
  const [phrase, setPhrase] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<string>();

  const selectOption = (value: ComboboxSlection) => {
    setSelectedValue(fruitsNames.find((f) => f === value));
  };

  return (
    <form onSubmit={onSubmit} className="flex items-end gap-2">
      <div>
        <label className="px-1" htmlFor="basicFruitPicker">
          Basic Fruit Picker
        </label>
        <Combobox
          id="basicFruitPicker"
          name="basic"
          label="basic-label"
          className="relative"
          selectedValue={selectedValue}
          onOptionSelected={selectOption}
        >
          <ComboboxInput
            data-tw="true"
            className="rounded-lg bg-white p-2 focus:outline-2"
            onChange={(event) =>
              setPhrase(event.target.value.toLocaleLowerCase())
            }
          />
          <ComboboxList className="absolute my-1 w-40 rounded-lg bg-white p-2 shadow-lg empty:hidden">
            {fruitsNames
              .filter((f) => f.toLocaleLowerCase().includes(phrase))
              .map((fruit) => (
                <ComboboxItem
                  key={fruit}
                  value={fruit}
                  className="cursor-pointer hover:underline aria-selected:underline"
                >
                  {fruit}
                </ComboboxItem>
              ))}
          </ComboboxList>
        </Combobox>
      </div>
      <button type="submit" className="p-2">
        ↗️
      </button>
    </form>
  );
}
