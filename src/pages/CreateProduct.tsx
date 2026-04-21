import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loading } from '../components/Loading';
import { useAuth } from '../hooks/useAuth';
import { getCategories } from '../services/categoryService';
import { createProduct } from '../services/productService';
import type { Category } from '../types/Category';
import { convertFileToBase64 } from '../utils/file';
import { ProductForm } from '../components/ProductForm';
import type { ProductFormData } from '../types/ProductFormData';
import './EntityForm.css';



const MAX_PRODUCT_DESCRIPTION_LENGTH = 200;

export default function CreateProduct() {

    const navigate = useNavigate();
    const { token, user } = useAuth();

    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const [formData, setFormData] = useState<ProductFormData>({
        nombre: '',
        descripcion: '',
        precio: '',
        activo: true,
        categoriaId: '',
        imagen: null,
    });

    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [selectedImageName, setSelectedImageName] = useState('');

    useEffect(() => {
        setLoadingCategories(true);
        setError('');

        getCategories()
            .then((data) => {
                setCategories(data.filter((category) => category.activa));
            })
            .catch(() => {
                setError('No se pudieron cargar las categorías.');
            })
            .finally(() => setLoadingCategories(false));
    }, []);

    const handleTextChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = event.currentTarget;

        if (name === 'descripcion' && value.length > MAX_PRODUCT_DESCRIPTION_LENGTH) {
            return;
        }

        setFormData((current) => ({
            ...current,
            [name]: value,
        }));

        if (error) {
            setError('');
        }
    };

    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.currentTarget;

        setFormData((current) => ({
            ...current,
            [name]: checked,
        }));
    };

    const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = event.currentTarget;

        setFormData((current) => ({
            ...current,
            categoriaId: value,
        }));
    };

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.currentTarget.files?.[0];

        if (!file) {
            return;
        }

        setSelectedImageName(file.name);

        try {
            const base64Image = await convertFileToBase64(file);

            setFormData((current) => ({
                ...current,
                imagen: base64Image,
            }));
        } catch {
            setError('No se pudo procesar la imagen seleccionada.');
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        if (!token || !user) {
            setError('No hay sesión activa para crear productos.');
            return;
        }

        if (!formData.categoriaId) {
            setError('Debes seleccionar una categoría.');
            return;
        }

        if (formData.precio.trim() === '') {
            setError('Debes indicar un precio.');
            return;
        }

        if (formData.descripcion.length > MAX_PRODUCT_DESCRIPTION_LENGTH) {
            setError(`La descripción no puede superar los ${MAX_PRODUCT_DESCRIPTION_LENGTH} caracteres.`);
            return;
        }

        setSaving(true);
        setError('');

        try {
            await createProduct(
                {
                    nombre: formData.nombre,
                    descripcion: formData.descripcion,
                    precio: Number(formData.precio),
                    activo: formData.activo,
                    categoriaId: Number(formData.categoriaId),
                    usuarioId: user.id,
                    modo: false,
                    imagen: formData.imagen ?? null,
                },
                token
            );

            navigate('/my-products');
        } catch {
            setError('No se pudo crear el producto.');
        } finally {
            setSaving(false);
        }
    };

    if (loadingCategories) {
        return <Loading />;
    }

    return (
        <main className="main-content-area">
            <h1 className="page-title">Crear Producto</h1>
            <div className="page-title-separator"></div>

            <p className="page-subtitle">
                Publica un nuevo producto en la plataforma.
            </p>

            {error && <ErrorMessage message={error} />}

            <ProductForm
                formData={formData}
                categories={categories}
                selectedImageName={
                    selectedImageName
                        ? `Imagen seleccionada: ${selectedImageName}`
                        : ''
                }
                saving={saving}
                submitLabel="Crear producto"
                imageLabel="Imagen"
                maxDescriptionLength={MAX_PRODUCT_DESCRIPTION_LENGTH}
                onTextChange={handleTextChange}
                onCheckboxChange={handleCheckboxChange}
                onCategoryChange={handleCategoryChange}
                onImageChange={handleImageChange}
                onSubmit={handleSubmit}
                onCancel={() => navigate('/my-products')}
            />
        </main>
    );
}