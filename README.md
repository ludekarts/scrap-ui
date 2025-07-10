# Scrap UI

<div align="center">
  <img src="./assets/scarp_ui_logo.svg" alt="Scrap UI Logo" width="150"/>
  <p>A collection of various React UI components.</p>
</div>

## Installation

```
pnpm add @ludekarts/scrap-ui
```

## Components

### Combobox

Set of accessible primitives to craft a combobox experience that allows users to search and select an option from a dropdown list.

#### Usage

```tsx
import { Combobox, ComboboxList, ComboboxInput } from "@ludekarts/scrap-ui";
...

const [Dialog, dialogController] = createDialog({ animate: true });
...


function CustomCombobox() {

  return(
    <Combobox name="fruit">
      <ComboboxInput onChange={(event) => setPhrase(event.target.value.toLocaleLowerCase())}/>
      <ComboboxList>
        {displayFruits.map((fruit) => (
          <li key={fruit.id}>{fruit.name}</li>
        ))}
      </ComboboxList>
    </Combobox>
  );
}

```

### Dialog

### PopupMenu

### Show
