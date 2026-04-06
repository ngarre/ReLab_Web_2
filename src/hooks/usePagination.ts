import { useState, useMemo, useEffect } from 'react';

// <T,> es un "Genérico": significa que este hook sirve para una lista de productos, 
// de usuarios o de cualquier cosa (T de Type).
export const usePagination = <T,>(data: T[], itemsPerPage: number) => {
  const [currentPage, setCurrentPage] = useState(1); // Estado para saber en qué página estamos (empezamos en la 1)

  // Math.ceil redondea hacia arriba. 
  // Si tienes 17 productos y quieres 8 por página: 17 / 8 = 2.12 -> Necesitas 3 páginas.
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Si el usuario filtra (ej: busca "Microscopio") y la lista cambia de tamaño, 
  // volvemos automáticamente a la página 1 para que no se quede en una página vacía
  useEffect(() => {
    setCurrentPage(1);
  }, [data.length]); 

  // Cada vez que cambias de página, la web sube arriba del todo suavemente.
  useEffect(() => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth' 
    });
  }, [currentPage]); 

  // Aquí determino que 8 elementos mostrar:
  const currentData = useMemo(() => {
    // Si estoy en la pág 1: (1-1) * 8 = 0. Empieza en el índice 0.
    // Si estoy en la pág 2: (2-1) * 8 = 8. Empieza en el índice 8.
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    // .slice() es un método de JS que corta un trozo del array sin romper el original.
    // "Corta desde el inicio hasta el fin". 
    // Incluye el elemento en la posición "start",
    // Excluye el elemento en la posición "end".
    return data.slice(start, end);
  }, [data, currentPage, itemsPerPage]);

  // Ir a la siguiente página, pero sin pasarnos del total (Math.min)
  const nextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  // Ir a la anterior, pero sin bajar de 1 (Math.max)
  const prevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1)); // "prev" es el nombre que he dado al ultimo valor del estado currentPage
  };

  return {
    currentPage,
    totalPages,
    currentData,
    nextPage,
    prevPage,
  };
};