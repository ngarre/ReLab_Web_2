// Importo hooks de React:
// - useEffect para cargar datos al montar
// - useState para el estado local del componente
import { useEffect, useState } from 'react';

// Importo hooks de React Router:
// - useNavigate para navegar programáticamente
// - useParams para leer el id del producto desde la URL
import { useNavigate, useParams } from 'react-router-dom';

// Componentes reutilizables de feedback visual
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';

// Hook personalizado para acceder al contexto global de autenticación
import { useAuth } from '../hooks/useAuth';

// Servicios para consultar categorías y productos / actualizar producto
import { getCategories } from '../services/categoryService';
import { getProductById, updateProduct } from '../services/productService';

// Tipos TypeScript para categorías, producto y payload de actualización
import type { Category } from '../types/Category';
import type { Product } from '../types/Product';
import type { ProductUpdate } from '../types/ProductUpdate';

// Utilidad compartida para convertir la imagen seleccionada a Base64
import { convertFileToBase64 } from '../utils/file';

// Formulario reutilizable compartido entre crear y editar producto
import { ProductForm } from '../components/ProductForm';

// Tipo compartido con la forma de los datos del formulario
import type { ProductFormData } from '../types/ProductFormData';



// Límite máximo de longitud de la descripción
const MAX_PRODUCT_DESCRIPTION_LENGTH = 200;

// Defino el componente de página
export default function EditProduct() {
  // Leo el id del producto desde la URL
  const { id } = useParams<{ id: string }>();

   // Hook para navegar a otra ruta
  const navigate = useNavigate();

  // Del contexto global obtengo:
  // - user: usuario autenticado
  // - token: necesario para actualizar producto en endpoint protegido
  const { user, token } = useAuth();

  // Estado con el producto cargado desde backend
  const [product, setProduct] = useState<Product | null>(null);

  // Estado con las categorías disponibles para el select
  const [categories, setCategories] = useState<Category[]>([]);

   // Estado del formulario de edición
  const [formData, setFormData] = useState<ProductFormData>({
    nombre: '',
    descripcion: '',
    precio: '',
    activo: true,
    categoriaId: '',
    imagen: null,
  });

  // Flag para la carga inicial de producto + categorías
  const [loading, setLoading] = useState(true);

  // Flag para indicar que se está guardando la edición
  const [saving, setSaving] = useState(false);

  // Mensaje de error general de la página
  const [error, setError] = useState('');

  // Nombre de la nueva imagen seleccionada, solo para mostrarlo en UI
  const [selectedImageName, setSelectedImageName] = useState('');

  // Al montar la página, cargo:
  // - el producto a editar
  // - las categorías activas disponibles
  useEffect(() => {
    // Si no existe id en la URL, no puedo cargar nada
    if (!id) { // Es defensivo porque actualmente no puedo construir la ruta sin el id, entonces no debería ocurrir nunca
      setError('No se ha encontrado el producto.');
      setLoading(false);
      return;
    }

    // Activo loading y limpio errores previos
    setLoading(true);
    setError('');

    // Lanzo ambas peticiones en paralelo para optimizar tiempo
    Promise.all([getProductById(Number(id)), getCategories()])
      .then(([productData, categoriesData]) => {
        // Guardo el producto completo en estado
        setProduct(productData);

        // Solo dejo categorías activas para el select
        setCategories(categoriesData.filter((category) => category.activa));
        
        // Inicializo el formulario con los datos actuales del producto
        setFormData({
          nombre: productData.nombre || '',
          descripcion: productData.descripcion || '',
          precio: String(productData.precio ?? ''),
          activo: productData.activo,
          categoriaId: String(productData.categoria?.id ?? ''),
          // En edición no precargo la imagen en Base64:
          // solo se enviará si el usuario selecciona una nueva
          imagen: null, // Aunque la ponga por defecto a null, luego al enviar los datos solo se envía la imagen si se ha seleccionado una.
        });
      })
      .catch(() => {
        // Si falla alguna de las dos peticiones, muestro error
        setError('No se pudo cargar el producto para editar.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  // Compruebo si el usuario actual puede editar este producto.
  // La ruta ya está protegida para CLIENTE, así que aquí solo verifico
  // que el producto realmente pertenezca al usuario autenticado.
  const canEditProduct =
    !!user && // Si user existe y además...
    !!product && // ....producto existe y además...
    product.usuario?.id === user.id // ... el id del dueño del producto coincide con el id del usuario
    // product.usuario?.id significa: “intenta leer id de usuario, pero solo si usuario existe”

  // Handler para inputs de texto y textarea
  const handleTextChange = (
    event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    // Extraigo nombre del campo y nuevo valor
    const { name, value } = event.currentTarget;
    
     // Si el campo es descripción y supera el máximo, corto la ejecución
    if (name === 'descripcion' && value.length > MAX_PRODUCT_DESCRIPTION_LENGTH) {
      return;
    }

    // Actualizo solo el campo que ha cambiado dentro de formData
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    // Si había error visible, lo limpio cuando el usuario vuelve a escribir
    if (error) {
      setError('');
    }
  };

  // Handler para el checkbox de activo/inactivo
  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // Extraigo nombre y valor booleano del checkbox
    const { name, checked } = event.currentTarget;
    // Actualizo el campo booleano correspondiente dentro de formData
    setFormData((current) => ({
      ...current,
      [name]: checked,
    }));
  };

  // Handler para el select de categoría
  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    // Extraigo el valor seleccionado
    const { value } = event.currentTarget;

    // Actualizo categoriaId en el formulario
    setFormData((current) => ({
      ...current,
      categoriaId: value,
    }));
  };

   // Handler para seleccionar una nueva imagen
  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    // Intento recuperar el primer archivo elegido
    const file = event.currentTarget.files?.[0];

    // Si no hay archivo, salgo sin hacer nada
    if (!file) {
      return;
    }

    // Guardo el nombre del archivo para mostrarlo en pantalla
    setSelectedImageName(file.name);

    try {
      // Convierto el archivo a Base64 usando la utilidad compartida
      const base64Image = await convertFileToBase64(file);

       // Guardo la nueva imagen en el estado del formulario
      setFormData((current) => ({
        ...current,
        imagen: base64Image,
      }));
    } catch {
      // Si falla la conversión, muestro error
      setError('No se pudo procesar la imagen seleccionada.');
    }
  };

  // Handler para enviar el formulario de edición
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    // Evito el submit HTML clásico que recargaría la página
    event.preventDefault();

    // Valido que exista:
    // - id del producto
    // - token de sesión
    // - producto cargado
    if (!id || !token || !product) {
      setError('No se pudo guardar el producto.');
      return;
    }

     // Valido que haya categoría seleccionada
    if (!formData.categoriaId) {
      setError('Debes seleccionar una categoría.');
      return;
    }

    // Valido que haya precio
    if (formData.precio.trim() === '') {
      setError('Debes indicar un precio.');
      return;
    }

    // Valido el máximo de caracteres en descripción
    if (formData.descripcion.length > MAX_PRODUCT_DESCRIPTION_LENGTH) {
      setError(`La descripción no puede superar los ${MAX_PRODUCT_DESCRIPTION_LENGTH} caracteres.`);
      return;
    }

     // Activo estado de guardado y limpio errores previos
    setSaving(true);
    setError('');


    // Construyo el objeto que espera la API para actualizar el producto
    const payload: ProductUpdate = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precio: Number(formData.precio),
      activo: formData.activo,
      categoriaId: Number(formData.categoriaId),

      // Mantengo el valor actual de "modo" del producto original
      modo: product.modo,
    };

    // Solo la imagen al payload de actualización si existe una nueva imagen,
    // si está a null no envío este campo y así la imagen anterior se conserva
    if (formData.imagen) {   
      payload.imagen = formData.imagen;
    }

   
    try {
       // Llamo al servicio para actualizar el producto
      await updateProduct(Number(id), payload, token);

      // Si todo sale bien, vuelvo a "Mis productos
      navigate('/my-products');
    } catch {
      // Si falla la actualización, muestro error
      setError('No se pudo actualizar el producto.');
    } finally {
      // Pase lo que pase, desactivo el estado de guardado
      setSaving(false);
    }
  };


   // Mientras se cargan los datos iniciales, muestro Loading
  if (loading) {
    return <Loading />;
  }

  // Si hubo error y además no tengo producto cargado,
  // devuelvo directamente una pantalla de error
  if (error && !product) {
    return <ErrorMessage message={error} />;
  }

  // Si no existe producto o no pertenece al usuario actual,
  // bloqueo el acceso a la edición
  if (!product || !canEditProduct) {
    return <ErrorMessage message="No tienes permisos para editar este producto." />;
  }

  // Render principal de la página
  return (
    <main className="main-content-area">
      <h1 className="page-title">Editar Producto</h1>
      <div className="page-title-separator"></div>

      <p className="page-subtitle">
        Modifica la información principal de tu producto.
      </p>

      {/* Si hay error de validación o de guardado, lo muestro encima del formulario */}
      {error && <ErrorMessage message={error} />}

      {/* Renderizo el formulario compartido, pero con los textos y callbacks
        específicos de la edición */}
      <ProductForm
        formData={formData}
        categories={categories}
        selectedImageName={
          selectedImageName
            ? `Nueva imagen: ${selectedImageName}`
            : ''
        }
        saving={saving}
        submitLabel="Guardar cambios"
        imageLabel="Cambiar imagen"
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
