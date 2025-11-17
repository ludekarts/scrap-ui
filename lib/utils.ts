export function getHeadAndTail(source: any[]) {
  return [source[0], source[source.length - 1]];
}

// Custom version of querySelectorAll that not return elements from nested dialogs.
export function getFocusableNodes(node: Element | null | undefined): Element[] {
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

function isFocusable(node: Element) {
  return Boolean(
    node.matches(
      `a[href], button, input:not([type="hidden"]), textarea, select, [tabindex]:not([tabindex="-1"])`
    )
  );
}
