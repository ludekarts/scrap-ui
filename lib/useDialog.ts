import { useEffect, useRef, useState } from "react";
import type { Dispatch, RefObject, SetStateAction } from "react";

type UseDialogController<ReturnValue, OpenProps> = {
  dialogRef: RefObject<HTMLDialogElement>;
  useProps: () => OpenProps | undefined;
  closeDialog: (value?: ReturnValue) => void;
};

export function createDialog<ReturnValue, OpenProps>(): [
  () => UseDialogController<ReturnValue, OpenProps>,
  (openProps?: OpenProps) => Promise<ReturnValue | undefined>,
] {
  let ref: null | HTMLDialogElement = null;
  let resolvePromise: null | ((value: ReturnValue | undefined) => void) = null;
  let setDialogProps: null | Dispatch<SetStateAction<OpenProps | undefined>> =
    null;

  function useDialog() {
    const [props, setProps] = useState<OpenProps>();
    const dialogRef = useRef<HTMLDialogElement>(null);

    function closeDialog(value?: ReturnValue) {
      ref?.close();
      resolvePromise?.(value);
      resolvePromise = null;
    }

    function useProps() {
      return props;
    }

    useEffect(() => {
      if (setDialogProps !== setProps) {
        setDialogProps = setProps;
      }

      if (dialogRef.current !== null) {
        ref = dialogRef.current;
      }

      return () => {
        ref = null;
        setDialogProps = null;
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
      resolvePromise?.(undefined);
      resolvePromise = resolve;

      ref?.showModal();
    });
  }

  return [useDialog, openDialog];
}
