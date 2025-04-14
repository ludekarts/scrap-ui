import React, { useEffect, useRef, useSyncExternalStore } from "react";

interface DialogProps extends React.HTMLAttributes<HTMLDialogElement> {
  name: string;
  outDelay?: number;
  noDismiss?: boolean;
  noAnimation?: boolean;
}

type CloseTrigger =
  | string
  | React.FormEvent<HTMLFormElement>
  | React.MouseEvent<HTMLButtonElement>;

type ListenerFn = () => void;
const emptyProps = { isOpen: false };

type DialogData<P = any> = {
  outDelay: number;
  resolve: (value: any) => void;
  props: { isOpen: boolean } & Record<string, P>;
};

type DialogsMap = Map<string, DialogData>;
type ListenersMap = Map<string, ListenerFn[]>;

const dialogStore = (function () {
  const dialogs: DialogsMap = new Map();
  const listeners: ListenersMap = new Map();

  function updateDialogsData(
    name: string,
    dialogData: DialogData,
    dialogs: DialogsMap,
    resolveData: any
  ) {
    dialogData.props = { ...dialogData.props, isOpen: false };
    dialogs.set(name, dialogData);
    dialogData.resolve(resolveData);
    setTimeout(() => {
      listeners.get(name)?.forEach((listener: ListenerFn) => listener());
    }, dialogData.outDelay);
  }

  return Object.freeze({
    registerDialog(name: string, outDelay = 300) {
      !dialogs.has(name) &&
        dialogs.set(name, {
          outDelay,
          resolve: () => {},
          props: { isOpen: false },
        });
      return function unregisterDialog() {
        dialogs.delete(name);
        listeners.delete(name);
      };
    },

    showDialog<T, P>(
      name: string,
      resolve: (value: T | PromiseLike<T>) => void,
      props?: P
    ): void {
      const dialogData = dialogs.get(name);
      if (!dialogData) throw new Error(`Dialog with name "${name}" not found`);

      dialogs.set(name, {
        resolve,
        outDelay: dialogData.outDelay,
        props: { ...dialogData.props, ...props, isOpen: true },
      });

      listeners.get(name)?.forEach((listener: ListenerFn) => listener());
    },

    closeDialog(trigger: CloseTrigger, closeData?: any): void {
      // Close by name.
      if (typeof trigger === "string") {
        const name = findAndCloseDialogElement(trigger);
        const dialogData = dialogs.get(name);
        dialogData && updateDialogsData(name, dialogData, dialogs, closeData);
      }
      // Close by event.
      else if (trigger !== undefined && trigger !== null) {
        // Close by form submit.
        if (trigger?.type === "submit") {
          trigger.preventDefault();
          const form = trigger.target as HTMLFormElement;
          const name = findAndCloseDialogElement(form);
          const dialogData = dialogs.get(name);
          if (dialogData) {
            updateDialogsData(name, dialogData, dialogs, getFormFields(form));
            form.reset();
          }
        }
        // Close by button click.
        else if (trigger?.type === "click") {
          const button = trigger.target as HTMLButtonElement;
          const name = findAndCloseDialogElement(button);
          const dialogData = dialogs.get(name);
          dialogData && updateDialogsData(name, dialogData, dialogs, {});
        }
      }
    },

    subscribe(name: string) {
      return function addListener(listener: ListenerFn) {
        !listeners.has(name) && listeners.set(name, []);
        listeners.get(name)!.push(listener);
        return function unsubscribe(): void {
          if (listeners.has(name)) {
            listeners.set(
              name,
              listeners.get(name)!.filter((l: ListenerFn) => l !== listener)
            );
          }
        };
      };
    },

    getDialogProps<P>(name: string) {
      return () => {
        const dialogData = dialogs.get(name);
        if (dialogData && dialogData.props) {
          return dialogData.props as DialogData["props"] & P;
        } else {
          return emptyProps as DialogData["props"] & P;
        }
      };
    },
  });
})();

export function Dialog(props: DialogProps): JSX.Element | null {
  const {
    name,
    children,
    outDelay,
    className,
    noAnimation,
    noDismiss = false,
  } = props;
  const dialog = useRef<HTMLDialogElement>(null);
  const config = noAnimation ? {} : { "data-scrap-ui": "dialog" };
  const { isOpen } = useDialogData(name);

  // Prevents from memory leak when user close dialog with <form method="dialog">.
  const handleCloseTrigger = (event: Event) => {
    event.preventDefault();
    closeDialog(name);
  };

  // Regitsetr new dialog to store.
  useEffect(() => dialogStore.registerDialog(name, outDelay), []);

  // Show dialog on open prop change.
  useEffect(() => {
    if (dialog.current) {
      if (isOpen) {
        dialog.current.showModal();
        const [head, tail] = getHeadAndTail(getFocusableNodes(dialog.current));
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
            !noDismiss && closeDialog(name);
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
    <dialog id={name} ref={dialog} className={className} {...config}>
      {children}
    </dialog>
  );
}

export async function openDialog<T, P = Record<string, any>>(
  name: string,
  props?: P
) {
  return new Promise<T>((resolve) => {
    dialogStore.showDialog<T, P>(name, resolve, props);
  });
}

export function closeDialog(event: CloseTrigger, closeData?: any) {
  dialogStore.closeDialog(event, closeData);
}

export function useDialogData<P = {}>(name: string): DialogData["props"] & P {
  return useSyncExternalStore(
    dialogStore.subscribe(name),
    dialogStore.getDialogProps<P>(name),
    dialogStore.getDialogProps<P>(name)
  );
}

/*
  // Fix for notworking autofocus fetaure in React.
  (dialog.querySelector("[data-focus-on-open]") as HTMLFormElement)?.focus();
*/

// ---- Helpers ----------------

function findAndCloseDialogElement(trigger: any) {
  let dialog: HTMLDialogElement | null = null;

  if (typeof trigger === "string") {
    dialog = document.getElementById(trigger) as HTMLDialogElement;
  } else if (trigger instanceof HTMLFormElement) {
    dialog = trigger.closest("dialog") as HTMLDialogElement;
  } else if (trigger instanceof HTMLButtonElement) {
    dialog = trigger.closest("dialog") as HTMLDialogElement;
  }

  if (!dialog) {
    throw new Error("Coud not find dialog element to close");
  }

  dialog.close();
  return dialog.id;
}

function isFocusable(node: Element) {
  return Boolean(
    node.matches(
      `a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])`
    )
  );
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

// ---- Temporary  ----------------

type FormValue = null | string | boolean | { value: string; checked: boolean };
type FormFields = Record<string, FormValue>;

type FormFieldsOptions = {
  includeCheckboxValues: boolean;
};

export function getFormFields(
  form: HTMLFormElement,
  options: FormFieldsOptions = { includeCheckboxValues: false }
) {
  return (Array.from(form.elements) as HTMLFormElement[]).reduce(
    (acc, element) => {
      if (element.name) {
        if (element.type === "radio") {
          if (element.checked) {
            acc[element.name] = element.value;
          }
        } else if (element.type === "checkbox") {
          if (options.includeCheckboxValues) {
            acc[element.name] = {
              value: element.value,
              checked: element.checked,
            };
          } else {
            acc[element.name] = element.checked;
          }
        } else {
          acc[element.name] = element.value;
        }
      }
      return acc;
    },
    {} as FormFields
  );
}

export function updateForm(
  selector: HTMLFormElement | string,
  source: FormFields
) {
  const form =
    selector instanceof HTMLFormElement
      ? selector
      : document.querySelector(selector);

  if (form instanceof HTMLFormElement) {
    (Array.from(form.elements) as HTMLFormElement[]).forEach((element) => {
      if (element.name) {
        const value = source[element.name];
        if (value !== undefined) {
          if (isSimpleValue(value)) {
            element.value = value;
          } else if (typeof value === "object" && value !== null) {
            Object.keys(value as object).forEach(
              (key) => (element[key] = value[key as keyof typeof value])
            );
          }
        }
      }
    });
  } else {
    throw new Error("UpdateFormError:Cannot find form element to update");
  }
}

function isSimpleValue(value: any) {
  return (
    value === null ||
    typeof value === "string" ||
    typeof value === "boolean" ||
    typeof value === "number"
  );
}
