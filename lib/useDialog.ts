import { getFocusableHeadAndTail } from "./utils";
import { useEffect, useRef, useState } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";

type UseDialogApi<ReturnValue, OpenProps> = {
  dialogRef: RefObject<HTMLDialogElement>;
  useProps: () => OpenProps | undefined;
  closeDialog: (
    value?:
      | ReturnValue
      | React.MouseEvent<HTMLElement>
      | React.FormEvent<HTMLFormElement>,
  ) => void;
};

export function createDialog<ReturnValue, OpenProps>(
  formParser?: (form: HTMLFormElement) => ReturnValue,
): [
  () => UseDialogApi<ReturnValue, OpenProps>,
  (openProps?: OpenProps) => Promise<ReturnValue | undefined>,
] {
  let ref: HTMLDialogElement | null = null;

  let resolveDialogResult: ((value: ReturnValue | undefined) => void) | null =
    null;

  let dialogCloseValue: ReturnValue | undefined;

  let setDialogProps: Dispatch<SetStateAction<OpenProps | undefined>> | null =
    null;

  // Runs on every dialog "close" event, including ESC and <form method="dialog">.
  function closeHandle() {
    resolveDialogResult?.(dialogCloseValue);
    resolveDialogResult = null;
    dialogCloseValue = undefined;
  }

  function closeWithValue(value?: ReturnValue) {
    dialogCloseValue = value;
    ref?.close();
  }

  // ---- API ----------------

  function useDialog() {
    const [props, setProps] = useState<OpenProps>();
    const dialogRef = useRef<HTMLDialogElement>(null);

    function useProps() {
      return props;
    }

    function closeDialog(
      value?:
        | ReturnValue
        | React.MouseEvent<HTMLElement>
        | React.FormEvent<HTMLFormElement>,
    ) {
      if (isSubmitEvent(value)) {
        value.preventDefault();
        const form = value.currentTarget;
        closeWithValue(formParser?.(form));
      } else if (isClickEvent(value)) {
        closeWithValue();
      } else {
        closeWithValue(value);
      }
    }

    useEffect(() => {
      let keybordHandler: ((event: KeyboardEvent) => void) | undefined;

      if (setDialogProps !== setProps) {
        setDialogProps = setProps;
      }

      if (dialogRef.current !== null) {
        ref = dialogRef.current;

        const [head, tail] = getFocusableHeadAndTail(dialogRef.current);

        keybordHandler = (event: KeyboardEvent) => {
          // Handle Tab key focus navigation.
          if (event.key === "Tab") {
            // Escape if there are no focusable nodes.
            if (!head || !tail) {
              return;
            }

            // Loop focus backward.
            if (event.shiftKey) {
              if (document.activeElement === head) {
                event.preventDefault();
                (tail as HTMLElement).focus();
              }
            }

            // Loop focus forward.
            else {
              if (document.activeElement === tail) {
                event.preventDefault();
                (head as HTMLElement).focus();
              }
            }
          }
        };

        ref?.addEventListener("close", closeHandle as EventListener);
        ref?.addEventListener("keydown", keybordHandler);
      }

      return () => {
        ref?.removeEventListener("close", closeHandle as EventListener);
        keybordHandler && ref?.removeEventListener("keydown", keybordHandler);
        setDialogProps = null;
        ref = null;
      };
    }, [setProps]);

    return {
      dialogRef,
      useProps,
      closeDialog,
    };
  }

  function openDialog(openProps?: OpenProps) {
    setDialogProps?.(openProps);
    return new Promise<ReturnValue | undefined>((resolve) => {
      resolveDialogResult?.(undefined);
      resolveDialogResult = resolve;
      dialogCloseValue = undefined;
      ref?.showModal();
    });
  }

  return [useDialog, openDialog];
}

// ---- Helpers ----------------

function isSubmitEvent(
  value: unknown,
): value is React.FormEvent<HTMLFormElement> {
  return Boolean(
    value &&
    typeof value === "object" &&
    "type" in value &&
    value.type === "submit" &&
    "currentTarget" in value &&
    value.currentTarget instanceof HTMLFormElement,
  );
}

function isClickEvent(value: unknown): value is React.MouseEvent<HTMLElement> {
  return Boolean(
    value &&
    typeof value === "object" &&
    "type" in value &&
    value.type === "click" &&
    "currentTarget" in value &&
    value.currentTarget instanceof HTMLElement,
  );
}
