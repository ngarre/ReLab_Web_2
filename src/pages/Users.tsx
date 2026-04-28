// Importo hooks de React:
// - useEffect para ejecutar lógica al montar o cuando cambian dependencias
// - useMemo para memorizar cálculos derivados
// - useState para guardar estado local
import { useEffect, useMemo, useState } from 'react';

// Hook de navegación programática
import { useNavigate } from 'react-router-dom';

// Componentes reutilizables de feedback visual
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';

// Hook y componente de paginación
import { usePagination } from '../hooks/usePagination';
import { Pagination } from '../components/Pagination';

// Hook de autenticación para obtener datos de la sesión actual
import { useAuth } from '../hooks/useAuth';

// Utilidad compartida para formatear fechas en español
import { formatSpanishDate } from '../utils/date';

// Servicios de usuario:
// - borrar cuenta
// - obtener usuarios
// - actualizar usuario
import {
  deleteUserAccount,
  getUsers,
  updateUser,
} from '../services/userService';

// Tipo TypeScript de usuario
import type { User } from '../types/User';

// Utilidad para normalizar texto en búsquedas
import { normalizeText } from '../utils/text';

// Estilos específicos de esta pantalla
import './Users.css';

// Utilidades para trabajar con tipos de cuenta
import {
  getAccountTypeLabel,
  isCentroPublico,
  normalizeAccountType,
} from '../utils/user';

// Defino el componente de página
export default function Users() {
   // Del contexto de auth obtengo:
  // - token: necesario para llamadas protegidas al backend
  // - role: rol del usuario autenticado
  // - currentUser: usuario autenticado actual
  // - logout: por si al desactivar/eliminar su propia cuenta hay que cerrar sesión
  const { token, role, user: currentUser, logout } = useAuth();

  // Hook para navegar por código
  const navigate = useNavigate();

   // Estado con la lista completa de usuarios cargados desde backend
  const [users, setUsers] = useState<User[]>([]);

  // Estado de carga inicial
  const [loading, setLoading] = useState(true);

   // Estado para mostrar errores
  const [error, setError] = useState('');

   // Mensaje de acción correcta (activar/desactivar y eliminar)
  const [actionMessage, setActionMessage] = useState('');

  // Guardo el id del usuario que se está eliminando en este momento
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

   // Guardo el id del usuario cuya cuenta se está activando/desactivando
  const [togglingUserId, setTogglingUserId] = useState<number | null>(null);

  // Estado del buscador
  const [searchTerm, setSearchTerm] = useState('');

   // Estado de la clave de ordenación
  const [sortKey, setSortKey] = useState('nickname');

  // Estado de la dirección de orden
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

   // Estado del filtro por estado de cuenta
  const [statusFilterKey, setStatusFilterKey] = useState('all');

  // Estado del filtro por rol
  const [roleFilterKey, setRoleFilterKey] = useState('all');

  // Opciones de filtro por tipo de cuenta
  const [accountTypeFilterKey, setAccountTypeFilterKey] = useState('all');

  // Opciones del select de ordenación
  const sortOptions = [
    { key: 'nickname', label: 'Nickname (A-Z)' },
    { key: 'nombre', label: 'Nombre' },
    { key: 'fechaAlta', label: 'Fecha de alta' },
  ];

  // Opciones del filtro por estado de cuenta
  const statusFilterOptions = [
    { key: 'all', label: 'Todos los usuarios' },
    { key: 'active', label: 'Solo activos' },
    { key: 'inactive', label: 'Solo inactivos' },
  ];

  // Opciones del filtro por rol
  const roleFilterOptions = [
    { key: 'all', label: 'Todos los roles' },
    { key: 'ADMIN', label: 'ADMIN' },
    { key: 'GESTOR', label: 'GESTOR' },
    { key: 'CLIENTE', label: 'CLIENTE' },
  ];

  // Opciones del filtro por tipo de cuenta
  const accountTypeFilterOptions = [
    { key: 'all', label: 'Todos los tipos' },
    { key: 'empresa', label: 'EMPRESA' },
    { key: 'particular', label: 'PARTICULAR' },
    { key: 'centro_publico', label: 'CENTRO PÚBLICO' },
  ];

  // Al montar la página, si hay token:
  // - activo loading
  // - limpio errores
  // - pido todos los usuarios al backend
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

  // Si hay actionMessage, lo borro automáticamente después de 4 segundos
  useEffect(() => {
    if (!actionMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setActionMessage('');
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [actionMessage]);

  // Función auxiliar para saber si una cuenta está activa
  const isUserActive = (user: User) => Boolean(user.cuentaActiva);

  // Devuelve la clase CSS del badge del tipo de cuenta
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

  // Comprueba si el usuario de la fila es la propia cuenta del usuario autenticado
  const isOwnAccount = (targetUser: User) => currentUser?.id === targetUser.id;

  // Comprueba si el usuario autenticado puede ejecutar acciones sobre una cuenta concreta
  const canExecuteActions = (targetUser: User) => {
     // Sin rol no permito acciones
    if (!role) {
      return false;
    }

    // Si es ADMIN, puede actuar sobre cualquier cuenta
    if (role === 'ADMIN') {
      return true;
    }

    // Si es GESTOR:
    // - puede actuar sobre su propia cuenta
    // - y sobre cuentas de CLIENTE
    if (role === 'GESTOR') {
      return isOwnAccount(targetUser) || targetUser.role === 'CLIENTE';
    }

    return false;
  };

  // Traduce algunos errores del backend a mensajes más claros
  const getActionErrorMessage = (
    rawError: unknown,
    fallbackMessage: string
  ) => {
    // Si el backend ha respondido con un 403,
    // doy un mensaje específico de permisos
    if (rawError instanceof Error && rawError.message.includes('403')) {
      return 'No tienes permisos suficientes para completar esta acción.';
    }

    // Si no, uso el mensaje genérico que me hayan pasado
    return fallbackMessage;
  };

  // Activa o desactiva una cuenta
  const handleToggleAccount = async (targetUser: User) => {
    // Sin token no puedo actualizar cuentas
    if (!token) {
      setError('No hay sesión activa para actualizar cuentas.');
      return;
    }

    // Si el usuario actual no tiene permisos, corto
    if (!canExecuteActions(targetUser)) {
      setError('No tienes permisos para realizar esta acción.');
      return;
    }

    // Calculo el siguiente estado de la cuenta: activo <-> inactivo
    const nextActiveState = !isUserActive(targetUser);

    // Marco que esta cuenta se está actualizando
    setTogglingUserId(targetUser.id);
    setError('');
    setActionMessage('');
  
    try {
      // Llamo al backend enviando solo el cambio de cuentaActiva
      await updateUser(
        targetUser.id,
        {
          cuentaActiva: nextActiveState,
        },
        token
      );

      // Si va bien, actualizo el estado local
      setUsers((currentUsers) =>
        currentUsers.map((user) =>
          user.id === targetUser.id
            ? { ...user, cuentaActiva: nextActiveState }
            : user
        )
      );

      // Si el usuario ha desactivado su propia cuenta,
      // cierro sesión y lo mando a login
      if (isOwnAccount(targetUser) && !nextActiveState) {
        logout();
        navigate('/login', { replace: true });
        return;
      }

      // Si todo va bien, muestro mensaje de acción correcta
      setActionMessage(
        nextActiveState
          ? 'La cuenta se ha activado correctamente.'
          : 'La cuenta se ha desactivado correctamente.'
      );
    } catch (rawError) {
      // Si falla, traduzco el error si hace falta
      setError(
        getActionErrorMessage(
          rawError,
          nextActiveState
            ? 'No se pudo activar la cuenta.'
            : 'No se pudo desactivar la cuenta.'
        )
      );
    } finally {
      // Limpio el estado de “toggle en curso”
      setTogglingUserId(null);
    }
  };

  // Elimina una cuenta
  const handleDeleteAccount = async (targetUser: User) => {
    // Sin token no puedo eliminar
    if (!token) {
      setError('No hay sesión activa para eliminar cuentas.');
      return;
    }

    // Si no tengo permisos, corto
    if (!canExecuteActions(targetUser)) {
      setError('No tienes permisos para realizar esta acción.');
      return;
    }

   // Confirmación distinta si elimino mi propia cuenta o la de otra persona 
    const confirmed = window.confirm(
      isOwnAccount(targetUser)
        ? '¿Seguro que quieres eliminar tu cuenta? También se borrarán tus datos relacionados.'
        : '¿Seguro que quieres eliminar esta cuenta? También se borrarán sus datos relacionados.'
    );

    if (!confirmed) {
      return;
    }

    // Marco esta cuenta como “eliminándose”
    setDeletingUserId(targetUser.id);
    setError('');
    setActionMessage('');

    try {
      // Llamo al backend para borrar la cuenta
      await deleteUserAccount(targetUser.id, token);

      // Si ha borrado su propia cuenta, cierro sesión y redirijo
      if (isOwnAccount(targetUser)) {
        logout();
        navigate('/login', { replace: true });
        return;
      }

      // Si no era la propia cuenta, la elimino del estado local
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

  // Resumen general: total, activas e inactivas
  const summary = useMemo(() => {
    const total = users.length;
    const active = users.filter((user) => isUserActive(user)).length;
    const inactive = total - active;

    return { total, active, inactive };
  }, [users]);

  // Resumen por rol
  const roleSummary = useMemo(() => {
    const admin = users.filter((user) => user.role === 'ADMIN').length;
    const gestor = users.filter((user) => user.role === 'GESTOR').length;
    const cliente = users.filter((user) => user.role === 'CLIENTE').length;

    return { admin, gestor, cliente };
  }, [users]);

  // Resumen por tipo de cuenta
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

  // Lista filtrada y ordenada de usuarios
  const filteredUsers = useMemo(() => {
    let result = [...users];

    // Búsqueda por nombre completo, nickname o email
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

    // Filtro por estado de cuenta
    if (statusFilterKey === 'active') {
      result = result.filter((user) => isUserActive(user));
    } else if (statusFilterKey === 'inactive') {
      result = result.filter((user) => !isUserActive(user));
    }

    // Filtro por rol
    if (roleFilterKey !== 'all') {
      result = result.filter((user) => user.role === roleFilterKey);
    }

    // Filtro por tipo de cuenta
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

    // Ordenación por la clave seleccionada
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

  // Pagino los resultados filtrados
  const { currentPage, totalPages, currentData, nextPage, prevPage } =
    usePagination(filteredUsers, 8);

  // Formateo corto de fecha para mostrar en la tabla
  const formatDate = (date: string) =>
    formatSpanishDate(date, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

  // Devuelve el contenido de la celda de acciones para cada usuario
  const renderActionCell = (targetUser: User) => {
    const isToggling = togglingUserId === targetUser.id;
    const isDeleting = deletingUserId === targetUser.id;
    const isBusy = isToggling || isDeleting;

    // Si el usuario actual puede actuar sobre esta cuenta, muestro botones
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

          {/* Ayuda visual extra para GESTOR cuando actúa sobre clientes */}
          {!isOwnAccount(targetUser) &&
            role === 'GESTOR' &&
            targetUser.role === 'CLIENTE' && (
              <span className="users-actions-helper">Cuenta cliente</span>
            )}
        </div>
      );
    }

    // Si no tiene permiso, muestro una etiqueta de bloqueo
    return <span className="users-management-pill blocked">Sin permiso</span>;
  };

  // Si está cargando, muestro Loading
  if (loading) {
    return <Loading />;
  }

  // Si hubo error y además no tengo usuarios cargados, devuelvo pantalla de error
  if (error && !users.length) {
    return <ErrorMessage message={error} />;
  }

  // Render principal de la página
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