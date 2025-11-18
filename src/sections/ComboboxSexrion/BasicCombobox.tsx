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

  const handleSubmission = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData.entries());
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmission} className="flex items-end gap-2">
      <div>
        <label className="px-1" htmlFor="basicFruitPicker">
          Basic Fruit Picker
        </label>
        <Combobox
          className="relative"
          selectedValue={selectedValue}
          onOptionSelected={selectOption}
        >
          <ComboboxInput
            required
            name="fruit"
            data-tw="true"
            id="basicFruitPicker"
            aria-describedby="basicFruitPicker-desc"
            className="peer rounded-lg bg-white p-2 outline-2 outline-transparent user-invalid:outline-red-600 focus:outline-2"
            onChange={(event) =>
              setPhrase(event.target.value.toLocaleLowerCase())
            }
          />
          <p
            aria-hidden="true"
            id="basicFruitPicker-desc"
            className="absolute mt-1 hidden rounded-md bg-red-600 px-1 text-sm text-white peer-user-invalid:block"
          >
            Field is required
          </p>
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
        Submit
      </button>
    </form>
  );
}
