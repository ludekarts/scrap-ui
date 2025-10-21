import { useRef, Children, cloneElement, isValidElement } from "react";
import type { CSSProperties } from "react";

type Position = "tl" | "tr" | "bl" | "br";

interface MenuPopupProps {
  name: string;
  position?: Position;
  children: React.ReactNode;
  keepOnInsideClick?: boolean;
}

interface ButtonProps {
  className?: string;
  [key: string]: any;
}

interface DialogProps {
  className?: string;
  ref?: React.Ref<HTMLDialogElement>;
  [key: string]: any;
}

export function PopupMenu(props: MenuPopupProps) {
  const { name, children, keepOnInsideClick = false, position = "bl" } = props;
  const ref = useRef<HTMLDialogElement>(null);

  if (Children.count(children) !== 2) {
    console.error("MenuPopup must have 2 children <button/> and <dialog/>.");
    return null;
  }

  const catchClicks = () => {
    !keepOnInsideClick && ref.current && ref.current.hidePopover();
  };

  return Children.map(children, (child, index) => {
    if (index === 0 && isValidElement(child) && child.type === "button") {
      const button = child as React.ReactElement<ButtonProps>;
      return cloneElement(button, {
        popoverTarget: name,
        className: `sui-anchor-button ${button.props.className ?? ""}`,
        style: { "--sui-anchor-name": `--sui-pm-${name}` } as CSSProperties,
      });
    } else if (
      index === 1 &&
      isValidElement(child) &&
      child.type === "dialog"
    ) {
      const dialog = child as React.ReactElement<DialogProps>;
      return cloneElement(dialog, {
        ref,
        id: name,
        popover: "auto",
        onClick: catchClicks,
        className: `sui-anchor-menu ${position} ${
          dialog.props.className ?? ""
        }`,
        style: { "--sui-anchor-name": `--sui-pm-${name}` } as CSSProperties,
      });
    } else {
      console.error("MenuPopup must have 2 children <button/> and <dialog/>.");
      return null;
    }
  });
}
