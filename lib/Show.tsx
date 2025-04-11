import React, { Children } from "react";

interface ShowProps {
  children: React.ReactNode;
  when: boolean | boolean[];
}

export function Show(props: ShowProps) {
  const { children, when } = props;

  if (Array.isArray(when)) {
    const index = when.findIndex((item) => item === true);
    return Children.toArray(children)[index] || null;
  } else if (typeof when === "boolean") {
    return when ? children : null;
  }

  return null;
}
