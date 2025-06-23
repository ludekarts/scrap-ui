import React, { useState, useRef, useEffect } from "react";

interface DialogProps extends React.HTMLAttributes<HTMLDialogElement> {
  outDelay?: number;
  noDismiss?: boolean;
  noAnimation?: boolean;
}

type DialogRenderFn = React.FC<DialogProps>;

export function createDialog(name?: string) {
  const dialogId =
    name || `dialog-${Math.random().toString(36).substring(2, 15)}`;

  const RenderDialog: DialogRenderFn = (props) => {
    const {
      children,
      // outDelay,
      className,
      noAnimation,
      noDismiss = false,
    } = props;

    const [isOpen, toggleDialog] = useState(false);
    const dialog = useRef<HTMLDialogElement>(null);
    const config = noAnimation ? {} : { "data-scrap-ui": "dialog" };

    // Prevents from memory leak when user close dialog with <form method="dialog">.
    const handleCloseTrigger = (event: Event) => {
      event.preventDefault();
      toggleDialog(false);
    };

    // Show dialog on open prop change.
    useEffect(() => {
      if (dialog.current) {
        if (isOpen) {
          dialog.current.showModal();
          const [head, tail] = getHeadAndTail(
            getFocusableNodes(dialog.current)
          );
          const keybordHandler = (event: KeyboardEvent) => {
            if (event.key === "Tab") {
              if (event.shiftKey) {
                if (document.activeElement === head) {
                  event.preventDefault();
                  tail.focus();
                }
              } else {
                if (document.activeElement === tail) {
                  event.preventDefault();
                  head.focus();
                }
              }
            }
            if (event.key === "Escape") {
              event.stopPropagation();
              event.preventDefault();
              !noDismiss && toggleDialog(false);
            }
          };
          dialog.current.addEventListener("close", handleCloseTrigger);
          dialog.current.addEventListener("keydown", keybordHandler);
          return () => {
            dialog.current?.removeEventListener("close", handleCloseTrigger);
            dialog.current?.removeEventListener("keydown", keybordHandler);
          };
        } else {
          dialog.current.close();
        }
      }
    }, [isOpen]);

    return !isOpen ? null : (
      <dialog id={dialogId} ref={dialog} className={className} {...config}>
        {children}
      </dialog>
    );
  };

  async function openDialog() {
    return;
  }

  return [RenderDialog, openDialog];
}

// Custom version of querySelectorAll that not return elements from nested dialogs.
function getFocusableNodes(node: Element | null | undefined): Element[] {
  const result = [];
  node && isFocusable(node) && result.push(node);
  node = node?.firstElementChild;

  // Go deep through all nodes except nested dialogs.
  while (node && node.nodeName !== "DIALOG") {
    result.push(getFocusableNodes(node));
    node = node.nextElementSibling;
  }

  return result.flat();
}

function getHeadAndTail(source: any[]) {
  return [source[0], source[source.length - 1]];
}

function isFocusable(node: Element) {
  return Boolean(
    node.matches(
      `a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])`
    )
  );
}
