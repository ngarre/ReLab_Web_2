import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Loading } from '../components/Loading';
import { ErrorMessage } from '../components/ErrorMessage';
import { useAuth } from '../hooks/useAuth';
import { getProductById, updateProduct } from '../services/productService';
import type { Product } from '../types/Product';
import type { ProductUpdate } from '../types/ProductUpdate';
import './EditProduct.css';

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token, role } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductUpdate>({
    nombre: '',
    descripcion: '',
    precio: 0,
    activo: true,
    categoriaId: null,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) {
      setError('No se ha encontrado el producto.');
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    getProductById(Number(id))
      .then((data) => {
        setProduct(data);
        setFormData({
          nombre: data.nombre || '',
          descripcion: data.descripcion || '',
          precio: data.precio || 0,
          activo: data.activo,
          categoriaId: data.categoria?.id ?? null,
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

    setFormData((current) => ({
      ...current,
      [name]: name === 'precio' ? Number(value) : value,
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

    if (!id || !token) {
      setError('No se pudo guardar el producto.');
      return;
    }

    setSaving(true);
    setError('');

    try {
      await updateProduct(Number(id), formData, token);
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
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}