import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loading } from '../components/Loading';
import { useAuth } from '../hooks/useAuth';
import { getCategories, getCategoryById, updateCategory } from '../services/categoryService';
import type { Category } from '../types/Category';
import type { CategoryUpdate } from '../types/CategoryUpdate';
import { CategoryForm } from '../components/CategoryForm';
import type { CategoryFormData } from '../types/CategoryFormData';


const MAX_CATEGORY_DESCRIPTION_LENGTH = 200;

export default function EditCategory() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { token, role } = useAuth();

    const [category, setCategory] = useState<Category | null>(null);
    const [existingCategories, setExistingCategories] = useState<Category[]>([]);
    const [formData, setFormData] = useState<CategoryFormData>({
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

            <CategoryForm
                formData={formData}
                saving={saving}
                nameError={nameError}
                submitLabel="Guardar cambios"
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