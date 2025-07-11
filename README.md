# Scrap UI

![Scrap UI Logo](./assets/scarp_ui_logo.svg)

A collection of various React UI components

## Installation

```
pnpm add @ludekarts/scrap-ui
```

## Components

### Combobox

Set of accessible primitives to craft a combobox experience that allows users to search and select an option from a dropdown list.

#### Usage

```tsx
import { Combobox, ComboboxList, ComboboxInput, ComboboxItem } from "@ludekarts/scrap-ui";
...

const fruits = ["apple", ...];

function CustomCombobox() {
  const [phrase, setPhrase] = useState<string>("");
  const [selectedValue, setSelectedValue] = useState<string>();

  const selectOption = (value: ComboboxSlection) => {
    setSelectedValue(fruits.find((f) => f === value));
  };

  return(
    <Combobox
      name="basic"
      label="List of fruits"
      selectedValue={selectedValue}
      onOptionSelected={selectOption}
    >
      <ComboboxInput
        onChange={(event) => setPhrase(event.target.value.toLocaleLowerCase())}
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
  );
}
```

#### Combobox components breakdown

- **Combobox** - Main wrapper component for the combobox functionality

  - `name: string` - Unique identifier for the combobox, used for form submission and accessibility.
  - `label?: string` - Optional label for the combobox, can be an ID for a `<label/>` element (when starts with `#`) or regular string description.
  - `selectedValue?: string` - Value that represents the currently selected option (set outside of the Combobox).
  - `submitValue?: string` - Value other than _selectedValue_ to be assigned to the combobox input for form submission.
  - `children?: ReactNode` - Child components that make up the combobox, typically including `ComboboxInput`, `ComboboxList`, and `ComboboxItem`.
  - `onOptionSelected?: fn` - Callback function that is called when an option is selected. It can return a boolean value (`true`) to prevent closing the dropdown.

- **ComboboxInput** - Input field for user search and interaction
  - `onChange?: fn` - Callback function that is called when the input value changes. It receives the input event as an argument.
- **ComboboxList** - Container for the dropdown list of options
  - `children?: ReactNode` - Child components that represent the individual options in the dropdown.
- **ComboboxItem** - Individual selectable option in the dropdown list
  - `value: string` - Value of the option that will be passed to `onOptionSelected()`.
  - `empty?: boolean` - Mark the item as empty, which will repost `null` as a selected value.

---

### Dialog

Helper for creating Acceisible Dialogs (modals) with imperative controller.

#### Usage

```tsx
import { createDialog } from "@ludekarts/scrap-ui";
...

const [Dialog, dialogController] = createDialog({ animate: true });
...

function CustomDialog() {
  return(
    <main>
    <button onClick={() => dialogController.open()}>Open Dialog</button>

    <Dialog noDismiss>
      <h2>Hello, this is a dialog!</h2>
      <p>You can put any content here.</p>
      <button onClick={dialogController.close}>Close</button>
    </Dialog>
    </main>
  );
}
```

### PopupMenu

...

### Show

...
