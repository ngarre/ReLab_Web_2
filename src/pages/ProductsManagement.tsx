import { useEffect, useMemo, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { deleteProduct, getProducts } from '../services/productService';
import { useAuth } from '../hooks/useAuth';
import type { Product } from '../types/Product';
import './ProductsManagement.css';

export default function ProductsManagement() {

    const { token } = useAuth();

    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [deletingProductId, setDeletingProductId] = useState<number | null>(null);

    const [searchTerm, setSearchTerm] = useState('');
    const [ownerFilter, setOwnerFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [sortKey, setSortKey] = useState('nombre');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [filterKey, setFilterKey] = useState('all');

    const sortOptions = [
        { key: 'nombre', label: 'Nombre (A-Z)' },
        { key: 'fechaActualizacion', label: 'Fecha' },
        { key: 'precio', label: 'Precio' },
    ];

    const stateOptions = [
        { key: 'all', label: 'Todos los productos' },
        { key: 'active', label: 'Solo activos' },
        { key: 'inactive', label: 'Solo inactivos' },
    ];

    useEffect(() => {
        setLoading(true);
        setError('');

        getProducts()
            .then((data) => setProducts(data))
            .catch(() => setError('No se pudo cargar la gestión global de productos.'))
            .finally(() => setLoading(false));
    }, []);

    const summary = useMemo(() => {
        const total = products.length;
        const active = products.filter((product) => product.activo).length;
        const inactive = total - active;

        return { total, active, inactive };
    }, [products]);

    const categorySummary = useMemo(() => {
        const categoryMap = new Map<string, number>();

        products.forEach((product) => {
            const categoryName = product.categoria?.nombre || 'Sin categoría';
            const currentCount = categoryMap.get(categoryName) || 0;
            categoryMap.set(categoryName, currentCount + 1);
        });

        return Array.from(categoryMap.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'es'));
    }, [products]);

    const ownerOptions = useMemo(() => {
        const nicknames = products
            .map((product) => product.usuario?.nickname?.trim())
            .filter((nickname): nickname is string => !!nickname);

        return [...new Set(nicknames)].sort((a, b) => a.localeCompare(b, 'es'));
    }, [products]);

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

        const uniqueMap = new Map<number, string>();
        categories.forEach((category) => {
            uniqueMap.set(category.id, category.nombre);
        });

        return Array.from(uniqueMap.entries())
            .map(([id, nombre]) => ({ id, nombre }))
            .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
    }, [products]);

    const filteredProducts = useMemo(() => {
        let result = [...products];

        if (searchTerm) {
            const termLower = searchTerm.toLowerCase();
            result = result.filter((product) =>
                product.nombre.toLowerCase().includes(termLower) ||
                product.descripcion.toLowerCase().includes(termLower)
            );
        }

        if (filterKey === 'active') {
            result = result.filter((product) => product.activo);
        } else if (filterKey === 'inactive') {
            result = result.filter((product) => !product.activo);
        }

        if (ownerFilter.trim()) {
            const ownerTerm = ownerFilter.toLowerCase().trim();
            result = result.filter(
                (product) => product.usuario?.nickname?.toLowerCase() === ownerTerm
            );
        }

        if (categoryFilter) {
            result = result.filter(
                (product) => String(product.categoria?.id) === categoryFilter
            );
        }

        result.sort((a, b) => {
            let comparison = 0;

            const aValue = a[sortKey as keyof Product];
            const bValue = b[sortKey as keyof Product];

            if (aValue === bValue) return 0;
            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            const valA = typeof aValue === 'string' ? aValue.toLowerCase().trim() : aValue;
            const valB = typeof bValue === 'string' ? bValue.toLowerCase().trim() : bValue;

            if (valA > valB) comparison = 1;
            else if (valA < valB) comparison = -1;

            return sortDirection === 'asc' ? comparison : comparison * -1;
        });

        return result;
    }, [products, searchTerm, ownerFilter, categoryFilter, sortKey, sortDirection, filterKey]);

    const toggleSortDirection = () => {
        setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    };

    const handleDelete = async (productId: number) => {
        if (!token) {
            setError('No hay sesión activa para eliminar productos.');
            return;
        }

        const confirmed = window.confirm('¿Seguro que quieres eliminar este producto?');

        if (!confirmed) {
            return;
        }

        setDeletingProductId(productId);
        setError('');

        try {
            await deleteProduct(productId, token);
            setProducts((currentProducts) =>
                currentProducts.filter((product) => product.id !== productId)
            );
        } catch {
            setError('No se pudo eliminar el producto.');
        } finally {
            setDeletingProductId(null);
        }
    };

    return (
        <main className="main-content-area">
            <h1 className="page-title">Gestión de Productos</h1>
            <div className="page-title-separator"></div>

            <p className="page-subtitle">
                Vista global de productos para administración y supervisión.
            </p>

            <div className="dashboard-summary-grid">
                <article className="dashboard-summary-card">
                    <h2>Total</h2>
                    <p>{summary.total}</p>
                </article>

                <article className="dashboard-summary-card">
                    <h2>Activos</h2>
                    <p>{summary.active}</p>
                </article>

                <article className="dashboard-summary-card">
                    <h2>Inactivos</h2>
                    <p>{summary.inactive}</p>
                </article>
            </div>

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

            <div className="dashboard-category-summary">
                <h2 className="dashboard-section-title">Productos por categoría</h2>

                {categorySummary.length === 0 ? (
                    <p className="empty-message">No hay datos de categorías disponibles.</p>
                ) : (
                    <div className="dashboard-category-list">
                        {categorySummary.map((category) => (
                            <article key={category.name} className="dashboard-category-card">
                                <h3>{category.name}</h3>
                                <p>{category.count} productos</p>
                            </article>
                        ))}
                    </div>
                )}
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
                            filteredProducts.map((product) => (
                                <div key={product.id} className="dashboard-product-card-item">
                                    <ProductCard product={product} />

                                    <div className="dashboard-product-actions">
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
                </>
            )}
        </main>
    );
}