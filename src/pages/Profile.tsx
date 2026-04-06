import { ImageUploader } from '../components/ImageUploader.tsx';
import './Profile.css';

export default function Profile() {
  return (
    <main className="main-content-area">
      <h1 className="page-title">Mi Perfil</h1>
      <div className="page-title-separator"></div>
      
      <div className="profile-container">
        <section className="profile-info-section">
          <div className="profile-card-header">
            <ImageUploader /> 
            
            <div className="profile-text">
              <h2>Administrador</h2>
              <p className="profile-email">admin@relab.com</p>
              <span className="admin-badge">CUENTA VERIFICADA</span>
            </div>
          </div>
        </section>

        <section className="profile-settings">
          <h3>Ajustes de Cuenta</h3>
          <p>Gestiona la visibilidad de tu perfil y tus preferencias.</p>
        </section>
      </div>
    </main>
  );
}