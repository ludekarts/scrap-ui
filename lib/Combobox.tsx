import React, {
  useId,
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
  listId: string;
  isOpen: boolean;
  childrenCount: number;
  selectedValue?: string;
  highlightedIndex: number;
  toggleOpen: (open: boolean) => void;
  selectOption: (index: number) => void;
  setChildrenCount: (count: number) => void;
  setHighlightedIndex: (index: number | ((prev: number) => number)) => void;
}

const ComboboxContext = createContext<ComboboxContextProps | undefined>(
  undefined,
);

function useComboboxContext() {
  const context = useContext(ComboboxContext);
  if (!context) {
    throw new Error("useComboboxContext must be used within a Provider");
  }
  return context;
}

export interface ComboboxProps extends React.HTMLAttributes<HTMLDivElement> {
  selectedValue?: string;
  children?: React.ReactNode;
  // 👉 onOptionSelected can return a boolean value (true) to prevent closing the dropdown.
  onOptionSelected?: (
    value: ComboboxSelection,
    isEmptyOption: boolean,
  ) => boolean | void;
}

export type ComboboxSelection = string | number | null;

export function Combobox(props: ComboboxProps) {
  const { children, selectedValue = "", onOptionSelected, ...rest } = props;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isOpen, toggleOpen] = useState(false);
  const [childrenCount, setChildrenCount] = useState(0);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const listId = useId();

  const combobox = useMemo(
    () => ({
      isOpen,
      listId,
      selectedValue,
      childrenCount,
      highlightedIndex,
      toggleOpen,
      selectOption,
      setChildrenCount,
      setHighlightedIndex,
    }),
    [isOpen, selectedValue, childrenCount, highlightedIndex, onOptionSelected],
  );

  function selectOption(index: number) {
    const list = document.getElementById(combobox.listId);
    const input = document.querySelector(
      `[aria-owns="${combobox.listId}"]`,
    ) as HTMLInputElement | null;

    if (!input) {
      return;
    }

    input.focus();
    input.value = index === -1 ? "" : selectedValue || "";

    if (typeof onOptionSelected === "function") {
      const [value, isEmpty] = getSelectedValue(list, listId, index);

      // Do not close dropdown list if onOptionSelected() returns "true".
      if (onOptionSelected(value, isEmpty)) {
        return;
      }
    }

    if (index === -1) {
      setHighlightedIndex(-1);
      return;
    }

    toggleOpen(false);
    setHighlightedIndex(-1);
  }

  function handleOutsideClick(event: MouseEvent) {
    containerRef.current &&
      !containerRef.current.contains(event.target as Node) &&
      toggleOpen(false);
  }

  // Handle clicks outside to close.
  useEffect(() => {
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Open list when it has any children.
  useEffect(() => {
    childrenCount > 0 && isOpen && toggleOpen(true);
  }, [childrenCount, isOpen]);

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
  const { onKeyDown, onKeyUp, onFocus, onInput, onClick, ...rest } = props;
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    isOpen,
    listId,
    selectedValue,
    childrenCount,
    highlightedIndex,
    toggleOpen,
    selectOption,
    setHighlightedIndex,
  } = useComboboxContext();

  const activeDescendant =
    isOpen && highlightedIndex >= 0
      ? `${listId}-option-${highlightedIndex}`
      : undefined;

  useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

  function activateList(
    event:
      | React.FocusEvent<HTMLInputElement>
      | React.MouseEvent<HTMLInputElement>
      | React.KeyboardEvent<HTMLInputElement>,
  ) {
    childrenCount > 0 && !isOpen && toggleOpen(true);

    // Forward events to parent handlers.
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
    if (!childrenCount && !["Escape", "Tab"].includes(key)) {
      onKeyDown?.(event);
      return;
    }

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
            : (prev - 1 + childrenCount) % childrenCount,
        );
        break;

      case "Enter":
        event.stopPropagation();
        event.preventDefault();
        // Accept the highlighted option.
        if (isOpen && highlightedIndex >= 0) {
          selectOption(highlightedIndex);
          return;
        }
        break;

      case "Escape":
        if (isOpen) {
          // Prevent default behavior only when the list is open to not conflict
          // with other components like Dialog that may also listen to Escape key.
          event.stopPropagation();
          event.preventDefault();
        }

        toggleOpen(false);
        setHighlightedIndex(-1);
        // Reset input value to selected value.
        if (selectedValue && inputRef.current) {
          inputRef.current.value = selectedValue;
        }
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
      ref={inputRef}
      role="combobox"
      autoComplete="off"
      aria-owns={listId}
      aria-expanded={isOpen}
      aria-controls={listId}
      aria-haspopup="listbox"
      aria-autocomplete="list"
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
  const { isOpen, listId, highlightedIndex, selectOption, setChildrenCount } =
    useComboboxContext();

  function handleItemClick(event: React.MouseEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    if (target.role === "option") {
      const selectIndex = Number(target.id.split("-").pop());
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
      onClick={handleItemClick}
    >
      {Children.map(children, (child, index) =>
        child === null
          ? null
          : cloneElement(child as React.ReactElement<any>, {
              role: "option",
              id: `${listId}-option-${index}`,
              "aria-selected": index === highlightedIndex,
            }),
      )}
    </ul>
  );
}

interface ComboboxItemProps extends React.LiHTMLAttributes<HTMLLIElement> {
  value?: string | number | undefined;
  empty?: boolean;
}

export function ComboboxItem(props: ComboboxItemProps) {
  const { children, value, empty = false, ...rest } = props;

  if (!isItemValue(value)) {
    throw new Error("ComboboxItem value must be a string or number when set.");
  }

  return (
    <li
      {...rest}
      {...(empty ? { "data-empty-option": true } : {})}
      data-cbx-value={value}
    >
      {children}
    </li>
  );
}

// ---- Helpers ----------------

function getSelectedValue(
  list: HTMLElement | null,
  listId: string,
  index: number,
): [ComboboxSelection, boolean] {
  if (!list) return [null, false];
  const item = list?.querySelector(`#${listId}-option-${index}`);
  if (!item) return [null, false];
  const value = (item as HTMLElement).dataset.cbxValue || null;
  const isEmpty = item.hasAttribute("data-empty-option");
  return [value, isEmpty];
}

function isItemValue(value: unknown): boolean {
  return (
    value === undefined ||
    typeof value === "string" ||
    typeof value === "number"
  );
}
