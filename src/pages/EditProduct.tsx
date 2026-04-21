import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { getCategories } from '../services/categoryService';
import { getProductById, updateProduct } from '../services/productService';
import type { Category } from '../types/Category';
import type { Product } from '../types/Product';
import type { ProductUpdate } from '../types/ProductUpdate';
import { convertFileToBase64 } from '../utils/file';
import { ProductForm } from '../components/ProductForm';
import type { ProductFormData } from '../types/ProductFormData';
import './EntityForm.css';


const MAX_PRODUCT_DESCRIPTION_LENGTH = 200;

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token, role } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState<ProductFormData>({
    nombre: '',
    descripcion: '',
    precio: '',
    activo: true,
    categoriaId: '',
    imagen: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [selectedImageName, setSelectedImageName] = useState('');

  useEffect(() => {
    if (!id) {
      setError('No se ha encontrado el producto.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    Promise.all([getProductById(Number(id)), getCategories()])
      .then(([productData, categoriesData]) => {
        setProduct(productData);
        setCategories(categoriesData.filter((category) => category.activa));
        setFormData({
          nombre: productData.nombre || '',
          descripcion: productData.descripcion || '',
          precio: String(productData.precio ?? ''),
          activo: productData.activo,
          categoriaId: String(productData.categoria?.id ?? ''),
          imagen: null,
        });
      })
      .catch(() => {
        setError('No se pudo cargar el producto para editar.');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const canEditProduct =
    !!user &&
    !!product &&
    (
      role === 'ADMIN' ||
      role === 'GESTOR' ||
      product.usuario?.id === user.id
    );

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

    if (!id || !token || !product) {
      setError('No se pudo guardar el producto.');
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

    const payload: ProductUpdate = {
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      precio: Number(formData.precio),
      activo: formData.activo,
      categoriaId: Number(formData.categoriaId),
      modo: product.modo,
    };

    if (formData.imagen) {
      payload.imagen = formData.imagen;
    }

    try {
      await updateProduct(Number(id), payload, token);
      navigate('/my-products');
    } catch {
      setError('No se pudo actualizar el producto.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error && !product) {
    return <ErrorMessage message={error} />;
  }

  if (!product || !canEditProduct) {
    return <ErrorMessage message="No tienes permisos para editar este producto." />;
  }

  return (
    <main className="main-content-area">
      <h1 className="page-title">Editar Producto</h1>
      <div className="page-title-separator"></div>

      <p className="page-subtitle">
        Modifica la información principal de tu producto.
      </p>

      {error && <ErrorMessage message={error} />}

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
