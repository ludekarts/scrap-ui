import React, {
  useRef,
  Children,
  useState,
  useEffect,
  useContext,
  cloneElement,
  createContext,
  useImperativeHandle,
  useMemo,
} from "react";

const voidFn = () => {};

const initialComboboxContext = {
  name: "",
  listId: "",
  labelId: "",
  inputId: "",
  isOpen: false,
  inputValue: "",
  selectedItem: "",
  childrenCount: 0,
  highlightedIndex: -1,
  onChange: voidFn,
  toggleOpen: voidFn,
  selectOption: voidFn,
  setInputValue: voidFn,
  setChildrenCount: voidFn,
  setHighlightedIndex: voidFn,
};

const ComboboxContext = createContext(initialComboboxContext);

interface ComboboxProps {
  name: string;
  className?: string;
  placeholder?: string;
  selectedItem?: string;
  listClassName?: string;
  children?: React.ReactNode;
  onChange?: (phrase: string) => void;
  onSelect?: (index: number, isEmptyNode: boolean) => boolean | void;
}

export const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(
  (props, ref) => {
    const { name, onSelect, onChange, children, selectedItem, ...rest } = props;
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [isOpen, toggleOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const [childrenCount, setChildrenCount] = useState(0);
    // const [inputValue, setInputValue] = useState(selectedItem || "");
    // const inputRef = useRef<HTMLInputElement>(null);

    const combobox = useMemo(
      () => ({
        name,
        isOpen,
        selectedItem,
        childrenCount,
        highlightedIndex,
        listId: `${name}-list`,
        labelId: `${name}-label`,
        inputId: `${name}-input`,
        onChange,
        toggleOpen,
        selectOption,
        setChildrenCount,
        setHighlightedIndex,
      }),
      [name, isOpen, selectedItem, childrenCount, highlightedIndex, onChange]
    );

    // useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    // Function to select an option by index.

    function selectOption(index: number) {
      // const isEmptyNode = Boolean(
      //   (listboxRef.current?.children[index] as HTMLElement).dataset.emptyNode
      // );
      // inputRef.current?.focus();

      // if (typeof onSelect === "function") {
      //   // Do not close dropdonw list if onSelect returns true.
      //   if (onSelect(index, isEmptyNode)) {
      //     return;
      //   }
      // }

      alert(`Selected index: ${index}`);

      toggleOpen(false);
      setHighlightedIndex(-1);
    }

    function handleItemCLick(event: React.MouseEvent<HTMLElement>) {
      const target = event.target as HTMLElement;
      if (target.role === "option") {
        const selectIndex = Number(target.dataset.index);
        selectOption(selectIndex);
      }
    }

    function handleOutsideClick(event: MouseEvent) {
      containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        toggleOpen(false);
    }

    // Set full name of selected item in input field.
    useEffect(() => {
      typeof selectedItem === "string" && setInputValue(selectedItem);
    }, [selectedItem]);

    // Handle clicks outside to close
    useEffect(() => {
      document.addEventListener("mousedown", handleOutsideClick);
      return () =>
        document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    return (
      <ComboboxContext.Provider value={combobox}>
        <div {...rest} ref={containerRef} onClick={handleItemCLick}>
          {children}
        </div>
      </ComboboxContext.Provider>
    );
  }
);

Combobox.displayName = "Combobox";

export const ComboboxInput = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>((props, ref) => {
  const { onKeyDown, onFocus, ...rest } = props;
  const {
    name,
    isOpen,
    listId,
    labelId,
    inputId,
    childrenCount,
    highlightedIndex,
    toggleOpen,
    selectOption,
    setHighlightedIndex,
  } = useContext(ComboboxContext);

  const activedescendant =
    isOpen && highlightedIndex >= 0
      ? `${name}-option-${highlightedIndex}`
      : undefined;

  function handleInputFocus(event: React.FocusEvent<HTMLInputElement>) {
    if (event.target.matches("input") && childrenCount > 0) {
      toggleOpen(true);
    }
    onFocus?.(event);
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
        // Close on tab out
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

  return (
    <input
      {...rest}
      ref={ref}
      type="text"
      name={name}
      id={inputId}
      role="combobox"
      autoComplete="off"
      aria-expanded={isOpen}
      aria-controls={listId}
      aria-autocomplete="list"
      aria-labelledby={labelId}
      aria-activedescendant={activedescendant}
      onKeyDown={handleKeyDown}
      onFocus={handleInputFocus}
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
    inputValue,
    selectedItem,
    childrenCount,
    highlightedIndex,
    toggleOpen,
    setChildrenCount,
  } = useContext(ComboboxContext);

  // Scroll highlighted item into view.
  useEffect(() => {
    if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
      const optionElement = listboxRef.current.children[highlightedIndex];
      optionElement?.scrollIntoView({ block: "nearest" });
    }
  }, [highlightedIndex, isOpen]);

  // Keep open if typing and results exist.
  useEffect(() => {
    if (
      !isOpen &&
      childrenCount > 0 &&
      inputValue.length > 0 &&
      inputValue !== selectedItem
    ) {
      toggleOpen(true);
    }
  }, [inputValue]);

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
