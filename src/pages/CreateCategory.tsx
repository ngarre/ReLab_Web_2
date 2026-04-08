import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorMessage } from '../components/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { createCategory } from '../services/categoryService';
import type { CategoryCreate } from '../types/CategoryCreate';
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

    const [formData, setFormData] = useState<CreateCategoryFormState>({
        nombre: '',
        descripcion: '',
        activa: true,
        tasaComision: '',
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');

    const handleTextChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = event.currentTarget;

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

        if (formData.tasaComision.trim() === '') {
            setError('Debes indicar una tasa de comisión.');
            return;
        }

        setSaving(true);
        setError('');

        try {
            await createCategory(
                {
                    nombre: formData.nombre,
                    descripcion: formData.descripcion,
                    activa: formData.activa,
                    tasaComision: Number(formData.tasaComision),
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
                        <label htmlFor="tasaComision">Tasa de comisión (%)</label>
                        <input
                            id="tasaComision"
                            name="tasaComision"
                            type="number"
                            min="0"
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