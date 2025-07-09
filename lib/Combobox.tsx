import React, {
  useRef,
  useMemo,
  Children,
  useState,
  useEffect,
  useContext,
  cloneElement,
  createContext,
  useImperativeHandle,
} from "react";

interface ComboboxContextProps {
  name: string;
  listId: string;
  isOpen: boolean;
  labelId: string;
  inputId: string;
  childrenCount: number;
  selectedValue?: string;
  highlightedIndex: number;
  toggleOpen: (open: boolean) => void;
  selectOption: (index: number) => void;
  setChildrenCount: (count: number) => void;
  setHighlightedIndex: (index: number | ((prev: number) => number)) => void;
}

const ComboboxContext = createContext<ComboboxContextProps | undefined>(
  undefined
);

function useComboboxContext() {
  const context = useContext(ComboboxContext);
  if (!context) {
    throw new Error("useComboboxContext must be used within a Provider");
  }
  return context;
}

interface ComboboxProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  selectedValue?: string;
  children?: React.ReactNode;
  // 👉 onOptionSelected can return a boolean value (true) to prevent closing the dropdown.
  onOptionSelected?: (index: number, isEmptyOption: boolean) => boolean | void;
}

export function Combobox(props: ComboboxProps) {
  const { name, children, selectedValue, onOptionSelected, ...rest } = props;
  const valueRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, toggleOpen] = useState(false);
  const [childrenCount, setChildrenCount] = useState(0);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  const combobox = useMemo(
    () => ({
      name,
      isOpen,
      selectedValue,
      childrenCount,
      highlightedIndex,
      listId: `${name}-list`,
      labelId: `${name}-label`,
      inputId: `${name}-input`,
      toggleOpen,
      selectOption,
      setChildrenCount,
      setHighlightedIndex,
    }),
    [
      name,
      isOpen,
      selectedValue,
      childrenCount,
      highlightedIndex,
      onOptionSelected,
    ]
  );

  function selectOption(index: number) {
    const DESELECT = index === -1;
    const list = document.getElementById(combobox.listId);
    const input = document.getElementById(combobox.inputId) as HTMLInputElement;
    const isEmptyOption = DESELECT
      ? false
      : Boolean((list?.children[index] as HTMLElement).dataset.emptyOption);

    if (input) {
      input.focus();
      input.value = selectedValue || "";
    }

    if (typeof onOptionSelected === "function") {
      // Do not close dropdown list if onOptionSelected() returns "true".
      if (onOptionSelected(index, isEmptyOption)) {
        return;
      }
    }

    if (!DESELECT) {
      toggleOpen(false);
      setHighlightedIndex(-1);
    }
  }

  function handleOutsideClick(event: MouseEvent) {
    containerRef.current &&
      !containerRef.current.contains(event.target as Node) &&
      toggleOpen(false);
  }

  // Handle clicks outside to close
  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  return (
    <ComboboxContext.Provider value={combobox}>
      <div {...rest} ref={containerRef}>
        {children}
        <input type="hidden" name={name} value={selectedValue} ref={valueRef} />
      </div>
    </ComboboxContext.Provider>
  );
}

export const ComboboxInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  const { onKeyDown, onKeyUp, onFocus, onInput, onClick, ...rest } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    name,
    isOpen,
    listId,
    labelId,
    inputId,
    selectedValue,
    childrenCount,
    highlightedIndex,
    toggleOpen,
    selectOption,
    setHighlightedIndex,
  } = useComboboxContext();

  const activeDescendant =
    isOpen && highlightedIndex >= 0
      ? `${name}-option-${highlightedIndex}`
      : undefined;

  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  function activateList(
    event:
      | React.FocusEvent<HTMLInputElement>
      | React.MouseEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement>
  ) {
    childrenCount > 0 && !isOpen && toggleOpen(true);

    // Forwaerd events to parent handlers.
    if (event.type === "input" && onInput) {
      onInput(event as React.FormEvent<HTMLInputElement>);
    } else if (event.type === "focus" && onFocus) {
      onFocus(event as React.FocusEvent<HTMLInputElement>);
    } else if (event.type === "click" && onClick) {
      onClick(event as React.MouseEvent<HTMLInputElement>);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const { key } = event;

    // When no results allow only for below keys.
    if (!childrenCount && !["Escape", "Tab"].includes(key)) return;

    switch (key) {
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen && childrenCount > 0) {
          toggleOpen(true);
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex((prev: number) => (prev + 1) % childrenCount);
        }
        break;

      case "ArrowUp":
        event.preventDefault();
        if (!isOpen) return;
        setHighlightedIndex((prev) =>
          prev === -1
            ? childrenCount - 1
            : (prev - 1 + childrenCount) % childrenCount
        );
        break;

      case "Enter":
        event.preventDefault();
        // Accept the highlighted option.
        if (isOpen && highlightedIndex >= 0) {
          selectOption(highlightedIndex);
          return;
        } else if (inputRef.current?.value !== selectedValue) {
          selectOption(-1);
        }
        break;

      case "Escape":
        event.preventDefault();
        toggleOpen(false);
        selectOption(-1);
        setHighlightedIndex(-1);
        break;

      case "Tab":
        // Close on tab out.
        if (isOpen && highlightedIndex >= 0) {
          event.preventDefault();
          selectOption(highlightedIndex);
        } else {
          toggleOpen(false);
          setHighlightedIndex(-1);
        }
        break;

      default:
        // Reset highlight if user types characters.
        setHighlightedIndex(-1);
        break;
    }
    onKeyDown?.(event);
  }

  function handleKeyUp(event: React.KeyboardEvent<HTMLInputElement>) {
    const { key, target } = event;

    switch (key) {
      case "Backspace":
        if ((target as HTMLInputElement).value.length === 0) {
          selectOption(-1);
        }
        break;
      case "Delete":
        if ((target as HTMLInputElement).value.length === 0) {
          selectOption(-1);
        }
        break;
    }
    onKeyUp?.(event);
  }

  // Set full value for selected item in input field.
  useEffect(() => {
    if (typeof selectedValue === "string" && inputRef.current) {
      inputRef.current.value = selectedValue;
    }
  }, [selectedValue]);

  return (
    <input
      {...rest}
      type="text"
      id={inputId}
      ref={inputRef}
      role="combobox"
      autoComplete="off"
      aria-expanded={isOpen}
      aria-controls={listId}
      aria-autocomplete="list"
      aria-labelledby={labelId}
      aria-activedescendant={activeDescendant}
      onKeyUp={handleKeyUp}
      onInput={activateList}
      onFocus={activateList}
      onClick={activateList}
      onKeyDown={handleKeyDown}
    />
  );
});

export function ComboboxList(props: React.HTMLAttributes<HTMLUListElement>) {
  const { children, ...rest } = props;
  const listboxRef = useRef<HTMLUListElement>(null);
  const {
    name,
    isOpen,
    listId,
    labelId,
    highlightedIndex,
    selectOption,
    setChildrenCount,
  } = useComboboxContext();

  function handleItemClick(event: React.MouseEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    if (target.role === "option") {
      const selectIndex = Number(target.dataset.index);
      selectOption(selectIndex);
    }
  }

  // Scroll highlighted item into view.
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
      const optionElement = listboxRef.current.children[highlightedIndex];
      optionElement?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, isOpen]);

  // Count children and update childrenCount state.
  useEffect(() => {
    setChildrenCount(Children.count(children));
  }, [children]);

  return !isOpen ? null : (
    <ul
      {...rest}
      id={listId}
      role="listbox"
      ref={listboxRef}
      aria-labelledby={labelId}
      onClick={handleItemClick}
    >
      {Children.map(children, (child, index) =>
        child === null
          ? null
          : cloneElement(child as React.ReactElement<any>, {
              role: "option",
              "data-index": index,
              id: `${name}-option-${index}`,
              "aria-selected": index === highlightedIndex,
            })
      )}
    </ul>
  );
}
