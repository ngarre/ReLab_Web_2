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

    // Función que se ejecuta cuando usuario escribe en input/textarea
    const handleTextChange = (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> // La función recibe un evento de cambio (ChangeEvent) que viene de un input o de un textarea
    ) => {
        // Del elemento que ha disparado el evento --> saco su name y su value
        const { name, value } = event.currentTarget;

        // Si el campo es descripcion y supera el máximo permitido,
        // corto la ejecución y no actualizo el estado.
        if (name === 'descripcion' && value.length > MAX_PRODUCT_DESCRIPTION_LENGTH) {
            return;
        }

        // Actualizo el campo correspondiente dentro de formData.
        // Uso [name] para que el mismo handler sirva para varios campos.
        setFormData((current) => ({
            ...current, // NOTA: No se necesitaría current si fuera a reemplazar todo el estado FormData a la vez, pero al ir campo a campo necesito poder cambiar una parte del estado y conservar el resto.
            [name]: value,
        }));

        // Si había un error visible, lo limpio al volver a escribir.
        if (error) {
            setError('');
        }
    };

    // El checkbox se gestiona aparte porque no devuelve un texto en value, sino un booleano en checked.
    const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = event.currentTarget; // 

        setFormData((current) => ({
            ...current,
            [name]: checked,
        }));
    };

    // La categoría también se gestiona a parte porque el evento viene de un select
    const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        const { value } = event.currentTarget; // Guardo el id de la categoría

        setFormData((current) => ({
            ...current,
            categoriaId: value,
        }));
    };

    // Handler que se ejecuta cuando el eusuario selecciona una imagen en el input type="file". 
    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        // Intento obtener el primer archivo seleccionado en el input.
        // event.currentTarget.files es la lista de archivos elegidos.
        // ?. [0] significa:
        // - si existe files, coge el primero
        // - si no existe, devuelve undefined sin romper
        const file = event.currentTarget.files?.[0];

        // Si no hay archivo seleccionado, salgo de la función
        // y no hago nada más.
        if (!file) {
            return;
        }

        // Guardo el nombre del archivo en un estado separado
        // para poder mostrarlo visualmente en el formulario.
        setSelectedImageName(file.name);

        try {
             // Convierto el archivo a Base64 usando la utilidad compartida.
            // Uso await porque esa conversión es asíncrona.
            const base64Image = await convertFileToBase64(file);

        // Actualizo solo el campo "imagen" dentro del estado del formulario.
        // Conservo el resto de campos usando ...current.
            setFormData((current) => ({
                ...current,
                imagen: base64Image,
            }));
        } catch {
            // Si hay archivo, pero la conversión falla, muestro un mensaje de error para informar al usuario
            setError('No se pudo procesar la imagen seleccionada.');
        }
    };

    // Handler que se ejecuta cuando el usuariario envía el formulario de creación de producto
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        // Evita el comportamiento por defecto del formulario en HTML,
        // que sería recargar la página al hacer submit.
        event.preventDefault();

         // Compruebo que exista sesión activa:
        // - token para autenticar la petición al backend
        // - user para saber qué usuario está creando el producto
        if (!token || !user) {
            setError('No hay sesión activa para crear productos.');
            return;
        }

        // Valido que se haya seleccionado una categoría.
        // Si categoriaId está vacío, el formulario no puede enviarse.
        if (!formData.categoriaId) {
            setError('Debes seleccionar una categoría.');
            return;
        }

        // Valido que el precio no esté vacío.
        // trim() elimina espacios al principio y al final.
        if (formData.precio.trim() === '') {
            setError('Debes indicar un precio.');
            return;
        }

        // Valido que la descripción no supere el límite máximo permitido.
        if (formData.descripcion.length > MAX_PRODUCT_DESCRIPTION_LENGTH) {
            setError(`La descripción no puede superar los ${MAX_PRODUCT_DESCRIPTION_LENGTH} caracteres.`);
            return;
        }

        // Si todas las validaciones pasan:
        // - activo el estado de guardado para desactivar el botón y mostrar feedback visual
        // - limpio errores previos
        setSaving(true);
        setError('');

        try {
             // Llamo al servicio que crea el producto en el backend.
            // Aquí construyo el objeto de datos que espera la API.
            await createProduct(
                {
                    nombre: formData.nombre,
                    descripcion: formData.descripcion,

                    // Convierto el precio de string a number,
                    // porque en el formulario se maneja como texto
                    // pero la API espera un número
                    precio: Number(formData.precio),
                    activo: formData.activo,

                    // Convierto categoriaId de string a number
                    categoriaId: Number(formData.categoriaId),

                    // Asocio el producto al usuario autenticado
                    usuarioId: user.id,

                    // Para proporcionar este campo a la API, aunque no lo utilizo en la web
                    modo: false,

                    // Si hay imagen en Base64 la envío;
                    // si no hay, envío null
                    imagen: formData.imagen ?? null,
                },
                // Paso también el token para que la petición vaya autenticada
                token
            );

            // Si la creación sale bien, redirijo a la página "Mis productos"
            navigate('/my-products');
        } catch {
            // Si la creación falla, muestro un mensaje de error general
            setError('No se pudo crear el producto.');
        } finally {
            // Pase lo que pase:
            // - éxito
            // - error
            // desactivo el estado de guardado para reactivar el botón
            setSaving(false);
        }
    };

    // Si todavía se están cargando las categorías, muestro el componente de carga en lugar de renderizar el formulario
    if (loadingCategories) {
        return <Loading />;
    }

    // Si ya no estoy cargando categorías,
    // renderizo la página normal.
    return (
        <main className="main-content-area">
            <h1 className="page-title">Crear Producto</h1>
            <div className="page-title-separator"></div>

            <p className="page-subtitle">
                Publica un nuevo producto en la plataforma.
            </p>

            {/* Si existe un mensaje de error, lo muestro usando
            el componente reutilizable ErrorMessage */}
            {error && <ErrorMessage message={error} />}

            {/* Renderizo el formulario compartido de productos.
            Aquí le paso todos los datos y callbacks necesarios
            para que pueda funcionar como formulario controlado. */}
            <ProductForm
                // Estado actual del formulario:
                // nombre, descripción, precio, activo, categoría, imagen...
                formData={formData}

                // Lista de categorías activas disponibles para el select
                categories={categories}

                // Texto que se mostrará debajo del input file si se ha elegido una imagen.
                // Si selectedImageName tiene contenido:
                //   "Imagen seleccionada: nombrearchivo.jpg"
                // Si no, mando una cadena vacía.
                selectedImageName={
                    selectedImageName
                        ? `Imagen seleccionada: ${selectedImageName}`
                        : ''
                }

                // Flag para indicar si el formulario se está enviando
                // y así poder desactivar el botón.
                saving={saving}

                // Texto del botón submit en esta pantalla
                submitLabel="Crear producto"

                // Texto de la etiqueta del campo de imagen en esta pantalla
                imageLabel="Imagen"

                // Límite máximo de caracteres permitido para la descripción
                maxDescriptionLength={MAX_PRODUCT_DESCRIPTION_LENGTH}

                // Callback para inputs de texto y textarea
                onTextChange={handleTextChange}

                // Callback para el checkbox de activo
                onCheckboxChange={handleCheckboxChange}

                // Callback para el select de categoría
                onCategoryChange={handleCategoryChange}

                // Callback para el input file de imagen
                onImageChange={handleImageChange}

                // Callback para el submit del formulario
                onSubmit={handleSubmit}

                // Callback para cancelar.
                // En este caso, si el usuario cancela,
                // la redirijo a la ruta /my-products
                onCancel={() => navigate('/my-products')}
            />
        </main>
    );
}