import {
  useRef,
  useState,
  Children,
  cloneElement,
  isValidElement,
} from "react";
import { getFocusableNodes } from "./utils";

// Types.
import type { CSSProperties } from "react";

type MenuPosition = "tl" | "tr" | "bl" | "br";

interface MenuPopupProps {
  name: string;
  position?: MenuPosition;
  children: React.ReactNode;
  allowInsideClick?: boolean;
}

interface ButtonProps {
  className?: string;
  [key: string]: any;
}

interface DialogProps {
  className?: string;
  [key: string]: any;
  ref?: React.Ref<HTMLDialogElement>;
}

export function PopupMenu(props: MenuPopupProps) {
  const { name, children, position = "bl", allowInsideClick = false } = props;
  const [isOpnen, setIsOpen] = useState<boolean>(false);
  const ref = useRef<HTMLDialogElement>(null);
  const menuItems = useRef<Element[]>([]);
  const index = useRef<number>(0);

  const pmId = `sui-pm-${name}`;

  if (Children.count(children) !== 2) {
    console.error("MenuPopup must have 2 children <button/> and <dialog/>.");
    return null;
  }

  const catchDialogClicks = (event: React.MouseEvent<HTMLElement>) => {
    !allowInsideClick && ref.current && ref.current.hidePopover();

    if ((event.target as HTMLElement).matches("button[data-close]")) {
      ref.current && ref.current.hidePopover();
    }
  };

  const catchKeyboard = (event: React.KeyboardEvent<HTMLDialogElement>) => {
    // Handle Tab & Arrow Down.
    if ((event.key === "Tab" && !event.shiftKey) || event.key === "ArrowDown") {
      event.preventDefault();
      index.current = (index.current + 1) % menuItems.current.length;
      (menuItems.current[index.current] as HTMLElement)?.focus();
    }

    // Handle Arrow Up.
    else if (
      (event.key === "Tab" && event.shiftKey) ||
      event.key === "ArrowUp"
    ) {
      event.preventDefault();
      index.current =
        (index.current - 1 + menuItems.current.length) %
        menuItems.current.length;
      (menuItems.current[index.current] as HTMLElement)?.focus();
    }
  };

  // Missing ToogleEvent in types.
  const onMenuToggle = (event: { newState: "open" | "closed" }) => {
    setIsOpen(event.newState === "open");
    menuItems.current = getFocusableNodes(ref.current);
    index.current = 0;
  };

  return Children.map(children, (child, index) => {
    const IS_BUTTON =
      index === 0 && isValidElement(child) && child.type === "button";

    const IS_DAILOG =
      index === 1 && isValidElement(child) && child.type === "dialog";

    // Render Trigger Button.
    if (IS_BUTTON) {
      const button = child as React.ReactElement<ButtonProps>;
      return cloneElement(button, {
        popoverTarget: pmId,
        "aria-controls": pmId,
        "aria-haspopup": "menu",
        "aria-expanded": isOpnen,
        style: { "--sui-anchor-name": `--${pmId}` } as CSSProperties,
        className: `sui-anchor-button ${button.props.className ?? ""}`,
      });
    }
    // Render Menu.
    else if (IS_DAILOG) {
      const dialog = child as React.ReactElement<DialogProps>;
      return cloneElement(dialog, {
        ref,
        id: pmId,
        role: "menu",
        popover: "auto",
        onToggle: onMenuToggle,
        onKeyDown: catchKeyboard,
        onClick: catchDialogClicks,
        className: `sui-anchor-menu ${position} ${
          dialog.props.className ?? ""
        }`,
        style: { "--sui-anchor-name": `--${pmId}` } as CSSProperties,
      });
    }

    // Exit.
    else {
      console.error("MenuPopup must have 2 children <button/> and <dialog/>.");
      return null;
    }
  });
}
