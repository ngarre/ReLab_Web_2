interface Props {
  message: string;
}

export function ErrorMessage({ message }: Props) {
  return <div style={{ color: "red" }}>{message}</div>;
}
