import React, { useRef, useEffect, useSyncExternalStore } from "react";
import { getFormFields } from "@ludekarts/utility-belt";
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
  close: (data?: R | React.FormEvent<HTMLFormElement>) => void;
  // This is a Hook, so use it like one.
  useDialogState: () => { isOpen: boolean } & P;
};

export function createDialog<R, P extends OpenProps = {}>(
  options: CreateDialogOptions = {}
): [React.FC<DialogProps>, CreateDialogController<R, P>] {
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
              dialog.current.dataset.transition = "close-to-open";
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
    async open(props?: OpenProps) {
      return new Promise<R>((resolve) => {
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
              formParser || {}
            ) as R
          );
          return;
        }
        // Handle close by mouse click.
        else if (
          data instanceof MouseEvent &&
          (data as MouseEvent).type === "click"
        ) {
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
  let listener: (() => void) | undefined;
  let resolver: Resolver | undefined;
  let state = { isOpen: forceOpen } as { isOpen: boolean } & P;
  let dialogRef: HTMLDialogElement | null = null;
  let lastActiveElement: HTMLElement | null = null;
  let timer: number | null = null;
  return {
    openDialog(resolve: Resolver, props: OpenProps = {}) {
      lastActiveElement = document.activeElement as HTMLElement;
      state = { ...state, ...props, isOpen: true };
      resolver = resolve;
      listener?.();
    },

    closeDialog(data?: R) {
      state = { ...state, isOpen: false };
      if (dialogRef) {
        dialogRef.dataset.transition = "open-to-close";
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
