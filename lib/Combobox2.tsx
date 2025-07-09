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

const voidFn = () => {};

const initialComboboxContext = {
  name: "",
  listId: "",
  labelId: "",
  inputId: "",
  isOpen: false,
  childrenCount: 0,
  selectedValue: "",
  highlightedIndex: -1,
  toggleOpen: voidFn,
  selectOption: voidFn,
  setInputValue: voidFn,
  onOptionSelected: voidFn,
  setChildrenCount: voidFn,
  setHighlightedIndex: voidFn,
};

const ComboboxContext = createContext(initialComboboxContext);

interface ComboboxProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  selectedValue?: string;
  children?: React.ReactNode;
  // 👉 onOptionSelected can return a boolean value (true) to prevent closing the dropdown.
  onOptionSelected?: (index: number, isEmptyOption: boolean) => boolean | void;
}

export function Combobox(props: ComboboxProps) {
  const { name, onOptionSelected, children, selectedValue, ...rest } = props;
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
    [name, isOpen, selectedValue, childrenCount, highlightedIndex]
  );

  function selectOption(index: number) {
    const list = document.getElementById(combobox.listId);
    const input = document.getElementById(combobox.inputId) as HTMLInputElement;
    const isEmptyOption = Boolean(
      (list?.children[index] as HTMLElement).dataset.emptyOption
    );

    if (input) {
      input.focus();
      input.value = selectedValue || "";
    }

    if (typeof onOptionSelected === "function") {
      // Do not close dropdonw list if onOptionSelected returns "true".
      if (onOptionSelected(index, isEmptyOption)) {
        return;
      }
    }

    toggleOpen(false);
    setHighlightedIndex(-1);
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
      </div>
    </ComboboxContext.Provider>
  );
}

export const ComboboxInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  const { onKeyDown, onFocus, onInput, onClick, ...rest } = props;
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
  } = useContext(ComboboxContext);

  const activeDescendant =
    isOpen && highlightedIndex >= 0
      ? `${name}-option-${highlightedIndex}`
      : undefined;

  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  function activateList(event) {
    childrenCount > 0 && !isOpen && toggleOpen(true);

    // Forwaerd events to parent handlers.
    if (event.type === "input" && onInput) {
      onInput(event);
    } else if (event.type === "focus" && onFocus) {
      onFocus(event);
    } else if (event.type === "click" && onClick) {
      onClick(event);
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    const { key } = event;
    const count = childrenCount;

    // On no results allow only Escape & Tab.
    if (!count && !["Escape", "Tab"].includes(key)) return;

    switch (key) {
      case "ArrowDown":
        event.preventDefault();
        if (!isOpen && count > 0) {
          toggleOpen(true);
          setHighlightedIndex(0);
        } else {
          setHighlightedIndex((prev) => (prev + 1) % count);
        }
        break;
      case "ArrowUp":
        event.preventDefault();
        if (!isOpen) return;
        setHighlightedIndex((prev) => (prev - 1 + count) % count);
        break;
      case "Enter":
        event.preventDefault();
        if (isOpen && highlightedIndex >= 0) {
          selectOption(highlightedIndex);
        }
        break;
      case "Escape":
        event.preventDefault();
        toggleOpen(false);
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

  // Set full name of selected item in input field.
  useEffect(() => {
    if (typeof selectedValue === "string" && inputRef.current) {
      inputRef.current.value = selectedValue;
    }
  }, [selectedValue]);

  return (
    <input
      {...rest}
      type="text"
      name={name}
      id={inputId}
      ref={inputRef}
      role="combobox"
      autoComplete="off"
      aria-expanded={isOpen}
      aria-controls={listId}
      aria-autocomplete="list"
      aria-labelledby={labelId}
      aria-activedescendant={activeDescendant}
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
  } = useContext(ComboboxContext);

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
