import React, { useRef, useEffect, useSyncExternalStore } from "react";
import { getFormFields } from "@ludekarts/utility-belt";

interface DialogProps extends React.HTMLAttributes<HTMLDialogElement> {
  noDismiss?: boolean;
}

interface CreateDialogOptions {
  name?: string;
  animate?: boolean;
  outDelay?: number;
  forceOpen?: boolean;
  formParser?: Record<string, any>;
}

export function createDialog(
  options: CreateDialogOptions = {}
): [React.FC<DialogProps>, any] {
  const {
    name,
    formParser,
    animate = false,
    forceOpen = false,
    outDelay = animate ? 300 : 0,
  } = options;
  const dialogId = getDialogId(name);
  const dialogStore = createDialogStore(forceOpen, outDelay);

  const Dialog = (props: DialogProps) => {
    const { children, noDismiss, className } = props;
    const dialog = useRef<HTMLDialogElement>(null);
    const { isOpen } = useDialogState();

    // Prevents from memory leak when user close dialog with <form method="dialog">.
    const handleCloseTrigger = (event: Event) => {
      event.preventDefault();
      dialogStore.closeDialog();
    };

    // Show/hide dialog. Handle focus trap and keyboard events.
    useEffect(() => {
      if (dialog.current) {
        dialogStore.setDialogRef(dialog.current);

        if (isOpen) {
          dialog.current.showModal();

          // Set open transition state.
          setTimeout(() => {
            if (dialog.current) {
              dialog.current.dataset.transition = "open-to-close";
            }
          }, 10);

          const [head, tail] = getHeadAndTail(
            getFocusableNodes(dialog.current)
          );

          const keybordHandler = (event: KeyboardEvent) => {
            // Handle Tab key focus navigation.
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

            // Handle Escape key exit (custom).
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
      <dialog
        ref={dialog}
        id={dialogId}
        data-transition="init"
        className={animate ? `sui-animate ${className}` : className}
      >
        {children}
      </dialog>
    );
  };

  // State hook.

  function useDialogState() {
    return useSyncExternalStore(
      dialogStore.subscribe,
      dialogStore.getDialogState,
      dialogStore.getDialogState
    );
  }

  // Dialog Controller API.

  const dialogController = {
    async show(props: Record<string, any> = {}) {
      return new Promise((resolve) => {
        dialogStore.showDialog(resolve, props);
      });
    },

    close(data?: any) {
      // Handle close by form submission.
      if (data?.type === "submit") {
        data.preventDefault();
        dialogStore.closeDialog(
          getFormFields(data.target as HTMLFormElement, formParser || {})
        );
      } else {
        dialogStore.closeDialog(data);
      }
    },

    getState: useDialogState,
  };

  return [Dialog, dialogController];
}

// ---- Helpers ----------------

function createDialogStore(forceOpen: boolean, outDelay: number) {
  let listener: (() => void) | undefined;
  let resolver: ((value: any) => void) | undefined;
  let state = { isOpen: forceOpen };
  let dialogRef: HTMLDialogElement | null = null;
  let lastActiveElement: HTMLElement | null = null;
  let timer: number | null = null;
  return {
    showDialog(resolve: any, props: Record<string, any> = {}) {
      lastActiveElement = document.activeElement as HTMLElement;
      state = { ...state, ...props, isOpen: true };
      resolver = resolve;
      listener?.();
    },

    closeDialog(data?: any) {
      state = { ...state, isOpen: false };
      if (dialogRef) {
        dialogRef.dataset.transition = "close-to-open";
      }
      resolver?.(data);
      resolver = undefined;
      timer = setTimeout(() => {
        listener?.();
        // Restore focus to the last active element after dialog is closed.
        setTimeout(() => {
          if (lastActiveElement) {
            lastActiveElement.focus();
            lastActiveElement = null;
          }
          dialogRef = null;
        }, 0);
      }, outDelay);
    },

    subscribe(cb: () => void) {
      listener = cb;
      return () => {
        dialogRef = null;
        listener = undefined;
        resolver = undefined;
        lastActiveElement = null;
        timer && clearTimeout(timer);
      };
    },

    getDialogState() {
      return state;
    },

    setDialogRef(ref: HTMLDialogElement | null) {
      dialogRef = ref;
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
