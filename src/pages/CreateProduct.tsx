import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorMessage } from '../components/ErrorMessage';
import { Loading } from '../components/Loading';
import { useAuth } from '../hooks/useAuth';
import { getCategories } from '../services/categoryService';
import { createProduct } from '../services/productService';
import type { Category } from '../types/Category';
import './EntityForm.css';

interface CreateProductFormState {
    nombre: string;
    descripcion: string;
    precio: string;
    activo: boolean;
    categoriaId: string;
    imagen?: string | null;
}

const MAX_PRODUCT_DESCRIPTION_LENGTH = 200;

export default function CreateProduct() {
    
    const navigate = useNavigate();
    const { token, user } = useAuth();

    const [categories, setCategories] = useState<Category[]>([]);
    const [loadingCategories, setLoadingCategories] = useState(true);

    const [formData, setFormData] = useState<CreateProductFormState>({
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
                            maxLength={MAX_PRODUCT_DESCRIPTION_LENGTH}
                        />
                        <div className="edit-product-field-meta">
                            <span className="edit-product-field-help">
                                Máximo {MAX_PRODUCT_DESCRIPTION_LENGTH} caracteres
                            </span>
                            <span
                                className={`edit-product-char-count ${formData.descripcion.length >= MAX_PRODUCT_DESCRIPTION_LENGTH
                                        ? 'limit'
                                        : ''
                                    }`}
                            >
                                {formData.descripcion.length} / {MAX_PRODUCT_DESCRIPTION_LENGTH}
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
                            onChange={handleTextChange}
                            required
                        />
                    </div>

                    <div className="edit-product-field">
                        <label htmlFor="categoriaId">Categoría</label>
                        <select
                            id="categoriaId"
                            name="categoriaId"
                            value={formData.categoriaId}
                            onChange={handleCategoryChange}
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
                                onChange={handleCheckboxChange}
                            />
                            Producto activo
                        </label>
                    </div>

                    <div className="edit-product-field">
                        <label htmlFor="imagen">Imagen</label>
                        <input
                            id="imagen"
                            name="imagen"
                            type="file"
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        {selectedImageName && (
                            <p className="edit-product-file-name">Imagen seleccionada: {selectedImageName}</p>
                        )}
                    </div>

                    <div className="edit-product-actions">
                        <button
                            type="button"
                            className="edit-product-secondary-btn"
                            onClick={() => navigate('/my-products')}
                        >
                            Cancelar
                        </button>

                        <button
                            type="submit"
                            className="edit-product-primary-btn"
                            disabled={saving}
                        >
                            {saving ? 'Creando...' : 'Crear producto'}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}

function convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = () => {
            const result = reader.result;

            if (typeof result !== 'string') {
                reject(new Error('No se pudo leer el archivo.'));
                return;
            }

            const base64 = result.split(',')[1];

            if (!base64) {
                reject(new Error('No se pudo convertir la imagen a Base64.'));
                return;
            }

            resolve(base64);
        };

        reader.onerror = () => reject(new Error('Error al leer el archivo.'));
        reader.readAsDataURL(file);
    });
}