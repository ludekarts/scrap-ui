export function getHeadAndTail<T>(source: T[]): [T | undefined, T | undefined] {
  return [source[0], source[source.length - 1]];
}

// Custom version of querySelectorAll that not return elements from nested dialogs.
export function getFocusableNodes(node: Element | null | undefined): Element[] {
  const result: Element[] = [];
  node && isFocusable(node) && result.push(node);
  node = node?.firstElementChild;

  // Go deep through all nodes except nested dialogs.
  while (node && node.nodeName !== "DIALOG") {
    result.push(...getFocusableNodes(node));
    node = node.nextElementSibling;
  }

  return result;
}

function isFocusable(node: Element) {
  return Boolean(
    node.matches(
      `a[href], button, input:not([type="hidden"]), textarea, select, [tabindex]:not([tabindex="-1"])`,
    ),
  );
}

export function getFocusableHeadAndTail(
  node: Element | null | undefined,
): [Element | undefined, Element | undefined] {
  return getHeadAndTail(getFocusableNodes(node));
}
