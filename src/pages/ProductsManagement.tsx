import { useEffect, useMemo, useState } from 'react';
import { ProductCard } from '../components/ProductCard';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { SearchBar } from '../components/SearchBar';
import { getProducts } from '../services/productService';
import type { Product } from '../types/Product';
import './ProductsManagement.css';

export default function ProductsManagement() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [searchTerm, setSearchTerm] = useState('');
    const [ownerFilter, setOwnerFilter] = useState('');
    const [sortKey, setSortKey] = useState('nombre');
    const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
    const [filterKey, setFilterKey] = useState('all');

    const sortOptions = [
        { key: 'nombre', label: 'Nombre (A-Z)' },
        { key: 'fechaActualizacion', label: 'Fecha' },
        { key: 'precio', label: 'Precio' },
    ];

    const filterOptions = [
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

    const ownerOptions = useMemo(() => {
        const nicknames = products
            .map((product) => product.usuario?.nickname?.trim())
            .filter((nickname): nickname is string => !!nickname);

        return [...new Set(nicknames)].sort((a, b) => a.localeCompare(b, 'es'));
    }, [products]);

    const summary = useMemo(() => {
        const total = products.length;
        const active = products.filter((product) => product.activo).length;
        const inactive = total - active;

        return { total, active, inactive };
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

        if (ownerFilter.trim()) {
            const ownerTerm = ownerFilter.toLowerCase().trim();
            result = result.filter((product) =>
                product.usuario?.nickname?.toLowerCase() === ownerTerm
            );
        }

        if (filterKey === 'active') {
            result = result.filter((product) => product.activo);
        } else if (filterKey === 'inactive') {
            result = result.filter((product) => !product.activo);
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
    }, [products, searchTerm, ownerFilter, sortKey, sortDirection, filterKey]);

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

            <div className="search-filter-area">
                <SearchBar
                    placeholder="Buscar por nombre o descripción..."
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
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

            <div className="owner-filter-area">
                <label htmlFor="owner-filter" className="owner-filter-label">
                    Filtrar por propietario
                </label>
                <select
                    id="owner-filter"
                    value={ownerFilter}
                    onChange={(event) => setOwnerFilter(event.target.value)}
                    className="owner-filter-input"
                >
                    <option value="">Todos los propietarios</option>
                    {ownerOptions.map((nickname) => (
                        <option key={nickname} value={nickname}>
                            {nickname}
                        </option>
                    ))}
                </select>
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
                                <ProductCard key={product.id} product={product} />
                            ))
                        )}
                    </div>
                </>
            )}
        </main>
    );
}