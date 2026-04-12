interface AuthRouteLoadingProps {
  message: string;
}

export function AuthRouteLoading({ message }: AuthRouteLoadingProps) {
  return (
    <main className="main-content-area">
      <h1 className="page-title">Cargando...</h1>
      <div className="page-title-separator"></div>
      <p>{message}</p>
    </main>
  );
}