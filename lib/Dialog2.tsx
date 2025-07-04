import React, { useRef, useEffect, useSyncExternalStore } from "react";

interface DialogProps extends React.HTMLAttributes<HTMLDialogElement> {
  noDismiss?: boolean;
}

interface CreateDialogOptions {
  name?: string;
  forceOpen?: boolean;
}

export function createDialog(
  options: CreateDialogOptions
): [React.FC<DialogProps>, any] {
  const { name, forceOpen = false } = options;
  const dialogId = getDialogId(name);
  const dialogStore = createDialogStore(forceOpen);

  const Dialog = (props: DialogProps) => {
    const { children, noDismiss, className } = props;

    const dialog = useRef<HTMLDialogElement>(null);
    const { isOpen } = useDialogState();

    // Prevents from memory leak when user close dialog with <form method="dialog">.
    const handleCloseTrigger = (event: Event) => {
      event.preventDefault();
      dialogStore.closeDialog();
    };

    // Show/hide dialog on open state change.
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
              !noDismiss && dialogStore.closeDialog();
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
      <dialog id={dialogId} ref={dialog} className={className}>
        {children}
      </dialog>
    );
  };

  function useDialogState() {
    return useSyncExternalStore(
      dialogStore.subscribe,
      dialogStore.getDialogState,
      dialogStore.getDialogState
    );
  }

  const controller = {
    async show(props: Record<string, any> = {}) {
      return new Promise((resolve) => {
        dialogStore.showDialog(resolve, props);
      });
    },

    close() {
      dialogStore.closeDialog();
    },

    getState: useDialogState,
  };

  return [Dialog, controller];
}

// ---- Helpers ----------------

function createDialogStore(forceOpen: boolean = false) {
  let listener: (() => void) | undefined;
  let resolver;
  let state = { isOpen: forceOpen };
  return {
    showDialog(resolve: any, props: Record<string, any> = {}) {
      state = { ...state, ...props, isOpen: true };
      resolver = resolve;
      listener?.();
    },

    closeDialog() {
      state = { ...state, isOpen: false };
      listener?.();
    },

    subscribe(cb: () => void) {
      listener = cb;
      return () => {
        listener = undefined;
      };
    },

    getDialogState() {
      return state;
    },
  };
}

function getDialogId(name?: string) {
  return name || `sui-dialog-${Math.random().toString(36).substring(2, 15)}`;
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
