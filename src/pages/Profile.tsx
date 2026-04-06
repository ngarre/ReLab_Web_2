import { ImageUploader } from '../components/ImageUploader.tsx';
import { useAuth } from '../hooks/useAuth';
import './Profile.css';

export default function Profile() {
  const { user, role, isLoading } = useAuth();

  if (isLoading) {
    return (
      <main className="main-content-area">
        <h1 className="page-title">Mi Perfil</h1>
        <div className="page-title-separator"></div>
        <p>Cargando datos de la cuenta...</p>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <main className="main-content-area">
      <h1 className="page-title">Mi Perfil</h1>
      <div className="page-title-separator"></div>

      <div className="profile-container">
        <section className="profile-info-section">
          <div className="profile-card-header">
            <ImageUploader />

            <div className="profile-text">
              <h2>{user.nombre} {user.apellido}</h2>
              <p className="profile-email">{user.email}</p>
              <span className="admin-badge">{role}</span>
            </div>
          </div>

          <div className="profile-details">
            <p><strong>Nickname:</strong> @{user.nickname}</p>
            <p><strong>Tipo de usuario:</strong> {user.tipoUsuario}</p>
            <p><strong>Dirección:</strong> {user.direccion || 'No disponible'}</p>
          </div>
        </section>

        <section className="profile-settings">
          <h3>Imagen de perfil</h3>
          <p>
            La subida de imagen se mantiene como demostración de integración con Cloudinary.
            Actualmente esta imagen no se vincula de forma persistente a la cuenta del usuario en la base de datos.
          </p>
        </section>
      </div>
    </main>
  );
}