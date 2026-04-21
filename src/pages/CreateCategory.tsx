import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loading } from '../components/Loading';
import { useAuth } from '../hooks/useAuth';
import { createCategory, getCategories } from '../services/categoryService';
import type { Category } from '../types/Category';
import { CategoryForm } from '../components/CategoryForm';
import type { CategoryFormData } from '../types/CategoryFormData';


const MAX_CATEGORY_DESCRIPTION_LENGTH = 200;

export default function CreateCategory() {
    const navigate = useNavigate();
    const { token } = useAuth();

    const [existingCategories, setExistingCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const [formData, setFormData] = useState<CategoryFormData>({
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

            <CategoryForm
                formData={formData}
                saving={saving}
                nameError={nameError}
                submitLabel="Crear categoría"
                titleDescription="Tasa de comisión (entre 0 y 1)"
                maxDescriptionLength={MAX_CATEGORY_DESCRIPTION_LENGTH}
                onTextChange={handleTextChange}
                onCheckboxChange={handleCheckboxChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/categories')}
            />
        </main>
    );
}