import type { Category } from '../types/Category';
import type { ProductFormData } from '../types/ProductFormData';

interface ProductFormProps {
  formData: ProductFormData;
  categories: Category[];
  selectedImageName: string;
  saving: boolean;
  submitLabel: string;
  imageLabel: string;
  maxDescriptionLength: number;
  onTextChange: (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  onCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onCategoryChange: (event: React.ChangeEvent<HTMLSelectElement>) => void;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  onCancel: () => void;
}

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
    <div className="edit-product-container">
      <form className="edit-product-form" onSubmit={onSubmit}>
        <div className="edit-product-field">
          <label htmlFor="nombre">Nombre</label>
          <input
            id="nombre"
            name="nombre"
            type="text"
            value={formData.nombre}
            onChange={onTextChange}
            required
          />
        </div>

        <div className="edit-product-field">
          <label htmlFor="descripcion">Descripción</label>
          <textarea
            id="descripcion"
            name="descripcion"
            value={formData.descripcion}
            onChange={onTextChange}
            rows={5}
            maxLength={maxDescriptionLength}
          />
          <div className="edit-product-field-meta">
            <span className="edit-product-field-help">
              Máximo {maxDescriptionLength} caracteres
            </span>
            <span
              className={`edit-product-char-count ${formData.descripcion.length >= maxDescriptionLength ? 'limit' : ''
                }`}
            >
              {formData.descripcion.length} / {maxDescriptionLength}
            </span>
          </div>
        </div>

        <div className="edit-product-field">
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

        <div className="edit-product-field">
          <label htmlFor="categoriaId">Categoría</label>
          <select
            id="categoriaId"
            name="categoriaId"
            value={formData.categoriaId}
            onChange={onCategoryChange}
            required
          >
            <option value="">Selecciona una categoría</option>
            {categories.map((category) => (
              <option key={category.id} value={String(category.id)}>
                {category.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="edit-product-checkbox">
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

        <div className="edit-product-field">
          <label htmlFor="imagen">{imageLabel}</label>
          <input
            id="imagen"
            name="imagen"
            type="file"
            accept="image/*"
            onChange={onImageChange}
          />
          {selectedImageName && (
            <p className="edit-product-file-name">{selectedImageName}</p>
          )}
        </div>

        <div className="edit-product-actions">
          <button
            type="button"
            className="edit-product-secondary-btn"
            onClick={onCancel}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="edit-product-primary-btn"
            disabled={saving}
          >
            {saving ? 'Guardando...' : submitLabel}
          </button>
        </div>
      </form>
    </div>
  );
}