import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loading } from '../components/Loading';
import { useAuth } from '../hooks/useAuth';
import { getCategories, getCategoryById, updateCategory } from '../services/categoryService';
import type { Category } from '../types/Category';
import type { CategoryUpdate } from '../types/CategoryUpdate';
import './EditProduct.css';

interface EditCategoryFormState {
    nombre: string;
    descripcion: string;
    activa: boolean;
    tasaComision: string;
}

const MAX_CATEGORY_DESCRIPTION_LENGTH = 200;

export default function EditCategory() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token, role } = useAuth();

    const [category, setCategory] = useState<Category | null>(null);
    const [existingCategories, setExistingCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState<EditCategoryFormState>({
        nombre: '',
        descripcion: '',
        activa: true,
        tasaComision: '',
    });

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [nameError, setNameError] = useState('');

    useEffect(() => {
        if (!id) {
            setError('No se ha encontrado la categoría.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError('');

        Promise.all([getCategoryById(Number(id)), getCategories()])
            .then(([categoryData, categoriesData]) => {
                setCategory(categoryData);
                setExistingCategories(categoriesData);
                setFormData({
                    nombre: categoryData.nombre ?? '',
                    descripcion: categoryData.descripcion ?? '',
                    activa: categoryData.activa,
                    tasaComision: String(categoryData.tasaComision ?? ''),
                });
            })
            .catch(() => {
                setError('No se pudo cargar la categoría para editar.');
            })
            .finally(() => setLoading(false));
    }, [id]);

    const canEditCategory = role === 'ADMIN' || role === 'GESTOR';

    const handleTextChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = event.currentTarget;

        if (name === 'descripcion' && value.length > MAX_CATEGORY_DESCRIPTION_LENGTH) {
            return;
        }

        if (name === 'nombre') {
            setNameError('');
        }

        setError('');

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.currentTarget;

        setFormData((current) => ({
            ...current,
            [name]: checked,
        }));
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!id || !token || !category) {
            setError('No se pudo guardar la categoría.');
            return;
        }

        const trimmedName = formData.nombre.trim();
        const trimmedDescription = formData.descripcion.trim();
        const trimmedCommission = formData.tasaComision.trim();

        if (!trimmedName) {
            setError('Debes indicar un nombre para la categoría.');
            return;
        }

        const duplicatedName = existingCategories.some(
            (currentCategory) =>
                currentCategory.id !== category.id &&
                currentCategory.nombre.trim().toLowerCase() === trimmedName.toLowerCase()
        );

        if (duplicatedName) {
            setNameError('Ya existe una categoría con ese nombre.');
            return;
        }

        if (trimmedDescription.length > MAX_CATEGORY_DESCRIPTION_LENGTH) {
            setError(`La descripción no puede superar los ${MAX_CATEGORY_DESCRIPTION_LENGTH} caracteres.`);
            return;
        }

        if (!trimmedCommission) {
            setError('Debes indicar una tasa de comisión.');
            return;
        }

        const parsedCommission = Number(trimmedCommission);

        if (Number.isNaN(parsedCommission)) {
            setError('La tasa de comisión debe ser un número válido.');
            return;
        }

        if (parsedCommission < 0 || parsedCommission > 1) {
            setError('La tasa de comisión debe estar entre 0 y 1.');
            return;
        }

        setSaving(true);
        setError('');

        const payload: CategoryUpdate = {
            nombre: trimmedName,
            descripcion: trimmedDescription,
            activa: formData.activa,
            tasaComision: parsedCommission,
        };

        try {
            await updateCategory(Number(id), payload, token);
            navigate('/categories');
        } catch {
            setError('No se pudo actualizar la categoría.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <Loading />;
    }

    if (error && !category) {
        return <ErrorMessage message={error} />;
    }

    if (!category || !canEditCategory) {
        return <ErrorMessage message="No tienes permisos para editar esta categoría." />;
    }

    return (
        <main className="main-content-area">
            <h1 className="page-title">Editar Categoría</h1>
            <div className="page-title-separator"></div>

            <p className="page-subtitle">
                Modifica la información principal de la categoría.
            </p>

            {error && <ErrorMessage message={error} />}

            <div className="edit-product-container">
                <form className="edit-product-form" onSubmit={handleSubmit}>
                    <div className="edit-product-field">
                        <label htmlFor="nombre">Nombre</label>
                        <input
                            id="nombre"
                            name="nombre"
                            type="text"
                            value={formData.nombre}
                            onChange={handleTextChange}
                            required
                        />
                        {nameError && <p className="form-field-error">{nameError}</p>}
                    </div>

                    <div className="edit-product-field">
                        <label htmlFor="descripcion">Descripción</label>
                        <textarea
                            id="descripcion"
                            name="descripcion"
                            value={formData.descripcion}
                            onChange={handleTextChange}
                            rows={5}
                            maxLength={MAX_CATEGORY_DESCRIPTION_LENGTH}
                        />
                        <div className="edit-product-field-meta">
                            <span className="edit-product-field-help">
                                Máximo {MAX_CATEGORY_DESCRIPTION_LENGTH} caracteres
                            </span>
                            <span
                                className={`edit-product-char-count ${formData.descripcion.length >= MAX_CATEGORY_DESCRIPTION_LENGTH
                                        ? 'limit'
                                        : ''
                                    }`}
                            >
                                {formData.descripcion.length} / {MAX_CATEGORY_DESCRIPTION_LENGTH}
                            </span>
                        </div>
                    </div>

                    <div className="edit-product-field">
                        <label htmlFor="tasaComision">Tasa de comisión (entre 0 y 1)</label>
                        <input
                            id="tasaComision"
                            name="tasaComision"
                            type="number"
                            min="0"
                            max="1"
                            step="0.01"
                            value={formData.tasaComision}
                            onChange={handleTextChange}
                            required
                        />
                    </div>

                    <div className="edit-product-checkbox">
                        <label htmlFor="activa">
                            <input
                                id="activa"
                                name="activa"
                                type="checkbox"
                                checked={formData.activa}
                                onChange={handleCheckboxChange}
                            />
                            Categoría activa
                        </label>
                    </div>

                    <div className="edit-product-actions">
                        <button
                            type="button"
                            className="edit-product-secondary-btn"
                            onClick={() => navigate('/categories')}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="edit-product-primary-btn"
                            disabled={saving}
                        >
                            {saving ? 'Guardando...' : 'Guardar cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}