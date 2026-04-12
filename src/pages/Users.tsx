import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/Pagination';
import { useAuth } from '../hooks/useAuth';
import {
  deleteUserAccount,
  getUsers,
  updateUser,
} from '../services/userService';
import type { User } from '../types/User';
import { normalizeText } from '../utils/text';
import './Users.css';
import {
  getAccountTypeLabel,
  isCentroPublico,
  normalizeAccountType,
} from '../utils/user';

export default function Users() {
  const { token, role, user: currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);
  const [togglingUserId, setTogglingUserId] = useState<number | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState('nickname');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [statusFilterKey, setStatusFilterKey] = useState('all');
  const [roleFilterKey, setRoleFilterKey] = useState('all');
  const [accountTypeFilterKey, setAccountTypeFilterKey] = useState('all');

  const sortOptions = [
    { key: 'nickname', label: 'Nickname (A-Z)' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'fechaAlta', label: 'Fecha de alta' },
  ];

  const statusFilterOptions = [
    { key: 'all', label: 'Todos los usuarios' },
    { key: 'active', label: 'Solo activos' },
    { key: 'inactive', label: 'Solo inactivos' },
  ];

  const roleFilterOptions = [
    { key: 'all', label: 'Todos los roles' },
    { key: 'ADMIN', label: 'ADMIN' },
    { key: 'GESTOR', label: 'GESTOR' },
    { key: 'CLIENTE', label: 'CLIENTE' },
  ];

  const accountTypeFilterOptions = [
    { key: 'all', label: 'Todos los tipos' },
    { key: 'empresa', label: 'EMPRESA' },
    { key: 'particular', label: 'PARTICULAR' },
    { key: 'centro_publico', label: 'CENTRO PÚBLICO' },
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

  useEffect(() => {
    if (!actionMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setActionMessage('');
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [actionMessage]);

  const isUserActive = (user: User) => Boolean(user.cuentaActiva);

  const getAccountTypeBadgeClassName = (tipoUsuario?: string | null) => {
    const normalizedType = normalizeAccountType(tipoUsuario);

    if (normalizedType === 'empresa') {
      return 'users-account-type-badge users-account-type-badge-empresa';
    }

    if (isCentroPublico(tipoUsuario)) {
      return 'users-account-type-badge users-account-type-badge-centro-publico';
    }

    return 'users-account-type-badge users-account-type-badge-particular';
  };

  const isOwnAccount = (targetUser: User) => currentUser?.id === targetUser.id;

  const canExecuteActions = (targetUser: User) => {
    if (!role) {
      return false;
    }

    if (role === 'ADMIN') {
      return true;
    }

    if (role === 'GESTOR') {
      return isOwnAccount(targetUser) || targetUser.role === 'CLIENTE';
    }

    return isOwnAccount(targetUser);
  };

  const getActionErrorMessage = (
    rawError: unknown,
    fallbackMessage: string
  ) => {
    if (rawError instanceof Error && rawError.message.includes('403')) {
      return 'No tienes permisos suficientes para completar esta acción.';
    }

    return fallbackMessage;
  };

  const handleToggleAccount = async (targetUser: User) => {
    if (!token) {
      setError('No hay sesión activa para actualizar cuentas.');
      return;
    }

    if (!canExecuteActions(targetUser)) {
      setError('No tienes permisos para realizar esta acción.');
      return;
    }

    const nextActiveState = !isUserActive(targetUser);

    setTogglingUserId(targetUser.id);
    setError('');
    setActionMessage('');

    try {
      await updateUser(
        targetUser.id,
        {
          cuentaActiva: nextActiveState,
        },
        token
      );

      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === targetUser.id
            ? { ...user, cuentaActiva: nextActiveState }
            : user
        )
      );

      if (isOwnAccount(targetUser) && !nextActiveState) {
        logout();
        navigate('/login', { replace: true });
        return;
      }

      setActionMessage(
        nextActiveState
          ? 'La cuenta se ha activado correctamente.'
          : 'La cuenta se ha desactivado correctamente.'
      );
    } catch (rawError) {
      setError(
        getActionErrorMessage(
          rawError,
          nextActiveState
            ? 'No se pudo activar la cuenta.'
            : 'No se pudo desactivar la cuenta.'
        )
      );
    } finally {
      setTogglingUserId(null);
    }
  };

  const handleDeleteAccount = async (targetUser: User) => {
    if (!token) {
      setError('No hay sesión activa para eliminar cuentas.');
      return;
    }

    if (!canExecuteActions(targetUser)) {
      setError('No tienes permisos para realizar esta acción.');
      return;
    }

    const confirmed = window.confirm(
      isOwnAccount(targetUser)
        ? '¿Seguro que quieres eliminar tu cuenta? También se borrarán tus datos relacionados.'
        : '¿Seguro que quieres eliminar esta cuenta? También se borrarán sus datos relacionados.'
    );

    if (!confirmed) {
      return;
    }

    setDeletingUserId(targetUser.id);
    setError('');
    setActionMessage('');

    try {
      await deleteUserAccount(targetUser.id, token);

      if (isOwnAccount(targetUser)) {
        logout();
        navigate('/login', { replace: true });
        return;
      }

      setUsers((currentUsers) =>
        currentUsers.filter((user) => user.id !== targetUser.id)
      );

      setActionMessage('La cuenta se ha eliminado correctamente.');
    } catch (rawError) {
      setError(
        getActionErrorMessage(rawError, 'No se pudo eliminar la cuenta.')
      );
    } finally {
      setDeletingUserId(null);
    }
  };

  const summary = useMemo(() => {
    const total = users.length;
    const active = users.filter((user) => isUserActive(user)).length;
    const inactive = total - active;

    return { total, active, inactive };
  }, [users]);

  const roleSummary = useMemo(() => {
    const admin = users.filter((user) => user.role === 'ADMIN').length;
    const gestor = users.filter((user) => user.role === 'GESTOR').length;
    const cliente = users.filter((user) => user.role === 'CLIENTE').length;

    return { admin, gestor, cliente };
  }, [users]);

  const accountTypeSummary = useMemo(() => {
    const empresa = users.filter(
      (user) => normalizeAccountType(user.tipoUsuario) === 'empresa'
    ).length;

    const centroPublico = users.filter((user) =>
      isCentroPublico(user.tipoUsuario)
    ).length;

    const particular = users.filter((user) => {
      const accountType = normalizeAccountType(user.tipoUsuario);
      return accountType !== 'empresa' && !isCentroPublico(user.tipoUsuario);
    }).length;

    return { empresa, centroPublico, particular };
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

    if (statusFilterKey === 'active') {
      result = result.filter((user) => isUserActive(user));
    } else if (statusFilterKey === 'inactive') {
      result = result.filter((user) => !isUserActive(user));
    }

    if (roleFilterKey !== 'all') {
      result = result.filter((user) => user.role === roleFilterKey);
    }

    if (accountTypeFilterKey !== 'all') {
      if (accountTypeFilterKey === 'empresa') {
        result = result.filter(
          (user) => normalizeAccountType(user.tipoUsuario) === 'empresa'
        );
      } else if (accountTypeFilterKey === 'centro_publico') {
        result = result.filter((user) => isCentroPublico(user.tipoUsuario));
      } else if (accountTypeFilterKey === 'particular') {
        result = result.filter((user) => {
          const accountType = normalizeAccountType(user.tipoUsuario);
          return accountType !== 'empresa' && !isCentroPublico(user.tipoUsuario);
        });
      }
    }

    result.sort((a, b) => {
      let comparison = 0;

      const aValue = a[sortKey as keyof User];
      const bValue = b[sortKey as keyof User];

      if (aValue === bValue) return 0;
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      const valA =
        typeof aValue === 'string' ? aValue.toLowerCase().trim() : aValue;
      const valB =
        typeof bValue === 'string' ? bValue.toLowerCase().trim() : bValue;

      if (valA > valB) comparison = 1;
      else comparison = -1;

      return sortDirection === 'asc' ? comparison : comparison * -1;
    });

    return result;
  }, [
    users,
    searchTerm,
    sortKey,
    sortDirection,
    statusFilterKey,
    roleFilterKey,
    accountTypeFilterKey,
  ]);

  const { currentPage, totalPages, currentData, nextPage, prevPage } =
    usePagination(filteredUsers, 8);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  const renderActionCell = (targetUser: User) => {
    const isToggling = togglingUserId === targetUser.id;
    const isDeleting = deletingUserId === targetUser.id;
    const isBusy = isToggling || isDeleting;

    if (canExecuteActions(targetUser)) {
      return (
        <div className="users-row-actions">
          <button
            type="button"
            className="users-toggle-btn"
            onClick={() => handleToggleAccount(targetUser)}
            disabled={isBusy}
          >
            {isToggling
              ? 'Guardando...'
              : isUserActive(targetUser)
                ? 'Desactivar'
                : 'Activar'}
          </button>

          <button
            type="button"
            className="users-delete-btn"
            onClick={() => handleDeleteAccount(targetUser)}
            disabled={isBusy}
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar'}
          </button>

          {!isOwnAccount(targetUser) &&
            role === 'GESTOR' &&
            targetUser.role === 'CLIENTE' && (
              <span className="users-actions-helper">Cuenta cliente</span>
            )}
        </div>
      );
    }

    return <span className="users-management-pill blocked">Sin permiso</span>;
  };

  if (loading) {
    return <Loading />;
  }

  if (error && !users.length) {
    return <ErrorMessage message={error} />;
  }

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

      {(role === 'ADMIN' || role === 'GESTOR') && (
        <div className="users-role-summary-grid">
          <article className="users-role-summary-card users-role-summary-card-admin">
            <h2>Usuarios ADMIN</h2>
            <p>{roleSummary.admin}</p>
          </article>

          <article className="users-role-summary-card users-role-summary-card-gestor">
            <h2>Usuarios GESTOR</h2>
            <p>{roleSummary.gestor}</p>
          </article>

          <article className="users-role-summary-card users-role-summary-card-cliente">
            <h2>Usuarios CLIENTE</h2>
            <p>{roleSummary.cliente}</p>
          </article>
        </div>
      )}

      <div className="users-account-type-summary-grid">
        <article className="users-account-type-summary-card users-account-type-summary-card-empresa">
          <h2>Cuentas EMPRESA</h2>
          <p>{accountTypeSummary.empresa}</p>
        </article>

        <article className="users-account-type-summary-card users-account-type-summary-card-particular">
          <h2>Cuentas PARTICULAR</h2>
          <p>{accountTypeSummary.particular}</p>
        </article>

        <article className="users-account-type-summary-card users-account-type-summary-card-centro-publico">
          <h2>Cuentas CENTRO PÚBLICO</h2>
          <p>{accountTypeSummary.centroPublico}</p>
        </article>
      </div>

      <p className="users-dashboard-intro">
        Busca usuarios, revisa su rol dentro de la plataforma y consulta el estado actual de su cuenta.
      </p>

      <div className="users-toolbar">
        <div className="users-toolbar-row users-toolbar-row-top">
          <div className="control-group search-input-group">
            <label htmlFor="users-search-term" className="control-label">
              Buscar
            </label>
            <input
              id="users-search-term"
              type="text"
              placeholder="Nickname, nombre, apellido o email..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="search-input"
            />
          </div>

          <div className="control-group sort-select-group">
            <label htmlFor="users-sort-select" className="control-label">
              Ordenar por:
            </label>
            <select
              id="users-sort-select"
              value={sortKey}
              onChange={(event) => setSortKey(event.target.value)}
              className="select-control"
            >
              {sortOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={() =>
              setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
            }
            className="sort-toggle-button"
            title={`Cambiar a orden ${sortDirection === 'asc' ? 'Descendente' : 'Ascendente'
              }`}
          >
            {sortDirection === 'asc' ? '▲ Ascendente' : '▼ Descendente'}
          </button>
        </div>

        <div className="users-toolbar-row users-toolbar-row-bottom">
          <div className="control-group filter-select-group">
            <label htmlFor="users-status-filter-select" className="control-label">
              Estado:
            </label>
            <select
              id="users-status-filter-select"
              value={statusFilterKey}
              onChange={(event) => setStatusFilterKey(event.target.value)}
              className="select-control"
            >
              {statusFilterOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group filter-select-group">
            <label htmlFor="role-filter-select" className="control-label">
              Rol:
            </label>
            <select
              id="role-filter-select"
              value={roleFilterKey}
              onChange={(event) => setRoleFilterKey(event.target.value)}
              className="select-control"
            >
              {roleFilterOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="control-group filter-select-group">
            <label htmlFor="account-type-filter-select" className="control-label">
              Tipo de cuenta:
            </label>
            <select
              id="account-type-filter-select"
              value={accountTypeFilterKey}
              onChange={(event) => setAccountTypeFilterKey(event.target.value)}
              className="select-control"
            >
              {accountTypeFilterOptions.map((option) => (
                <option key={option.key} value={option.key}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {error && <ErrorMessage message={error} />}

      {actionMessage && (
        <p className="users-feedback-message">{actionMessage}</p>
      )}

      <p className="results-count">
        Mostrando {filteredUsers.length} de {users.length} usuarios.
      </p>

      {filteredUsers.length === 0 ? (
        <p className="empty-message">No se encontraron usuarios.</p>
      ) : (
        <>
          <div className="users-table-wrapper">
            <table className="users-table">
              <thead>
                <tr>
                  <th>Nickname</th>
                  <th>Usuario</th>
                  <th>Email</th>
                  <th>Rol</th>
                  <th>Tipo de cuenta</th>
                  <th>Estado</th>
                  <th>Alta</th>
                  <th>Acciones</th>
                </tr>
              </thead>

              <tbody>
                {currentData.map((user) => (
                  <tr
                    key={user.id}
                    className={isOwnAccount(user) ? 'users-table-row-self' : ''}
                  >
                    <td data-label="Nickname">
                      <div className="users-table-nickname-block">
                        <span className="users-table-nickname">
                          @{user.nickname}
                        </span>
                        {isOwnAccount(user) && (
                          <span className="users-self-badge">Tu cuenta</span>
                        )}
                      </div>
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
                        {user.role}
                      </span>
                    </td>

                    <td data-label="Tipo de cuenta">
                      <span
                        className={getAccountTypeBadgeClassName(user.tipoUsuario)}
                      >
                        {getAccountTypeLabel(user.tipoUsuario)}
                      </span>
                    </td>

                    <td data-label="Estado">
                      <span
                        className={`users-status-pill ${isUserActive(user) ? 'active' : 'inactive'
                          }`}
                      >
                        {isUserActive(user) ? 'ACTIVA' : 'INACTIVA'}
                      </span>
                    </td>

                    <td data-label="Alta">{formatDate(user.fechaAlta)}</td>

                    <td data-label="Acciones">{renderActionCell(user)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

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