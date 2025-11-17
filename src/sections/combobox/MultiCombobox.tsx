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
      className="relative w-full"
      onOptionSelected={selectItem}
    >
      <div className="border-cm-dark-blue/30 outline-cm-orange focus:border-cm-orange flex w-full flex-wrap gap-2 rounded-md border-2 bg-white p-2">
        {!collection.length
          ? null
          : collection.map((item) => (
              <span
                key={item}
                className="bg-cm-orange flex h-6 items-center gap-2 truncate rounded-full pr-1 pl-2 text-xs font-semibold capitalize"
              >
                {item}
                <button
                  type="button"
                  data-index={item}
                  onClick={removeItem}
                  className="shrink-0 rounded-full bg-black/10 text-white"
                >
                  x
                </button>
              </span>
            ))}
        <ComboboxInput
          data-tw="true"
          onChange={updateValue}
          onKeyDown={traceBckspace}
          className="w-1 shrink grow basis-auto border-none outline-none"
        />
        <input type="hidden" name={name} value={submitValue} />
      </div>
      <ComboboxList className="border-cm-dark-blue/30 absolute z-10 mt-2 max-h-80 w-full overflow-auto rounded-md border bg-white p-2 shadow-lg empty:hidden">
        {!source
          ? null
          : source
              .filter((f) => f.toLocaleLowerCase().includes(value))
              .map((item) => (
                <ComboboxItem
                  key={item}
                  value={item.toString()}
                  className="hover:bg-cm-orange/80 aria-selected:bg-cm-orange cursor-pointer truncate rounded p-2 capitalize"
                >
                  {item}
                </ComboboxItem>
              ))}
      </ComboboxList>
    </Combobox>
  );
}
