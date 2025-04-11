import React, { useEffect, useRef } from "react";

interface DialogProps extends React.HTMLAttributes<HTMLDialogElement> {
  name: string;
  noDismiss?: boolean;
}

const dialogStore = new Map();
const dialogDataStore = new Map();

export function Dialog(props: DialogProps): JSX.Element {
  const { name, className, children, noDismiss = false, open } = props;
  const dialog = useRef<HTMLDialogElement>(null);

  // Prevents from memory leak when user close dialog with <form method="dialog">.
  const handleCloseEvent = () => closeDialog(name);

  useEffect(() => {
    if (dialog.current) {
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
    }
  }, []);

  useEffect(() => {
    if (dialog.current) {
      if (open) {
        dialog.current.showModal();
      } else {
        dialog.current.close();
      }
    }
  }, [open]);

  return !open ? null : (
    <dialog id={name} className={className} ref={dialog}>
      {children}
    </dialog>
  );
}

export function openDialog(name: string, data: Record<string, any> = {}) {
  const dialog = document.getElementById(name) as HTMLDialogElement;
  if (!dialog) throw new Error(`Dialog with name "${name}" not found`);
  Object.keys(data).length && dialogDataStore.set(name, data);
  dialog.showModal();
  // Fix for notworking autofocus fetaure in React.
  (dialog.querySelector("[data-focus-on-open]") as HTMLFormElement)?.focus();
  return new Promise((resolve) => {
    dialogStore.set(name, resolve);
  });
}

type CloseEvent =
  | string
  | React.FormEvent<HTMLFormElement>
  | React.MouseEvent<HTMLButtonElement>;

export function closeDialog(event: CloseEvent, data?: any) {
  if (typeof event === "string") {
    const dialog = document.getElementById(event) as HTMLDialogElement;
    if (!dialog) throw new Error(`Dialog with name "${event}" not found`);
    dialog.close();
    dialogStore.get(event)?.(data);
    dialogStore.delete(event);
    dialogDataStore.delete(event);
  } else if (typeof event === "object") {
    if (event?.type === "submit") {
      event.preventDefault();
      const form = event.target as HTMLFormElement;
      const dialog = form.closest("dialog");
      if (!dialog) throw new Error("Coud not find dialog element to close");
      dialog?.close();
      dialogStore.get(dialog.id)?.(getFormFields(form));
      dialogStore.delete(event);
      dialogDataStore.delete(event);
      form.reset();
    } else if (event?.type === "click") {
      const button = event.target as HTMLButtonElement;
      const dialog = button.closest("dialog");
      if (!dialog) throw new Error("Coud not find dialog element to close");
      dialog?.close();
      dialogStore.get(dialog.id)?.();
      dialogStore.delete(event);
      dialogDataStore.delete(event);
    }
  }
}

export function useDialogData<T>(name: string) {
  return (dialogDataStore.get(name) || {}) as T;
}

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
