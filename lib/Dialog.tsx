import { getFormFields } from "@ludekarts/utility-belt";
import { getHeadAndTail, getFocusableNodes } from "./utils";
import React, { useRef, useEffect, useSyncExternalStore } from "react";

// Types.
import type { FormFieldsOptions } from "@ludekarts/utility-belt";

interface DialogProps extends React.HTMLAttributes<HTMLDialogElement> {
  noDismiss?: boolean;
}

interface CreateDialogOptions {
  name?: string;
  animate?: boolean;
  outDelay?: number;
  forceOpen?: boolean;
  formParser?: FormFieldsOptions;
}

type Resolver = (data?: any) => void;
type OpenProps = Record<string, any> | undefined;
type CreateDialogController<R = any, P = OpenProps> = {
  open: (props?: P) => Promise<R>;
  close: (
    data?: R | React.FormEvent<HTMLFormElement> | React.MouseEvent,
  ) => void;
  // This is a Hook, so use it like one.
  useDialogState: () => { isOpen: boolean } & P;
};

export function createDialog<R, P extends OpenProps = {}>(
  options: CreateDialogOptions = {},
): [React.FC<DialogProps>, CreateDialogController<R | undefined, P>] {
  const {
    name,
    formParser,
    animate = false,
    forceOpen = false,
    outDelay = animate ? 300 : 0,
  } = options;
  const dialogId = getDialogId(name);
  const dialogStore = createDialogStore<R, P>(forceOpen, outDelay);

  const Dialog = (props: DialogProps) => {
    const { children, noDismiss, className } = props;
    const dialog = useRef<HTMLDialogElement>(null);
    const { isOpen } = useDialogState();

    // Prevents from memory leak when user close dialog with <form method="dialog">.
    const handleCloseTrigger = () => {
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
              dialog.current.dataset.transition = "close-to-open";
            }
          }, 10);

          const [head, tail] = getHeadAndTail(
            getFocusableNodes(dialog.current),
          );

          const keybordHandler = (event: KeyboardEvent) => {
            // Handle Tab key focus navigation.
            if (event.key === "Tab") {
              // Escape if there are no focusable nodes.
              if (!head || !tail) {
                return;
              }
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

    // Handle Escape key exit (custom).
    // 📒 It is handled here not as "Tab" in useEffect to allow event.preventDefault()
    // to work with other SUI components like Combobox inside the dialog.
    const handleEscapePress = (
      event: React.KeyboardEvent<HTMLDialogElement>,
    ) => {
      if (event.key === "Escape" && !noDismiss) {
        event.stopPropagation();
        event.preventDefault();
        dialogStore.closeDialog();
      }
    };

    // Handle "noDismiss" for form submission with method="dialog".
    const handleSubmitCapture = (event: React.FormEvent<HTMLDialogElement>) => {
      if (!noDismiss) {
        return;
      }
      const target = event.target as HTMLFormElement | null;
      if (target?.tagName !== "FORM") {
        return;
      }
      const method = target.getAttribute("method");
      if (method?.toLowerCase() === "dialog") {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const handleDialogCancel = (event: React.FormEvent<HTMLDialogElement>) => {
      if (noDismiss) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    return !isOpen ? null : (
      <dialog
        ref={dialog}
        id={dialogId}
        data-transition="init"
        onKeyDown={handleEscapePress}
        onSubmitCapture={handleSubmitCapture}
        onCancel={handleDialogCancel}
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
      dialogStore.getDialogState,
    );
  }

  // Dialog Controller API.

  const dialogController = {
    async open(props?: OpenProps) {
      return new Promise<R | undefined>((resolve) => {
        dialogStore.openDialog(resolve, props);
      });
    },

    close(data?: R | React.FormEvent<HTMLFormElement> | React.MouseEvent) {
      if (data) {
        // Handle close by form submission.
        if ((data as React.FormEvent).type === "submit") {
          (data as React.FormEvent).preventDefault();
          dialogStore.closeDialog(
            getFormFields(
              (data as React.FormEvent).target as HTMLFormElement,
              formParser || {},
            ) as R,
          );
          return;
        }
        // Handle close by mouse click.
        else if ((data as React.MouseEvent).type === "click") {
          dialogStore.closeDialog();
        }
        // Not an event, assume it's a custom data to return.
        else {
          dialogStore.closeDialog(data as R);
        }
      }
      // No data.
      else {
        dialogStore.closeDialog();
      }
    },

    useDialogState: useDialogState,
  };

  return [Dialog, dialogController];
}

// ---- Helpers ----------------

function createDialogStore<R, P>(forceOpen: boolean, outDelay: number) {
  const listeners = new Set<() => void>();
  let resolver: Resolver | undefined;
  let state = { isOpen: forceOpen } as { isOpen: boolean } & P;
  let dialogRef: HTMLDialogElement | null = null;
  let lastActiveElement: HTMLElement | null = null;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const notify = () => {
    listeners.forEach((cb) => cb());
  };
  return {
    openDialog(resolve: Resolver, props: OpenProps = {}) {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (resolver) {
        resolver(undefined);
      }
      lastActiveElement = document.activeElement as HTMLElement;
      state = { isOpen: true, ...(props || {}) } as { isOpen: boolean } & P;
      resolver = resolve;
      notify();
    },

    closeDialog(data?: R) {
      state = { ...state, isOpen: false };
      if (dialogRef) {
        dialogRef.dataset.transition = "open-to-close";
      }
      resolver?.(data);
      resolver = undefined;
      if (timer) {
        clearTimeout(timer);
      }
      timer = setTimeout(() => {
        notify();
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
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
        if (listeners.size === 0) {
          dialogRef = null;
          resolver = undefined;
          lastActiveElement = null;
          if (timer) {
            clearTimeout(timer);
            timer = null;
          }
        }
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
