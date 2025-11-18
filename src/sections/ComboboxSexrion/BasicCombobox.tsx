import { useState, useEffect } from "react";

import {
  Combobox,
  ComboboxList,
  ComboboxItem,
  ComboboxInput,
} from "../../../lib/Combobox";

import type { ComboboxSlection } from "../../../lib/Combobox";

function BasicCombobox() {
  const [fruits] = useState<string[]>(initFruits.map((f) => f.name));
  const [phrase, setPhrase] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<string>();

  const selectOption = (value: ComboboxSlection) => {
    setSelectedValue(fruits.find((f) => f === value));
  };

  return (
    <div>
      <label id="basic-label" htmlFor="basic-input">
        Bearbone Fruits Picker
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
