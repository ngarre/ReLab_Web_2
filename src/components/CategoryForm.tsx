import type { CategoryFormData } from '../types/CategoryFormData';
import './EntityForm.css';

interface CategoryFormProps {
    formData: CategoryFormData;
    saving: boolean;
    nameError: string;
    submitLabel: string;
    titleDescription: string;
    maxDescriptionLength: number;
    onTextChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
    onCheckboxChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
    onCancel: () => void;
}

export function CategoryForm({
    formData,
    saving,
    nameError,
    submitLabel,
    titleDescription,
    maxDescriptionLength,
    onTextChange,
    onCheckboxChange,
    onSubmit,
    onCancel,
}: CategoryFormProps) {
    return (
        <div className="entity-form-container">
            <form className="entity-form" onSubmit={onSubmit}>
                <div className="entity-form-field">
                    <label htmlFor="nombre">Nombre</label>
                    <input
                        id="nombre"
                        name="nombre"
                        type="text"
                        value={formData.nombre}
                        onChange={onTextChange}
                        required
                    />
                    {nameError && <p className="form-field-error">{nameError}</p>}
                </div>

                <div className="entity-form-field">
                    <label htmlFor="descripcion">Descripción</label>
                    <textarea
                        id="descripcion"
                        name="descripcion"
                        value={formData.descripcion}
                        onChange={onTextChange}
                        rows={5}
                        maxLength={maxDescriptionLength}
                    />
                    <div className="entity-form-field-meta">
                        <span className="entity-form-field-help">
                            Máximo {maxDescriptionLength} caracteres
                        </span>
                        <span
                            className={`entity-form-char-count ${formData.descripcion.length >= maxDescriptionLength ? 'limit' : ''
                                }`}
                        >
                            {formData.descripcion.length} / {maxDescriptionLength}
                        </span>
                    </div>
                </div>

                <div className="entity-form-field">
                    <label htmlFor="tasaComision">{titleDescription}</label>
                    <input
                        id="tasaComision"
                        name="tasaComision"
                        type="number"
                        min="0"
                        max="1"
                        step="0.01"
                        value={formData.tasaComision}
                        onChange={onTextChange}
                        required
                    />
                </div>

                <div className="entity-form-checkbox">
                    <label htmlFor="activa">
                        <input
                            id="activa"
                            name="activa"
                            type="checkbox"
                            checked={formData.activa}
                            onChange={onCheckboxChange}
                        />
                        Categoría activa
                    </label>
                </div>

                <div className="entity-form-actions">
                    <button
                        type="button"
                        className="entity-form-secondary-btn"
                        onClick={onCancel}
                    >
                        Cancelar
                    </button>

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