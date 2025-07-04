import React, {
  useState,
  useRef,
  useEffect,
  useSyncExternalStore,
} from "react";

interface DialogProps extends React.HTMLAttributes<HTMLDialogElement> {
  noDismiss?: boolean;
  forceOpen?: boolean;
  children?: React.ReactNode;
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

  console.log("RUN");

  const Dialog = (props: DialogProps) => {
    const { children, className } = props;

    const state = useSyncExternalStore(
      dialogStore.subscribe,
      dialogStore.getDialogProps,
      dialogStore.getDialogProps
    );

    console.log(state);

    const dialog = useRef<HTMLDialogElement>(null);

    useEffect(() => {
      if (state.isOpen) {
        dialog.current?.showModal();
      } else {
        dialog.current?.close();
      }
    }, [state.isOpen]);

    return !state.isOpen ? null : (
      <dialog id={dialogId} ref={dialog} className={className}>
        {children}
      </dialog>
    );
  };

  const controller = {
    show() {
      dialogStore.showDialog();
    },
    close() {
      dialogStore.closeDialog();
    },
  };

  return [Dialog, controller];
}

// ---- Helpers ----------------

function createDialogStore(forceOpen: boolean = false) {
  let listener: (() => void) | undefined;
  let state = { isOpen: forceOpen };
  return {
    showDialog(props: Record<string, any> = {}) {
      state = { ...state, ...props, isOpen: true };
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

    getDialogProps() {
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
