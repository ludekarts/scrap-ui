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

  let setDialogProps: Dispatch<SetStateAction<OpenProps | undefined>> | null =
    null;

  // Close on ESC and <form method="dialog">.
  function closeHandle() {
    ref?.close();
    resolveDialogResult?.(undefined);
    resolveDialogResult = null;
  }

  function closeHandleWithValue(value?: ReturnValue) {
    ref?.close();
    resolveDialogResult?.(value);
    resolveDialogResult = null;
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
      // Handle close by form submission.
      if ((value as React.FormEvent).type === "submit") {
        (value as React.FormEvent).preventDefault();
        const form = (value as React.FormEvent<HTMLFormElement>).currentTarget;
        closeHandleWithValue(formParser?.(form));
      } else {
        closeHandleWithValue(value as ReturnValue);
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
      ref?.showModal();
    });
  }

  return [useDialog, openDialog];
}
