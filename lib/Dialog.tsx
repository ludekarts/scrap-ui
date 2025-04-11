import React, { useEffect, useRef, useSyncExternalStore } from "react";

interface DialogProps extends React.HTMLAttributes<HTMLDialogElement> {
  name: string;
  delay?: number;
  noDismiss?: boolean;
}

type CloseEvent =
  | string
  | React.FormEvent<HTMLFormElement>
  | React.MouseEvent<HTMLButtonElement>;

type ListenerFn = () => void;
const emptyProps = {};

const dialogStore = (function () {
  const dialogs = new Map();
  const listeners = new Map();

  return Object.freeze({
    registerDialog(name: string, delay?: number) {
      !dialogs.has(name) && dialogs.set(name, { open: false, delay });
      return function unregisterDialog() {
        dialogs.delete(name);
        listeners.delete(name);
      };
    },

    showDialog<T>(
      name: string,
      resolve: (value: T | PromiseLike<T>) => void,
      props: Record<string, any> = {}
    ): void {
      const dialogData = dialogs.get(name);
      if (!dialogData) throw new Error(`Dialog with name "${name}" not found`);
      dialogData.open = true;
      dialogs.set(name, { props: { ...dialogData, ...props }, resolve });
      listeners.get(name)?.forEach((listener: ListenerFn) => listener());
    },

    closeDialog<D>(event: CloseEvent, closeData?: D): void {
      // Close by name.
      if (typeof event === "string") {
        const name = event;
        const dialogElement = document.getElementById(
          name
        ) as HTMLDialogElement;
        if (!dialogElement)
          throw new Error(`Dialog with name "${name}" not found`);
        dialogElement.close();
        const dialogData = dialogs.get(name);
        if (dialogData) {
          dialogData.props = { ...dialogData.props, open: false };
          dialogs.set(name, dialogData);
          dialogData.resolve(closeData);
          setTimeout(() => {
            listeners.get(name)?.forEach((listener: ListenerFn) => listener());
          }, dialogData.dealy || 300);
        }
      }
      // Close by event.
      else if (event !== undefined && event !== null) {
        // Close by form submit.
        if (event?.type === "submit") {
          event.preventDefault();
          const form = event.target as HTMLFormElement;
          const dialogElement = form.closest("dialog");
          if (!dialogElement)
            throw new Error("Coud not find dialog element to close");
          dialogElement.close();
          const name = dialogElement.id;
          const dialogData = dialogs.get(name);
          if (dialogData) {
            dialogData.resolve(getFormFields(form));
            setTimeout(() => {
              listeners
                .get(name)
                ?.forEach((listener: ListenerFn) => listener());
              form.reset();
            }, dialogData.dealy || 300);
          }
        }
        // Close by button click.
        else if (event?.type === "click") {
          const button = event.target as HTMLButtonElement;
          const dialogElement = button.closest("dialog");
          if (!dialogElement)
            throw new Error("Coud not find dialog element to close");
          dialogElement.close();
          const name = dialogElement.id;
          const dialogData = dialogs.get(name);
          if (dialogData) {
            dialogData.resolve();
            setTimeout(() => {
              listeners
                .get(name)
                ?.forEach((listener: ListenerFn) => listener());
            }, dialogData.dealy || 300);
          }
        }
      }
    },

    subscribe(name: string) {
      return function addListener(listener: ListenerFn) {
        !listeners.has(name) && listeners.set(name, []);
        listeners.get(name).push(listener);
        return function unsubscribe(): void {
          listeners.has(name) &&
            listeners.set(
              name,
              listeners.get(name).filter((l: ListenerFn) => l !== listener)
            );
        };
      };
    },

    getDialogProps(name: string) {
      return () => {
        const dialogData = dialogs.get(name);
        if (dialogData && dialogData.props) {
          return dialogData.props;
        } else {
          return emptyProps;
        }
      };
    },
  });
})();

interface CloceDialogBtnProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function CloceDialogBtn(props: CloceDialogBtnProps) {
  return <button data-scrap-ui-close="dialog" type="button" {...props} />;
}

export function Dialog(props: DialogProps): JSX.Element | null {
  const { name, className, children, noDismiss = false, delay } = props;
  const dialog = useRef<HTMLDialogElement>(null);
  const { open } = useDialogData(name);

  // Prevents from memory leak when user close dialog with <form method="dialog">.
  const handleCloseEvent = (event: Event) => {
    event.preventDefault();
    closeDialog(name);
  };

  // Regitsetr new dialog to store.
  useEffect(() => dialogStore.registerDialog(name, delay), []);

  // Show dialog on open prop change.
  useEffect(() => {
    if (dialog.current) {
      if (open) {
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
        dialog.current.addEventListener("close", handleCloseEvent);
        dialog.current.addEventListener("keydown", keybordHandler);
        return () => {
          dialog.current?.removeEventListener("close", handleCloseEvent);
          dialog.current?.removeEventListener("keydown", keybordHandler);
        };
      } else {
        dialog.current.close();
      }
    }
  }, [open]);

  return !open ? null : (
    <dialog id={name} className={className} ref={dialog} data-scrap-ui="dialog">
      {children}
    </dialog>
  );
}

export async function openDialog<T>(
  name: string,
  props: Record<string, any> = {}
) {
  return new Promise<T>((resolve) => {
    dialogStore.showDialog<T>(name, resolve, props);
  });
}

export function closeDialog(event: CloseEvent, closeData?: any) {
  dialogStore.closeDialog(event, closeData);
}

export function useDialogData(name: string) {
  const props = useSyncExternalStore(
    dialogStore.subscribe(name),
    dialogStore.getDialogProps(name),
    dialogStore.getDialogProps(name)
  );
  return props;
}
/*
  // Fix for notworking autofocus fetaure in React.
  (dialog.querySelector("[data-focus-on-open]") as HTMLFormElement)?.focus();
*/

// ---- Helpers ----------------

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
