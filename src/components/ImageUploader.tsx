import React, { useState } from 'react';
import './ImageUploader.css';

export const ImageUploader = () => {
  // Estados para guardar la URL de la imagen que nos devuelva Cloudinary y el estado de carga
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Credenciales de mi cuenta de Cloudinary 
  const CLOUD_NAME = "dqkjoslot"; 
  const UPLOAD_PRESET = "preset_natalia";

  // Función asíncrona que se activa cuando selecciono un archivo en el input
  // Es ASYNC porque subir imagen lleva tiempo y no quiero bloquear la web.
  // (e: React.ChangeEvent...) indica que la función reacciona a un cambio en un input de archivos.
  const uploadImage = async (e: React.ChangeEvent<HTMLInputElement>) => {

    //Extraemos los archivos del evento. El input nos da una lista (aunque solo subamos uno).
    const files = e.target.files; // Los inputs de tipo file, tienen propiedad llamada .files que devuelve objeto lista (FileList)
    // Si el usuario abrió el selector pero no eligió nada, salimos de la función.
    if (!files || files.length === 0) return; 

    // Cambiamos el estado a "true" para mostrar el spinner de carga
    setUploading(true); 

    // Las APIs no entienden archivos si se los pasas como texto.
    // FormData es un objeto especial de JavaScript que empaqueta archivos binarios para enviarlos.
    const formData = new FormData();
    formData.append("file", files[0]); // Metemos la primera imagen en caso de seleccionar varias.  Mi input sólo permite una imagen cada vez (*).
    
    // El permiso: Meto el preset que configuramos en Cloudinary para que me deje subirla.
    formData.append("upload_preset", UPLOAD_PRESET); 

    try {
      // PETICIÓN: Envío imagen a dirección URL de Cloudinary.  Con await esperamos hasta que el servidor responda antes de seguir
      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, 
        { 
          method: "POST", 
          body: formData // Aquí van los datos que queremos enviar al servidor
        }
      );
      
      // RESPUESTA: Traducimos lo que nos diga el servidor a un objeto que JS entienda (JSON).
      const file = await res.json();

      // ÉXITO: Si todo fue bien, Cloudinary nos devuelve una "secure_url" (el link de internet).
      if (file.secure_url) {
        setImageUrl(file.secure_url);
      } else {
        // ERROR: Si el servidor responde pero no hay URL (ej: preset mal escrito), avisamos por consola.
        console.error("Respuesta inesperada de Cloudinary:", file);
      }
    } catch (err) {
      // ERROR DE RED: Si no hay internet o el servidor está caído, cae aquí.
      console.error("Error subiendo imagen", err);
    } finally {
      // LIMPIEZA: Pase lo que pase (éxito o error), quitamos el estado de "Cargando".
      setUploading(false);
    }
  };

  return (
    <div className="uploader-container">
      <h3 className="uploader-title">Subir Imagen a Cloudinary</h3>
      <div className="upload-box">
        {/* ¿Tenemos ya la URL de la imagen? */}
        {imageUrl ? (
          // SI: Mostramos la foto que nos devolvió la nube
          <img src={imageUrl} alt="Subida" className="preview-img" />
        ) : (
          // NO: Mostramos el cuadro vacío o el estado de carga
          <div className="placeholder-box">
            {/* ¿Estamos esperando a la nube? */}
            {uploading ? 
            // SI: Muestra el círculo dando vueltas
            <div className="spinner"></div> 
            // NO: Texto simple
            : "No hay imagen"}
          </div>
        )}
      </div>
      
      <input 
        type="file" 
        id="file-upload" // Para que la subida de imagenes se haga desde el label, este ID se pasa al htmlFor
        accept="image/*" // Solo deja seleccionar archivos que sean imágenes
        onChange={uploadImage} // Cuando se elige foto, dispara la función de subida
        hidden // Lo escondemos porque los inputs de archivo nativos son feos
        /* Si quisiera permitir varias imágenes, aquí diría "multiple". Al no estar, es solo una. (*) */
      />
      {/* Uso label y no un botón porque un botón no sabe abrir selector de imágenes, pero label si */}
      <label htmlFor="file-upload" className="upload-label"> 
        {/* Cómo se muestra el botón según si se está cargando o no */}
        {uploading ? "Cargando..." : "Seleccionar Archivo"} 
      </label>
      
      {imageUrl && (
  <div className="cloudinary-success">
    <p>¡Imagen subida a la nube!</p> {/* Si ImageUrl tiene algo muestro mensaje de exito */}
    {/* Este botón abre la imagen en una pestaña nueva, demostrando que está en internet */}
    <a href={imageUrl} target="_blank" rel="noreferrer" className="btn-link">
      Ver link real en Cloudinary
    </a>
  </div>
)}
    </div>
  );
};