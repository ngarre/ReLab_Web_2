import { useEffect, useState, useMemo } from "react";
import { getProducts } from "../services/productService";
import { Loading } from "../components/Loading";
import { ErrorMessage } from "../components/ErrorMessage";
import { ProductCard } from "../components/ProductCard";
import { SearchBar } from "../components/SearchBar";
import { usePagination } from "../hooks/usePagination";
import { Pagination } from "../components/Pagination";
import type { Product } from "../types/Product";
import { ContactForm } from "../components/ContactForm";

export default function Home() {
  // -- Estados carga PRODUCTOS --
  // El array de productos empieza vacío antes de que lleguen datos de la API,
  // si el valor fuera null, la aplicación petaría.  Un array vacío es seguro.
  const [products, setProducts] = useState<Product[]>([]); // Lista de objetos de tipo Product[] --> siguen el molde Product definido en Product.ts  
  // Empiezo cargando el componente loading porque nada más abrir la web todavía no hay datos.
  const [loading, setLoading] = useState(true);
  // Por defecto, dejo vacío el componente de error y no se muestra.  Se muestra si falla la carga de datos.
  const [error, setError] = useState("");

  // -- Estados del BUSCADOR --
  const [searchTerm, setSearchTerm] = useState(''); // Guarda texto que usuario escribe en barra de búsqueda
  const [sortKey, setSortKey] = useState('nombre'); // Guarda criterio por el que queremos ordenar (por defecto es por nombre)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc'); // Guarda si el orden es ascendente o descendente
  const [filterKey, setFilterKey] = useState('all'); // Guarda el filtro de estado si queremos ver todos (por defecto), solo activos o solo inactivos.  

  // Lista de opciones para el desplegable de ordenación
  const sortOptions = [
    { key: 'nombre', label: 'Nombre (A-Z)' }, // Para ordenar alfabéticamente
    { key: 'fechaActualizacion', label: 'Fecha' }, // Para ver los más recientes/antiguos
    { key: 'precio', label: 'Precio' }, // Para ordenar por coste
  ];

  // Lista de opciones para el desplegable de filtrado por estado
  const filterOptions = [
    { key: 'all', label: 'Productos Publicados' } // VER QUÉ HAGO CON ESTO
    
  ];

  
  useEffect(() => {
    setLoading(true);
    setError('');

    getProducts()
      .then((data) => setProducts(data))
      .catch(() => setError("No se pudo cargar el catálogo de productos."))
      .finally(() => setLoading(false));
  }, []);


  // Con useMemo guardo el resultado del filtrado en caché.
  // Solo se vuelve a calcular la lista si cambian los productos o los filtros del final []*
  const filteredProducts = useMemo(() => {
    let result = products.filter(product => product.activo); // Creo copia del array productos activos para realizar la ordenación sobre dicha copia

    // Compruebo si el usuario ha escrito algo en el buscador
    if (searchTerm) {
      // Convierto lo que escribe el usuario a minúsculas
      const termLower = searchTerm.toLowerCase();
      // Sobreescribo "result" filtrando la lista actual
      result = result.filter(p =>
        // Compruebo si el nombre del producto incluye el texto 
        p.nombre.toLowerCase().includes(termLower) ||
        // o bien si lo incluye la descripción
        p.descripcion.toLowerCase().includes(termLower)
      );
    }

    // Si el usuario selecciona "Solo Activos" en el desplegable, me quedo solo con los productos donde activo es true
    if (filterKey === 'active') {
      result = result.filter(p => p.activo);
      // Si selecciona "Solo inactivos", me quedo con productos donde activo es false
    } else if (filterKey === 'inactive') {
      result = result.filter(p => !p.activo);
    }

    // Ordeno la lista que ha sido filtrada arriba
    result.sort((a, b) => {
      let comparison = 0; // Por defecto asumo que son iguales

      // Accedo a la propiedad del producto usando sortKey (ej: a['precio'])
      // 'as keyof Product' le dice a TS que sortKey es una propiedad válida de un producto
      const aValue = a[sortKey as keyof Product];
      const bValue = b[sortKey as keyof Product];

      // 2. Control de nulos (Importante para productos sin descripción)
      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // 3. Normalización con variables auxiliares
      // Comprobamos si es un string (para el nombre) o un número (para el precio)
      const valA = typeof aValue === 'string' ? aValue.toLowerCase().trim() : aValue;
      const valB = typeof bValue === 'string' ? bValue.toLowerCase().trim() : bValue;

      if (valA > valB) comparison = 1; // Si el valor de A es mayor que B (ej: precio 20 > 10)
      else if (valA < valB) comparison = -1;  // Si A es menor (ej: 5€ < 10€), lo marcamos con -1

      // Lógica de dirección: 
      // Si es 'asc', devuelve 1 o -1. 
      // Si es 'desc', multiplica por -1 para darle la vuelta al orden (1 pasa a ser -1)

      return sortDirection === 'asc' ? comparison : comparison * -1;
    });

    // Finalmente, useMemo entrega el resultado listo para mostrar
    return result;
  }, [products, searchTerm, sortKey, sortDirection, filterKey]); // Estos filtros * --> Si ninguna de estas variables cambia, useMemo no trabaja


  // --- PAGINACIÓN: su lógica está en el Hook usePagination ---
  const {
    currentPage,
    totalPages,
    currentData,
    nextPage,
    prevPage
  } = usePagination(filteredProducts, 8);


  return (
    // Contenedor principal de la página
    <main className="main-content-area">

      {/* Título principal y elementos separador decorativo */}
      <h1 className="page-title">Nuestros Productos</h1>
      <div className="page-title-separator"></div>
      <p className="page-subtitle">
        Ahorra dando una segunda vida a equipos científicos
      </p>

      {/* Bloque del buscador: Aquí "inyecto" el componente SearchBar */}
      <div className="search-filter-area">
        <SearchBar
          // Pasamos todos los estados y funciones que definimos arriba como "Props" al hijo que es el SearchBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          placeholder="Buscar por nombre o descripción..."
          sortKey={sortKey}
          setSortKey={setSortKey}
          sortDirection={sortDirection}
          setSortDirection={setSortDirection}
          filterKey={filterKey}
          setFilterKey={setFilterKey}
          sortOptions={sortOptions}
          filterOptions={filterOptions}
        />
      </div>


      {loading && <Loading />} {/* Si loading es true, muestra el componente Loading */}
      {error && <ErrorMessage message={error} />} {/* Si error es true, muestra el componente error */}

      {/* Solo muestro contador si no está cargando y no hay error */}
      {!loading && !error && (
        <p className="results-count">
          Mostrando {filteredProducts.length} productos publicados.
        </p>
      )}

      {/* Bloque principal del catálogo (solo si no hay carga ni error) */}
      <section>
        {!loading && !error && (
          <>
            {filteredProducts.length === 0 ? (
              <p>No se encontraron productos.</p>
            ) : (
              <>
                <div className="cards-grid">
                  {currentData.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onNext={nextPage}
                  onPrev={prevPage}
                />
              </>
            )}
          </>
        )}
        <hr /> {/* Linea de separación decorativa */}
        <ContactForm />
      </section>
    </main>
  );
}