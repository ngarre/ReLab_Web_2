import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageUploader } from '../components/ImageUploader';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { deleteUserAccount } from '../services/userService';
import { getProducts } from '../services/productService';
import './Profile.css';

export default function Profile() {
  const navigate = useNavigate();
  const { user, role, token, isLoading, logout } = useAuth();

  const [error, setError] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [publishedProductsCount, setPublishedProductsCount] = useState(0);
  const [profileStatsLoading, setProfileStatsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');

  useEffect(() => {
    if (!user) {
      setProfileStatsLoading(false);
      return;
    }

    setProfileStatsLoading(true);
    setProductsError('');

    getProducts()
      .then((products) => {
        const ownPublishedProducts = products.filter(
          (product) => product.usuario?.id === user.id && product.activo
        ).length;

        setPublishedProductsCount(ownPublishedProducts);
      })
      .catch(() => {
        setProductsError('No se pudieron cargar los productos publicados del perfil.');
        setPublishedProductsCount(0);
      })
      .finally(() => setProfileStatsLoading(false));
  }, [user]);

  if (isLoading || profileStatsLoading) {
    return (
      <main className="main-content-area">
        <h1 className="page-title">Mi Perfil</h1>
        <div className="page-title-separator"></div>
        <p className="page-subtitle">
          Cargando datos de la cuenta...
        </p>
        <Loading />
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const getRoleLabel = () => role;

  const getRoleBadgeClassName = () =>
    `profile-role-badge profile-role-badge-${role?.toLowerCase() ?? 'cliente'}`;

  const getAccountTypeLabel = (tipoUsuario?: string | null) => {
    const normalizedType = (tipoUsuario ?? '').trim().toLowerCase();

    if (normalizedType === 'empresa') {
      return 'EMPRESA';
    }

    if (
      normalizedType === 'centro_publico' ||
      normalizedType === 'centro público'
    ) {
      return 'CENTRO PÚBLICO';
    }

    return 'PARTICULAR';
  };

  const formatDate = (rawDate?: string | null) => {
    if (!rawDate || !rawDate.trim()) {
      return 'No disponible';
    }

    const normalizedDate = rawDate.trim();

    const isoDate = normalizedDate.includes('T')
      ? normalizedDate.split('T')[0]
      : normalizedDate;

    if (/^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
      const [year, month, day] = isoDate.split('-').map(Number);
      const parsed = new Date(year, month - 1, day);

      return parsed.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    const parsed = new Date(normalizedDate);

    if (!Number.isNaN(parsed.getTime())) {
      return parsed.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    }

    return normalizedDate;
  };

  const handleDeleteAccount = async () => {
    if (!token) {
      setError('No hay sesión activa para eliminar la cuenta.');
      return;
    }

    const confirmed = window.confirm(
      '¿Seguro que quieres eliminar tu cuenta? Esta acción también borrará tus datos relacionados y no se puede deshacer.'
    );

    if (!confirmed) {
      return;
    }

    setIsDeleting(true);
    setError('');

    try {
      await deleteUserAccount(user.id, token);
      logout();
      navigate('/', { replace: true });
    } catch {
      setError('No se pudo eliminar tu cuenta.');
    } finally {
      setIsDeleting(false);
    }
  };

  const feedbackError = error || productsError;

  return (
    <main className="main-content-area">
      <h1 className="page-title">Mi Perfil</h1>
      <div className="page-title-separator"></div>

      <p className="page-subtitle">
        Consulta tu información personal y gestiona tu cuenta dentro de ReLab.
      </p>

      {feedbackError && <ErrorMessage message={feedbackError} />}

      <div className="profile-layout">
        <section className="profile-hero-card">
          <div className="profile-hero-main">
            <div className="profile-avatar-placeholder">
              {user.nombre?.charAt(0)}
              {user.apellido?.charAt(0)}
            </div>

            <div className="profile-hero-text">
              <p className="profile-eyebrow">Cuenta personal</p>
              <h2 className="profile-name">
                {user.nombre} {user.apellido}
              </h2>
              <p className="profile-email">{user.email}</p>

              <div className="profile-badges">
                <span className={getRoleBadgeClassName()}>{getRoleLabel()}</span>
                <span className="profile-account-type-badge">
                  {getAccountTypeLabel(user.tipoUsuario)}
                </span>
              </div>
            </div>
          </div>

          <div className="profile-hero-meta">
            <article className="profile-meta-card">
              <span className="profile-meta-label">Nickname</span>
              <strong>@{user.nickname}</strong>
            </article>

            <article className="profile-meta-card">
              <span className="profile-meta-label">Fecha de alta</span>
              <strong>{formatDate(user.fechaAlta)}</strong>
            </article>

            <article className="profile-meta-card">
              <span className="profile-meta-label">Productos publicados</span>
              <strong>{publishedProductsCount}</strong>
            </article>
          </div>
        </section>

        <div className="profile-content-grid">
          <section className="profile-panel">
            <div className="profile-panel-header">
              <h3>Imagen de perfil</h3>
              <p>
                La subida de imagen se mantiene como demostración de integración
                con Cloudinary.
              </p>
            </div>

            <ImageUploader />

            <p className="profile-panel-help">
              Actualmente esta imagen no se vincula de forma persistente a la
              cuenta del usuario en la base de datos.
            </p>
          </section>

          <section className="profile-panel">
            <div className="profile-panel-header">
              <h3>Datos de la cuenta</h3>
              <p>Resumen rápido de la información disponible en tu perfil.</p>
            </div>

            <div className="profile-details-list">
              <div className="profile-detail-row">
                <span>Nombre completo</span>
                <strong>
                  {user.nombre} {user.apellido}
                </strong>
              </div>

              <div className="profile-detail-row">
                <span>Email</span>
                <strong>{user.email}</strong>
              </div>

              <div className="profile-detail-row">
                <span>Rol</span>
                <strong>{getRoleLabel()}</strong>
              </div>

              <div className="profile-detail-row">
                <span>Tipo de usuario</span>
                <strong>{getAccountTypeLabel(user.tipoUsuario)}</strong>
              </div>

              <div className="profile-detail-row">
                <span>Fecha de nacimiento</span>
                <strong>{formatDate(user.fechaNacimiento)}</strong>
              </div>
            </div>
          </section>
        </div>

        <section className="profile-danger-zone">
          <div className="profile-danger-copy">
            <h3>Zona de peligro</h3>
            <p>
              Desde aquí puedes eliminar tu cuenta. Esta acción es permanente y
              eliminará también los datos asociados.
            </p>
          </div>

          <button
            type="button"
            className="profile-danger-btn"
            onClick={handleDeleteAccount}
            disabled={isDeleting}
          >
            {isDeleting ? 'Eliminando cuenta...' : 'Eliminar mi cuenta'}
          </button>
        </section>
      </div>
    </main>
  );
}