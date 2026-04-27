
// Importo hooks de React:
// - useEffect para cargar datos al montar
// - useMemo para memorizar cálculos derivados
// - useState para estado local
import { useEffect, useMemo, useState } from 'react';

// Tarjeta reutilizable para mostrar cada producto
import { ProductCard } from '../components/ProductCard';

// Componente reutilizable para mostrar un resumen por categoría
import { CategoryUsageSummary } from '../components/CategoryUsageSummary';

// Componentes reutilizables de feedback visual
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';

// Componente reutilizable de paginación
import { Pagination } from '../components/Pagination';
// Hook personalizado de paginación
import { usePagination } from '../hooks/usePagination';

// Servicios para:
// - eliminar un producto
// - obtener todos los productos
// - actualizar un producto
import { deleteProduct, getProducts, updateProduct } from '../services/productService';

// Hook de autenticación para obtener el token de sesión
import { useAuth } from '../hooks/useAuth';

// Tipo TypeScript de producto
import type { Product } from '../types/Product';

// Estilos específicos de esta pantalla
import './ProductsManagement.css';


// Defino el componente de página
export default function ProductsManagement() {
    // Del contexto de auth obtengo el token,
    // necesario para eliminar o actualizar productos
    const { token } = useAuth();

    // Estado con todos los productos cargados desde backend
    const [products, setProducts] = useState<Product[]>([]);

     // Estado de carga inicial
    const [loading, setLoading] = useState(true);

     // Estado para mensajes de error
    const [error, setError] = useState('');

    // Guardo el id del producto que se está eliminando en ese momento.
    // Sirve para desactivar solo ese botón y mostrar feedback visual.
    const [deletingProductId, setDeletingProductId] = useState<number | null>(null);

    // Guardo el id del producto cuyo estado activo/inactivo se está cambiando.
    const [togglingProductId, setTogglingProductId] = useState<number | null>(null);

    // Estado del término de búsqueda
    const [searchTerm, setSearchTerm] = useState('');
     // Estado del filtro por propietario (nickname)
    const [ownerFilter, setOwnerFilter] = useState('');
     // Estado del filtro por categoría
    const [categoryFilter, setCategoryFilter] = useState('');
    // Estado de la clave por la que se ordena
    const [sortKey, setSortKey] = useState('nombre');
     // Estado de la dirección de ordenación
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
     // Estado del filtro de activo/inactivo/todos
    const [filterKey, setFilterKey] = useState('all');

    // Opciones posibles de ordenación para el select
    const sortOptions = [
        { key: 'nombre', label: 'Nombre (A-Z)' },
        { key: 'fechaActualizacion', label: 'Fecha' },
        { key: 'precio', label: 'Precio' },
    ];

    // Opciones posibles del filtro por estado del producto
    const stateOptions = [
        { key: 'all', label: 'Todos los productos' },
        { key: 'active', label: 'Solo activos' },
        { key: 'inactive', label: 'Solo inactivos' },
    ];

    // Al montar la página:
    // - activo loading
    // - limpio error
    // - pido todos los productos al backend
    useEffect(() => {
        setLoading(true);
        setError('');

        getProducts()
            .then((data) => setProducts(data))
            .catch(() => setError('No se pudo cargar la gestión global de productos.'))
            .finally(() => setLoading(false));
    }, []);

    // Resumen general de productos:
    // - total
    // - activos
    // - inactivos
    // Lo memorizo para no recalcularlo en cada render si products no cambia.
    const summary = useMemo(() => {
        const total = products.length;
        const active = products.filter((product) => product.activo).length;
        const inactive = total - active;

        return { total, active, inactive };
    }, [products]);

    // Creo un resumen que indica cuántos productos hay en cada categoría.
    // useMemo hace que este cálculo solo se repita cuando cambia "products".
    const categorySummary = useMemo(() => {
        // Creo un Map vacío para ir guardando:
        // clave   -> nombre de la categoría
        // valor   -> número de productos en esa categoría
        const categoryMap = new Map<string, number>();

        // Recorro todos los productos uno a uno
        products.forEach((product) => {
            // Obtengo el nombre de la categoría del producto.
            // Si no tiene categoría, uso el texto "Sin categoría".
            const categoryName = product.categoria?.nombre || 'Sin categoría';

            // Miro cuántos productos llevaba ya contados esa categoría.
            // Si todavía no había ninguno, empiezo en 0.
            const currentCount = categoryMap.get(categoryName) || 0;

            // Guardo de nuevo esa categoría en el Map,
            // pero sumándole 1 al contador.
            categoryMap.set(categoryName, currentCount + 1);
        });

        // Convierto el Map en array de objetos { name, count }
        // y lo ordeno por:
        // - primero cantidad descendente
        // - si empatan, orden alfabético en español
        return Array.from(categoryMap.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'es'));
    }, [products]);

    // Opciones del filtro por propietario:
    // saco todos los nicknames presentes en los productos,
    // elimino vacíos, quito duplicados y los ordeno.
    const ownerOptions = useMemo(() => {
        const nicknames = products
            .map((product) => product.usuario?.nickname?.trim())
            .filter((nickname): nickname is string => !!nickname);

        return [...new Set(nicknames)].sort((a, b) => a.localeCompare(b, 'es'));
    }, [products]);

    // Opciones del filtro por categoría:
    // saco categorías presentes, elimino inválidas, quito duplicados y ordeno.
    const categoryOptions = useMemo(() => {
        const categories = products
            .map((product) => ({
                id: product.categoria?.id,
                nombre: product.categoria?.nombre,
            }))
            .filter(
                (
                    category
                ): category is { id: number; nombre: string } =>
                    typeof category.id === 'number' && !!category.nombre
            );

        // Uso un Map para eliminar duplicados por id
        const uniqueMap = new Map<number, string>();
        categories.forEach((category) => {
            uniqueMap.set(category.id, category.nombre);
        });

        // Convierto el Map en array de opciones y lo ordeno por nombre
        return Array.from(uniqueMap.entries())
            .map(([id, nombre]) => ({ id, nombre }))
            .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    }, [products]);

    // Productos filtrados y ordenados.
    // Este es uno de los bloques más importantes de la página.
    const filteredProducts = useMemo(() => {
         // Empiezo copiando el array original para no mutarlo directamente
        let result = [...products];

        // Si hay término de búsqueda, filtro por nombre o descripción
        if (searchTerm) {
            const termLower = searchTerm.toLowerCase();
            result = result.filter(
                (product) =>
                    product.nombre.toLowerCase().includes(termLower) ||
                    product.descripcion.toLowerCase().includes(termLower)
            );
        }

        // Filtro por estado activo/inactivo si procede
        if (filterKey === 'active') {
            result = result.filter((product) => product.activo);
        } else if (filterKey === 'inactive') {
            result = result.filter((product) => !product.activo);
        }

         // Si hay filtro por propietario, comparo con el nickname del usuario
        if (ownerFilter.trim()) {
            const ownerTerm = ownerFilter.toLowerCase().trim();
            result = result.filter(
                (product) => product.usuario?.nickname?.toLowerCase() === ownerTerm
            );
        }

        // Si hay filtro por categoría, comparo con el id de categoría
        if (categoryFilter) {
            result = result.filter(
                (product) => String(product.categoria?.id) === categoryFilter
            );
        }

        // Ordeno el resultado final según la clave y dirección actuales
        result.sort((a, b) => {
            let comparison = 0;

            // Obtengo dinámicamente los valores a comparar según sortKey
            const aValue = a[sortKey as keyof Product];
            const bValue = b[sortKey as keyof Product];

             // Si son iguales, no hay diferencia
            if (aValue === bValue) return 0;

            // Mando null/undefined al final
            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            // Si son strings, normalizo a minúsculas y trim para comparar mejor
            const valA = typeof aValue === 'string' ? aValue.toLowerCase().trim() : aValue;
            const valB = typeof bValue === 'string' ? bValue.toLowerCase().trim() : bValue;

            // Comparación básica
            if (valA > valB) comparison = 1;
            else if (valA < valB) comparison = -1;

            // Si el orden es ascendente, devuelvo comparison tal cual.
            // Si es descendente, invierto el signo.
            return sortDirection === 'asc' ? comparison : comparison * -1;
        });

        return result;
    }, [products, searchTerm, ownerFilter, categoryFilter, sortKey, sortDirection, filterKey]);

    // Aplico paginación a la lista filtrada
    const {
        currentPage,
        totalPages,
        currentData,
        nextPage,
        prevPage,
    } = usePagination(filteredProducts, 8);

      // Cambia entre ascendente y descendente
    const toggleSortDirection = () => {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    };

     // Handler para eliminar un producto
    const handleDelete = async (productId: number) => {
         // Si no hay token, no puedo llamar al endpoint protegido
        if (!token) {
            setError('No hay sesión activa para eliminar productos.');
            return;
        }

         // Pido confirmación al usuario antes de eliminar
        const confirmed = window.confirm('¿Seguro que quieres eliminar este producto?');

        if (!confirmed) {
            return;
        }

         // Marco ese producto como "eliminándose"
        setDeletingProductId(productId);
        setError('');

        try {
            // Llamo al backend para eliminar el producto
            await deleteProduct(productId, token);

            // Si va bien, lo quito del estado local
            setProducts((currentProducts) =>
                currentProducts.filter((product) => product.id !== productId)
            );
        } catch {
            // Si falla, muestro error
            setError('No se pudo eliminar el producto.');
        } finally {
            // Pase lo que pase, limpio el estado de eliminación
            setDeletingProductId(null);
        }
    };

     // Handler para activar/desactivar un producto
    const handleToggleActive = async (product: Product) => {
        // Sin token no puedo actualizar
        if (!token) {
            setError('No hay sesión activa para actualizar productos.');
            return;
        }

        // Marco ese producto como "guardándose"
        setTogglingProductId(product.id);
        setError('');

        try {
            // Llamo al backend enviando el producto con el campo activo invertido
            await updateProduct(
                product.id,
                {
                    nombre: product.nombre,
                    descripcion: product.descripcion,
                    precio: product.precio,
                    activo: !product.activo,
                    categoriaId: product.categoria?.id ?? null,
                    modo: product.modo,
                },
                token
            );

            // Si va bien, actualizo el estado local reflejando el nuevo valor de activo
            setProducts((currentProducts) =>
                currentProducts.map((currentProduct) =>
                    currentProduct.id === product.id
                        ? { ...currentProduct, activo: !currentProduct.activo }
                        : currentProduct
                )
            );
        } catch {
            // Si falla, muestro error
            setError('No se pudo actualizar el estado del producto.');
        } finally {
            // Limpio el estado de "toggle en curso"
            setTogglingProductId(null);
        }
    };

    // Render principal de la página
    return (
        <main className="main-content-area">
            <h1 className="page-title">Gestión de Productos</h1>
            <div className="page-title-separator"></div>

            <p className="page-subtitle">
                Vista global de productos para administración y supervisión.
            </p>

            <div className="dashboard-summary-grid">
                <article className="dashboard-summary-card dashboard-summary-card-total">
                    <h2>Total</h2>
                    <p>{summary.total}</p>
                </article>

                <article className="dashboard-summary-card dashboard-summary-card-active">
                    <h2>Activos</h2>
                    <p>{summary.active}</p>
                </article>

                <article className="dashboard-summary-card dashboard-summary-card-inactive">
                    <h2>Inactivos</h2>
                    <p>{summary.inactive}</p>
                </article>
            </div>

            <CategoryUsageSummary
                title="Productos por categoría"
                items={categorySummary}
            />

            <div className="dashboard-filters-panel">
                <div className="dashboard-filters-row">
                    <div className="dashboard-filter-group dashboard-filter-search">
                        <label htmlFor="dashboard-search">Buscar</label>
                        <input
                            id="dashboard-search"
                            type="text"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Buscar por nombre o descripción..."
                            className="dashboard-filter-control"
                        />
                    </div>

                    <div className="dashboard-filter-group">
                        <label htmlFor="dashboard-state-filter">Filtrar</label>
                        <select
                            id="dashboard-state-filter"
                            value={filterKey}
                            onChange={(event) => setFilterKey(event.target.value)}
                            className="dashboard-filter-control"
                        >
                            {stateOptions.map((option) => (
                                <option key={option.key} value={option.key}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="dashboard-filter-group">
                        <label htmlFor="dashboard-sort-key">Ordenar por</label>
                        <select
                            id="dashboard-sort-key"
                            value={sortKey}
                            onChange={(event) => setSortKey(event.target.value)}
                            className="dashboard-filter-control"
                        >
                            {sortOptions.map((option) => (
                                <option key={option.key} value={option.key}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="dashboard-filter-group dashboard-filter-button-group">
                        <label className="dashboard-filter-label-hidden">Dirección</label>
                        <button
                            type="button"
                            onClick={toggleSortDirection}
                            className="sort-toggle-button"
                            title={`Cambiar a orden ${sortDirection === 'asc' ? 'Descendente' : 'Ascendente'}`}
                        >
                            {sortDirection === 'asc' ? '▲ Ascendente' : '▼ Descendente'}
                        </button>
                    </div>
                </div>

                <div className="dashboard-filters-row dashboard-filters-row-secondary">
                    <div className="dashboard-filter-group">
                        <label htmlFor="dashboard-owner-filter">Propietario</label>
                        <select
                            id="dashboard-owner-filter"
                            value={ownerFilter}
                            onChange={(event) => setOwnerFilter(event.target.value)}
                            className="dashboard-filter-control"
                        >
                            <option value="">Todos los propietarios</option>
                            {ownerOptions.map((nickname) => (
                                <option key={nickname} value={nickname}>
                                    {nickname}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="dashboard-filter-group">
                        <label htmlFor="dashboard-category-filter">Categoría</label>
                        <select
                            id="dashboard-category-filter"
                            value={categoryFilter}
                            onChange={(event) => setCategoryFilter(event.target.value)}
                            className="dashboard-filter-control"
                        >
                            <option value="">Todas las categorías</option>
                            {categoryOptions.map((category) => (
                                <option key={category.id} value={String(category.id)}>
                                    {category.nombre}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {loading && <Loading />}
            {error && <ErrorMessage message={error} />}

            {!loading && !error && (
                <>
                    <p className="results-count">
                        Mostrando {filteredProducts.length} de {products.length} productos.
                    </p>

                    <div className="cards-grid">
                        {filteredProducts.length === 0 ? (
                            <p className="empty-message">No se encontraron productos.</p>
                        ) : (
                            currentData.map((product) => (
                                <div key={product.id} className="dashboard-product-card-item">
                                    <ProductCard product={product} />

                                    <div className="dashboard-product-actions">
                                        <button
                                            type="button"
                                            className="dashboard-toggle-product-btn"
                                            onClick={() => handleToggleActive(product)}
                                            disabled={togglingProductId === product.id}
                                        >
                                            {togglingProductId === product.id
                                                ? 'Guardando...'
                                                : product.activo
                                                    ? 'Desactivar'
                                                    : 'Activar'}
                                        </button>

                                        <button
                                            type="button"
                                            className="dashboard-delete-product-btn"
                                            onClick={() => handleDelete(product.id)}
                                            disabled={deletingProductId === product.id}
                                        >
                                            {deletingProductId === product.id ? 'Eliminando...' : 'Eliminar'}
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Paginación solo si hay resultados */}
                    {filteredProducts.length > 0 && (
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onNext={nextPage}
                            onPrev={prevPage}
                        />
                    )}
                </>
            )}
        </main>
    );
}