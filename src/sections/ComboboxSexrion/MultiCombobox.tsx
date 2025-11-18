import { useState, useEffect } from "react";

import {
  Combobox,
  ComboboxList,
  ComboboxItem,
  ComboboxInput,
} from "../../../lib/Combobox";

import type { ComboboxSlection } from "../../../lib/Combobox";

type MultiComboboxProps = {
  name: string;
  label?: string;
  reset?: number;
  required?: boolean;
  source?: string[] | null;
};

export default function MultiCombobox(props: MultiComboboxProps) {
  const { name, source, label, reset, required = false } = props;

  // TODO: implement "required" validation.

  const [collection, setCollection] = useState<string[]>([]);
  const [submitValue, setSubmitValue] = useState<string>("");
  const [value, setValue] = useState<string>("");

  const updateValue = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.currentTarget.value.toLocaleLowerCase());
  };

  const traceBckspace = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace" && !value) {
      setCollection((prev) => prev.slice(0, -1));
    } else if (event.key === "Enter") {
      event.preventDefault();
    }
  };

  const selectItem = (item: ComboboxSlection) => {
    if (item) {
      if (collection.includes(item as string)) return;
      setCollection((prev) => [...prev, item as string]);
      setValue("");
    }
  };

  const removeItem = (event: React.MouseEvent<HTMLButtonElement>) => {
    const item = event.currentTarget.dataset.index;
    setCollection((prev) => prev.filter((i) => i !== item));
  };

  useEffect(() => {
    if (collection.length) {
      setSubmitValue(collection.join("|"));
    }
  }, [collection]);

  useEffect(() => {
    if (reset) {
      setValue("");
      setCollection([]);
      setSubmitValue("");
    }
  }, [reset]);

  return (
    <Combobox
      name=""
      label={label}
      required={required}
      className="relative w-72 p-2"
      onOptionSelected={selectItem}
    >
      <div className="flex flex-wrap items-center gap-1">
        {!collection.length
          ? null
          : collection.map((item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 rounded-full bg-black py-0.5 pr-1 pl-2 text-sm text-white uppercase"
              >
                {item}
                <button
                  type="button"
                  data-tw="true"
                  data-index={item}
                  onClick={removeItem}
                  className="flex size-5 cursor-pointer items-center justify-center rounded-full"
                >
                  ✕
                </button>
              </span>
            ))}
        <ComboboxInput
          data-tw="true"
          onChange={updateValue}
          onKeyDown={traceBckspace}
          className="ml-1 border-none outline-none"
        />
        <input type="hidden" name={name} value={submitValue} />
      </div>
      <ComboboxList className="absolute -right-10 left-0 z-10 mt-4 max-h-80 overflow-auto rounded-md border-2 bg-white p-2 shadow-lg empty:hidden">
        {!source
          ? null
          : source
              .filter((f) => f.toLocaleLowerCase().includes(value))
              .map((item) => (
                <ComboboxItem
                  key={item}
                  value={item.toString()}
                  className="aria-selected:bg-sui-yellow cursor-pointer truncate rounded p-2 capitalize"
                >
                  {item}
                </ComboboxItem>
              ))}
      </ComboboxList>
    </Combobox>
  );
}
