export function Combobox2(props) {
  const { children, ...rest } = props;
  return <div {...rest}>{children}</div>;
}

export function ComboboxInput(props) {
  return <input type="text" {...props} />;
}

export function ComboboxList(props) {
  const { children, ...rest } = props;
  return <ul {...rest}>{children}</ul>;
}
