import React, {
  useRef,
  Children,
  useState,
  useEffect,
  cloneElement,
  useImperativeHandle,
} from "react";

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

const Combobox = React.forwardRef<HTMLInputElement, ComboboxProps>(
  (props, ref) => {
    const {
      name,
      onSelect,
      onChange,
      children,
      className,
      placeholder,
      selectedItem,
      listClassName,
    } = props;
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [inputValue, setInputValue] = useState(selectedItem || "");
    const [isOpen, toggleOpen] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const listboxRef = useRef<HTMLUListElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const labelId = `${name}-label`;
    const inputId = `${name}-input`;
    const listboxId = `${name}-listbox`;

    useImperativeHandle(ref, () => inputRef.current as HTMLInputElement);

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setInputValue(value);
      onChange?.(value);
    };

    const handleInputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      if (event.target.matches("input") && Children.count(children) > 0) {
        toggleOpen(true);
      }
    };

    const selectOption = (index: number) => {
      const isEmptyNode = Boolean(
        (listboxRef.current?.children[index] as HTMLElement).dataset.emptyNode,
      );
      inputRef.current?.focus();

      if (typeof onSelect === "function") {
        // Do not close dropdonw list if onSelect returns true.
        if (onSelect(index, isEmptyNode)) {
          return;
        }
      }

      toggleOpen(false);
      setHighlightedIndex(-1);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      const { key } = event;
      const count = Children.count(children);

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
    };

    const handleItemCLick = (event: React.MouseEvent<HTMLElement>) => {
      const target = event.target as HTMLElement;
      if (target.role === "option") {
        const selectIndex = Number(target.dataset.index);
        selectOption(selectIndex);
      }
    };

    const handleOutsideClick = (event: MouseEvent) => {
      containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        toggleOpen(false);
    };

    useEffect(() => {
      // Keep open if typing and results exist.
      if (
        inputValue.length > 0 &&
        inputValue !== selectedItem &&
        !isOpen &&
        Children.count(children)
      ) {
        toggleOpen(true);
      }
    }, [inputValue]);

    // Scroll highlighted item into view.
    useEffect(() => {
      if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
        const optionElement = listboxRef.current.children[highlightedIndex];
        optionElement?.scrollIntoView({ block: "nearest" });
      }
    }, [highlightedIndex, isOpen]);

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
      <div
        ref={containerRef}
        onClick={handleItemCLick}
        style={{ position: "relative" }}
      >
        <input
          type="text"
          name={name}
          id={inputId}
          ref={inputRef}
          value={inputValue}
          className={className}
          placeholder={placeholder}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          onChange={handleInputChange}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-labelledby={labelId}
          aria-activedescendant={
            isOpen && highlightedIndex >= 0
              ? `${name}-option-${highlightedIndex}`
              : undefined
          }
        />
        {
          <ul
            role="listbox"
            id={listboxId}
            ref={listboxRef}
            aria-labelledby={labelId}
            className={listClassName}
            style={{ position: "absolute", width: "100%" }}
            // No need for 'hidden' attribute if conditionally rendered.
          >
            {isOpen &&
              Children.map(children, (child, index) =>
                child === null
                  ? null
                  : cloneElement(child as React.ReactElement<any>, {
                      role: "option",
                      id: `${name}-option-${index}`,
                      "data-index": index,
                      "aria-selected": index === highlightedIndex,
                    }),
              )}
          </ul>
        }
      </div>
    );
  },
);

Combobox.displayName = "Combobox";
export default Combobox;
