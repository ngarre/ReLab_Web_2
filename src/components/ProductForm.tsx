import type { Category } from '../types/Category';

// Importo el tipo ProductFormData para tipar la forma
// del estado del formulario que me llega por props.
import type { ProductFormData } from '../types/ProductFormData';
import './EntityForm.css';


// Defino la interfaz de props del componente.
// Aquí describo todo lo que ProductForm necesita recibir
// desde la página padre para poder renderizarse y funcionar.
interface ProductFormProps {
  // Estado actual del formulario:
  // nombre, descripción, precio, activo, categoría e imagen.
  formData: ProductFormData;

  // Lista de categorías disponibles para rellenar el select.
  categories: Category[];

  // Texto con el nombre de la imagen seleccionada,
  // preparado por la página padre para mostrarlo bajo el input file.
  selectedImageName: string;

  // Flag que indica si el formulario se está guardando.
  // Se usa para desactivar el botón submit.
  saving: boolean;

  // Texto del botón principal.
  // Permite reutilizar el formulario en crear y editar.
  submitLabel: string;

  // Texto de la etiqueta del campo de imagen.
  // También permite reutilizar el formulario en las dos pantallas.
  imageLabel: string;

  // Número máximo de caracteres permitidos en la descripción.
  maxDescriptionLength: number;

  // Callback para campos de texto y textarea.
  // La ejecutará el formulario cuando el usuario escriba.
  onTextChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;

  // Callback para el checkbox de activo.
  onCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void;

  // Callback para el select de categoría.
  onCategoryChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;

  // Callback para el input file de imagen.
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;

  // Callback para el submit del formulario.
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;

  // Callback para el botón cancelar.
  onCancel: () => void;
}


// Defino el componente ProductForm.
// Hago destructuring de todas las props para usarlas directamente dentro del JSX.
export function ProductForm({
  formData,
  categories,
  selectedImageName,
  saving,
  submitLabel,
  imageLabel,
  maxDescriptionLength,
  onTextChange,
  onCheckboxChange,
  onCategoryChange,
  onImageChange,
  onSubmit,
  onCancel,
}: ProductFormProps) {
  return (
    // Contenedor exterior del formulario.
    <div className="entity-form-container">

      {/* Formulario.
        Cuando se envía, ejecuta la callback onSubmit que le pasa el padre. */}
      <form className="entity-form" onSubmit={onSubmit}>
        <div className="entity-form-field">

          {/* Campo nombre */}
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre" // Conecto el textarea con el label Descripción gracias al "htmlFor" --> Así cuando clico en etiqueta sobre el textarea el foco indica dónde escribir
            name="nombre"
            type="text"
            value={formData.nombre}
            onChange={onTextChange}
            required
          />
        </div>

        {/* Campo descripción */}
        <div className="entity-form-field">
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion" // Conecto el textarea con el label Descripción gracias al "htmlFor" --> Así cuando clico en etiqueta sobre el textarea el foco indica dónde escribir
            name="descripcion"
            value={formData.descripcion}
            onChange={onTextChange}
            rows={5} // Indico al navegador que el textarea tendrá una altura aproximada de 5 líneaas visibles
            maxLength={maxDescriptionLength}
          />

          {/* Bloque inferior con ayuda + contador de caracteres */}
          <div className="entity-form-field-meta">
            <span className="entity-form-field-help">
              Máximo {maxDescriptionLength} caracteres
            </span>
            <span
              className={`entity-form-char-count ${formData.descripcion.length >= maxDescriptionLength ? 'limit' : '' // Clase dinámica por si la descripción se pasa del número máximo de caracteres
                }`}
            >
              {formData.descripcion.length} / {maxDescriptionLength}
            </span>
          </div>
        </div>

        {/* Campo precio */}
        <div className="entity-form-field">
          <label htmlFor="precio">Precio</label>
          <input
            id="precio"
            name="precio"
            type="number"
            min="0"
            step="0.01"
            value={formData.precio}
            onChange={onTextChange}
            required
          />
        </div>

         {/* Campo categoría */}
        <div className="entity-form-field">
          <label htmlFor="categoriaId">Categoría</label>
          <select
            id="categoriaId"
            name="categoriaId"
            value={formData.categoriaId}
            onChange={onCategoryChange}
            required
          >
            {/* Opción vacía inicial */}
            <option value="">Selecciona una categoría</option>

            {/* Pinto una opción por cada categoría recibida */}
            {/* Cada opción del desplegable muestra el nombre, pero guardo como valor el id */}
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* Checkbox de activo */}
        <div className="entity-form-checkbox">
          <label htmlFor="activo">
            <input
              id="activo"
              name="activo"
              type="checkbox"
              checked={formData.activo}
              onChange={onCheckboxChange}
            />
            Producto activo
          </label>
        </div>

         {/* Campo imagen */}
        <div className="entity-form-field">
          <label htmlFor="imagen">{imageLabel}</label>
          <input
            id="imagen"
            name="imagen"
            type="file"
            accept="image/*"
            onChange={onImageChange}
          />
          {/* Si existe nombre de imagen, lo muestro debajo */}
          {selectedImageName && (
            <p className="entity-form-file-name">{selectedImageName}</p>
          )}
        </div>

        {/* Acciones finales */}
        <div className="entity-form-actions">
          {/* Botón cancelar */}
          <button
            type="button"
            className="entity-form-secondary-btn"
            onClick={onCancel}
          >
            Cancelar
          </button>

          {/* Botón cancelar */}
          <button
            type="submit"
            className="entity-form-primary-btn"
            disabled={saving}
          >
            {saving ? 'Guardando...' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}