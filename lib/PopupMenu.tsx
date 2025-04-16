import { Children, cloneElement, isValidElement } from "react";
import type { CSSProperties } from "react";

type Position = "tl" | "tr" | "bl" | "br";

interface MenuPopupProps {
  name: string;
  position?: Position;
  children: React.ReactNode;
}

interface ButtonProps {
  className?: string;
  // Add any other relevant button props here
  [key: string]: any; // Allow other props (be careful with this)
}

interface DialogProps {
  className?: string;
  // Add any other relevant dialog props here
  [key: string]: any; // Allow other props (be careful with this)
}

export function PopupMenu(props: MenuPopupProps) {
  const { name, children, position = "bl" } = props;

  if (Children.count(children) !== 2) {
    console.error("MenuPopup must have 2 children <button/> and <dialog/>.");
    return null;
  }

  return Children.map(children, (child, index) => {
    if (index === 0 && isValidElement(child) && child.type === "button") {
      const button = child as React.ReactElement<ButtonProps>;
      return cloneElement(button, {
        popovertarget: name,
        className: `sui-anchor-button ${button.props.className ?? ""}`,
        style: { "--sui-anchor-name": `--sui-am-${name}` } as CSSProperties,
      });
    } else if (
      index === 1 &&
      isValidElement(child) &&
      child.type === "dialog"
    ) {
      const dialog = child as React.ReactElement<DialogProps>;
      return cloneElement(dialog, {
        id: name,
        popover: "auto",
        className: `sui-anchor-menu ${position} ${
          dialog.props.className ?? ""
        }`,
        style: { "--sui-anchor-name": `--sui-am-${name}` } as CSSProperties,
      });
    } else {
      console.error("MenuPopup must have 2 children <button/> and <dialog/>.");
      return null;
    }
  });
}
