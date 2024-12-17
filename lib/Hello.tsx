interface HelloProps {
  children: string;
}

export function Hello(props: HelloProps) {
  return <div className="hello">Hello {props.children}</div>;
}
