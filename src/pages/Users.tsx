import { useEffect, useState, useMemo } from 'react';
import { fetchAPI } from '../utils/api';
import { UserCard } from '../components/UserCard';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { SearchBar } from '../components/SearchBar';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/Pagination';
import type { User } from '../types/User';
import { normalizeText } from "../utils/text";


export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('nickname');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterKey, setFilterKey] = useState('all');

  const sortOptions = [
    { key: 'nickname', label: 'Nickname (A-Z)' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'fechaAlta', label: 'Fecha de Alta' },
  ];

  const filterOptions = [
    { key: 'all', label: 'Todos los Usuarios' },
    { key: 'active', label: 'Solo Activos' },
    { key: 'inactive', label: 'Solo Inactivos' },
    { key: 'admin', label: 'Administradores' },
  ];

  useEffect(() => {
    fetchAPI<User[]>('usuarios')
      .then(data => setUsers(data))
      .catch(() => setError('No se pudo cargar el listado de usuarios.'))
      .finally(() => setLoading(false));
  }, []);

  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (searchTerm) {
      const term = normalizeText(searchTerm);

      result = result.filter(u => {
        const fullName = normalizeText(`${u.nombre} ${u.apellido}`);
        const nickname = normalizeText(u.nickname);
        const email = normalizeText(u.email);

        return (
          fullName.includes(term) ||
          nickname.includes(term) ||
          email.includes(term)
        );
      });
    }

    if (filterKey === 'active') {
      result = result.filter(u => u.cuentaActiva);
    } else if (filterKey === 'inactive') {
      result = result.filter(u => !u.cuentaActiva);
    } else if (filterKey === 'admin') {
      result = result.filter(u => u.admin);
    }

    result.sort((a, b) => {
      let comparison = 0;
      const aValue = a[sortKey as keyof User];
      const bValue = b[sortKey as keyof User];
      if (aValue === bValue) return 0;
      // Si aValue está vacío devolvemos 1 y empujamos ese elemento "a" al final de la lista.  Quiero que los elementos con ese campo incompleto queden al final.
      if (aValue === null || aValue === undefined) return 1;
      // Si el vacío es bValue devolvemos -1 y mantenemos al elemento "a" delante.
      if (bValue === null || bValue === undefined) return -1;

      // Solo si el parámetro de filtrado es string lo paso a minúsculas:
      const valA = typeof aValue === 'string' ? aValue.toLowerCase().trim() : aValue; // Si aValue es un string lo pasamos a minúsculas, sino conserva valor aValue
      const valB = typeof bValue === 'string' ? bValue.toLowerCase().trim() : bValue;

      if (valA > valB) comparison = 1; // Ej. Bernardo > Ana --> Devuelve 1 y situa Bernardo detrás de Ana 
      else comparison = -1;
      return sortDirection === 'asc' ? comparison : comparison * -1;
    });

    return result;
  }, [users, searchTerm, sortKey, sortDirection, filterKey]);

  // Inicializar el hook de lógica de paginación (usePagination):  
  const {
    // Esto es lo que nos devuelve
    currentPage,
    totalPages,
    currentData,
    nextPage,
    prevPage
    // Argumentos que pasamos a la función
  } = usePagination(filteredUsers, 8);

  return (
    <main className="main-content-area">
      <h1 className="page-title">Usuarios Registrados</h1>
      <div className="page-title-separator"></div>
      <p className="page-subtitle">Conoce a los usuarios que componen la comunidad de ReLab</p>

      <div className="search-filter-area">
        <SearchBar
          placeholder="Nickname, nombre, apellido o email..."
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

      {loading && <Loading />}
      {error && <ErrorMessage message={error} />}

      {!loading && !error && (
        <>
          <p className="results-count">
            Mostrando {filteredUsers.length} de {users.length} usuarios.
          </p>

          <div className="cards-grid">
            {filteredUsers.length === 0 ? (
              <p className="empty-message">No se encontraron usuarios.</p>
            ) : (
              // 3. Renderizar currentData en lugar de filteredUsers
              currentData.map(user => (
                <UserCard key={user.id} user={user} />
              ))
            )}
          </div>

          {/* Componente de Paginación al final de la grid */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onNext={nextPage} // Se pasa como prop la función nextPage del hook usePagination, así cuando el usuario haga click en "Siguiente" se ejecuta esa función
            onPrev={prevPage}
          />
        </>
      )}
    </main>
  );
}