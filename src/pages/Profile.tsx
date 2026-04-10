import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ImageUploader } from '../components/ImageUploader';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { deleteUserAccount, updateUser } from '../services/userService';
import { getProducts } from '../services/productService';
import './Profile.css';

interface ProfileFormState {
  nombre: string;
  apellido: string;
  email: string;
  fechaNacimiento: string;
  tipoUsuario: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, role, token, isLoading, logout, refreshUser } = useAuth();

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [publishedProductsCount, setPublishedProductsCount] = useState(0);
  const [profileStatsLoading, setProfileStatsLoading] = useState(true);
  const [productsError, setProductsError] = useState('');

  const [formData, setFormData] = useState<ProfileFormState>({
    nombre: '',
    apellido: '',
    email: '',
    fechaNacimiento: '',
    tipoUsuario: 'particular',
  });

  useEffect(() => {
    if (!user) {
      return;
    }

    setFormData({
      nombre: user.nombre ?? '',
      apellido: user.apellido ?? '',
      email: user.email ?? '',
      fechaNacimiento: user.fechaNacimiento ?? '',
      tipoUsuario: user.tipoUsuario ?? 'particular',
    });
  }, [user]);

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

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSuccessMessage('');
    }, 4000);

    return () => window.clearTimeout(timeoutId);
  }, [successMessage]);

  if (isLoading || profileStatsLoading) {
    return (
      <main className="main-content-area">
        <h1 className="page-title">Mi Perfil</h1>
        <div className="page-title-separator"></div>
        <p className="page-subtitle">Cargando datos de la cuenta...</p>
        <Loading />
      </main>
    );
  }

  if (!user) {
    return null;
  }

  const isClient = role === 'CLIENTE';

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

  const normalizeDateForInput = (rawDate?: string | null) => {
    if (!rawDate || !rawDate.trim()) {
      return '';
    }

    return rawDate.includes('T') ? rawDate.split('T')[0] : rawDate;
  };

  const profileHighlightTitle = isClient ? 'Productos publicados' : 'Área de acceso';
  const profileHighlightValue = isClient ? String(publishedProductsCount) : 'Gestión interna';

  const handleInputChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.currentTarget;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    if (error) {
      setError('');
    }

    if (successMessage) {
      setSuccessMessage('');
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setError('');
    setSuccessMessage('');
    setFormData({
      nombre: user.nombre ?? '',
      apellido: user.apellido ?? '',
      email: user.email ?? '',
      fechaNacimiento: normalizeDateForInput(user.fechaNacimiento),
      tipoUsuario: user.tipoUsuario ?? 'particular',
    });
  };

  const handleSaveProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!token) {
      setError('No hay sesión activa para actualizar tu cuenta.');
      return;
    }

    if (!formData.nombre.trim()) {
      setError('El nombre es obligatorio.');
      return;
    }

    if (!formData.apellido.trim()) {
      setError('El apellido es obligatorio.');
      return;
    }

    if (!formData.email.trim()) {
      setError('El email es obligatorio.');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      await updateUser(
        user.id,
        {
          nombre: formData.nombre.trim(),
          apellido: formData.apellido.trim(),
          email: formData.email.trim(),
          fechaNacimiento: formData.fechaNacimiento || undefined,
          tipoUsuario: formData.tipoUsuario,
        },
        token
      );

      await refreshUser();
      setIsEditing(false);
      setSuccessMessage('Tus datos se han actualizado correctamente.');
    } catch {
      setError('No se pudieron actualizar los datos de tu cuenta.');
    } finally {
      setIsSaving(false);
    }
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
    setSuccessMessage('');

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
              <span className="profile-meta-label">{profileHighlightTitle}</span>
              <strong>{profileHighlightValue}</strong>
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
              {successMessage && (
                <p className="profile-inline-success-message">{successMessage}</p>
              )}
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

            <div className="profile-panel-actions">
              <button
                type="button"
                className="profile-secondary-btn"
                onClick={() => {
                  setIsEditing((current) => !current);
                  setError('');
                  setSuccessMessage('');
                }}
              >
                {isEditing ? 'Cerrar edición' : 'Editar datos'}
              </button>
            </div>

            {isEditing && (
              <form className="profile-edit-form" onSubmit={handleSaveProfile}>
                <div className="profile-form-grid">
                  <div className="profile-form-field">
                    <label htmlFor="profile-nombre">Nombre</label>
                    <input
                      id="profile-nombre"
                      name="nombre"
                      type="text"
                      value={formData.nombre}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="profile-form-field">
                    <label htmlFor="profile-apellido">Apellido</label>
                    <input
                      id="profile-apellido"
                      name="apellido"
                      type="text"
                      value={formData.apellido}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="profile-form-field">
                    <label htmlFor="profile-email">Email</label>
                    <input
                      id="profile-email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="profile-form-field">
                    <label htmlFor="profile-fechaNacimiento">Fecha de nacimiento</label>
                    <input
                      id="profile-fechaNacimiento"
                      name="fechaNacimiento"
                      type="date"
                      value={normalizeDateForInput(formData.fechaNacimiento)}
                      onChange={handleInputChange}
                    />
                  </div>

                  <div className="profile-form-field profile-form-field-full">
                    <label htmlFor="profile-tipoUsuario">Tipo de usuario</label>
                    <select
                      id="profile-tipoUsuario"
                      name="tipoUsuario"
                      value={formData.tipoUsuario}
                      onChange={handleInputChange}
                    >
                      <option value="particular">Particular</option>
                      <option value="empresa">Empresa</option>
                      <option value="centro_publico">Centro público</option>
                    </select>
                  </div>
                </div>

                <div className="profile-form-actions">
                  <button
                    type="button"
                    className="profile-secondary-btn"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="profile-primary-btn"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            )}
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