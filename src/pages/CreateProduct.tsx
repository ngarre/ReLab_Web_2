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

// Constante con el número máximo de caracteres permitidos
// para la descripción del producto.
const MAX_PRODUCT_DESCRIPTION_LENGTH = 200;

// Defino el componente de página.
export default function CreateProduct() {

    // Hook para navegar a otra ruta.
    const navigate = useNavigate();

    // Del contexto global obtengo:
    // - token: necesario para llamar a endpoints protegidos
    // - user: necesario para asociar el producto al usuario creador
    const { token, user } = useAuth();

    // Estado con las categorías disponibles en el select.
    const [categories, setCategories] = useState<Category[]>([]);

    // Flag para saber si todavía se están cargando las categorías.
    const [loadingCategories, setLoadingCategories] = useState(true);

    // Estado principal del formulario.
    // Aquí guardo todos los campos del producto.
    const [formData, setFormData] = useState<ProductFormData>({
        nombre: '',
        descripcion: '',
        precio: '',
        activo: true,
        categoriaId: '',
        imagen: null,
    });

    // Flag para desactivar el submit mientras se guarda el producto.
    const [saving, setSaving] = useState(false);

    // Mensaje de error general de la página
    const [error, setError] = useState('');

    // Nombre del archivo de imagen seleccionado,
    // solo para mostrarlo visualmente en el formulario.
    const [selectedImageName, setSelectedImageName] = useState('');

    // Este efecto se ejecuta al montar la página.
    // Su objetivo es cargar las categorías activas disponibles
    useEffect(() => {
        // Antes de empezar, activo el loading y limpio posibles errores previos.
        setLoadingCategories(true);
        setError('');

        // Pido las categorías al backend.
        getCategories()
            .then((data) => {
                // Me quedo solo con las activas para que el usuario
                // no pueda asignar el producto a una categoría inactiva.
                setCategories(data.filter((category) => category.activa));
            })
            .catch(() => {
                // Si falla la carga, muestro mensaje de error.
                setError('No se pudieron cargar las categorías.');
            })
            .finally(() => setLoadingCategories(false));
    }, []);

    // Handler para inputs de texto y textarea.
    const handleTextChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        // Extraigo el nombre del campo y su valor.
        const { name, value } = event.currentTarget;

        // Si el campo es descripcion y supera el máximo permitido,
        // corto la ejecución y no actualizo el estado.
        if (name === 'descripcion' && value.length > MAX_PRODUCT_DESCRIPTION_LENGTH) {
            return;
        }

        // Actualizo el campo correspondiente dentro de formData.
        // Uso [name] para que el mismo handler sirva para varios campos.
        setFormData((current) => ({
            ...current,
            [name]: value,
        }));

        // Si había un error visible, lo limpio al volver a escribir.
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