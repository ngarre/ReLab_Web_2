import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loading } from '../components/Loading';
import { useAuth } from '../hooks/useAuth';
import { createCategory, getCategories } from '../services/categoryService';
import type { Category } from '../types/Category';
import './EditProduct.css';

interface CreateCategoryFormState {
    nombre: string;
    descripcion: string;
    activa: boolean;
    tasaComision: string;
}

export default function CreateCategory() {
    const navigate = useNavigate();
    const { token } = useAuth();

    const [existingCategories, setExistingCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const [formData, setFormData] = useState<CreateCategoryFormState>({
        nombre: '',
        descripcion: '',
        activa: true,
        tasaComision: '',
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [nameError, setNameError] = useState('');

    useEffect(() => {
        setLoadingCategories(true);
        setError('');

        getCategories()
            .then((data) => setExistingCategories(data))
            .catch(() => {
                setError('No se pudieron cargar las categorías existentes.');
            })
            .finally(() => setLoadingCategories(false));
    }, []);

    const handleTextChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = event.currentTarget;

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

        if (!token) {
            setError('No hay sesión activa para crear categorías.');
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
            (category) => category.nombre.trim().toLowerCase() === trimmedName.toLowerCase()
        );

        if (duplicatedName) {
            setNameError('Ya existe una categoría con ese nombre.');
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

        try {
            await createCategory(
                {
                    nombre: trimmedName,
                    descripcion: trimmedDescription,
                    activa: formData.activa,
                    tasaComision: parsedCommission,
                },
                token
            );

            navigate('/categories');
        } catch {
            setError('No se pudo crear la categoría.');
        } finally {
            setSaving(false);
        }
    };

    if (loadingCategories) {
        return <Loading />;
    }

    return (
        <main className="main-content-area">
            <h1 className="page-title">Crear Categoría</h1>
            <div className="page-title-separator"></div>

            <p className="page-subtitle">
                Añade una nueva categoría para organizar los productos de la plataforma.
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
                        />
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
                            {saving ? 'Creando...' : 'Crear categoría'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}