import { useEffect, useMemo, useState } from 'react';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { SearchBar } from '../components/SearchBar';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/Pagination';
import { useAuth } from '../hooks/useAuth';
import { getUsers } from '../services/userService';
import type { User } from '../types/User';
import { normalizeText } from '../utils/text';
import './Users.css';

export default function Users() {
  const { token } = useAuth();

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
    { key: 'fechaAlta', label: 'Fecha de alta' },
  ];

  const filterOptions = [
    { key: 'all', label: 'Todos los usuarios' },
    { key: 'active', label: 'Solo activos' },
    { key: 'inactive', label: 'Solo inactivos' },
    { key: 'admin', label: 'Solo ADMIN' },
    { key: 'gestor', label: 'Solo GESTOR' },
    { key: 'cliente', label: 'Solo CLIENTE' },
  ];

  useEffect(() => {
    if (!token) {
      return;
    }

    setLoading(true);
    setError('');

    getUsers(token)
      .then((data) => setUsers(data))
      .catch(() => setError('No se pudo cargar el dashboard de usuarios.'))
      .finally(() => setLoading(false));
  }, [token]);

  const isUserActive = (user: User) => Boolean(user.cuentaActiva);

  const summary = useMemo(() => {
    const total = users.length;
    const active = users.filter((user) => isUserActive(user)).length;
    const inactive = total - active;

    return { total, active, inactive };
  }, [users]);

  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (searchTerm) {
      const term = normalizeText(searchTerm);

      result = result.filter((user) => {
        const fullName = normalizeText(`${user.nombre} ${user.apellido}`);
        const nickname = normalizeText(user.nickname);
        const email = normalizeText(user.email);

        return (
          fullName.includes(term) ||
          nickname.includes(term) ||
          email.includes(term)
        );
      });
    }

    if (filterKey === 'active') {
      result = result.filter((user) => isUserActive(user));
    } else if (filterKey === 'inactive') {
      result = result.filter((user) => !isUserActive(user));
    } else if (filterKey === 'admin') {
      result = result.filter((user) => user.role === 'ADMIN');
    } else if (filterKey === 'gestor') {
      result = result.filter((user) => user.role === 'GESTOR');
    } else if (filterKey === 'cliente') {
      result = result.filter((user) => user.role === 'CLIENTE');
    }

    result.sort((a, b) => {
      let comparison = 0;

      const aValue = a[sortKey as keyof User];
      const bValue = b[sortKey as keyof User];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const valA = typeof aValue === 'string' ? aValue.toLowerCase().trim() : aValue;
      const valB = typeof bValue === 'string' ? bValue.toLowerCase().trim() : bValue;

      if (valA > valB) comparison = 1;
      else comparison = -1;

      return sortDirection === 'asc' ? comparison : comparison * -1;
    });

    return result;
  }, [users, searchTerm, sortKey, sortDirection, filterKey]);

  const {
    currentPage,
    totalPages,
    currentData,
    nextPage,
    prevPage,
  } = usePagination(filteredUsers, 8);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const getRoleLabel = (role: User['role']) => role;
  const getStatusLabel = (user: User) => (isUserActive(user) ? 'ACTIVA' : 'INACTIVA');

  return (
    <main className="main-content-area">
      <h1 className="page-title">Gestión de Usuarios</h1>
      <div className="page-title-separator"></div>
      <p className="page-subtitle">
        Supervisa las cuentas registradas en ReLab y consulta su estado de forma rápida.
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

      <p className="users-dashboard-intro">
        Busca usuarios, revisa su rol dentro de la plataforma y consulta el estado actual de su cuenta.
      </p>

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

          {filteredUsers.length === 0 ? (
            <p className="empty-message">No se encontraron usuarios.</p>
          ) : (
            <div className="users-table-wrapper">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Nickname</th>
                    <th>Usuario</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Estado</th>
                    <th>Alta</th>
                  </tr>
                </thead>

                <tbody>
                  {currentData.map((user) => (
                    <tr key={user.id}>
                      <td data-label="Nickname" className="users-table-nickname">
                        @{user.nickname}
                      </td>

                      <td data-label="Usuario">
                        <div className="users-table-user-block">
                          <span className="users-table-fullname">
                            {user.nombre} {user.apellido}
                          </span>
                        </div>
                      </td>

                      <td data-label="Email" className="users-table-email">
                        {user.email}
                      </td>

                      <td data-label="Rol">
                        <span
                          className={`users-role-badge users-role-badge-${user.role.toLowerCase()}`}
                        >
                          {getRoleLabel(user.role)}
                        </span>
                      </td>

                      <td data-label="Estado">
                        <span
                          className={`users-status-pill ${isUserActive(user) ? 'active' : 'inactive'
                            }`}
                        >
                          {getStatusLabel(user)}
                        </span>
                      </td>

                      <td data-label="Alta">{formatDate(user.fechaAlta)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onNext={nextPage}
            onPrev={prevPage}
          />
        </>
      )}
    </main>
  );
}