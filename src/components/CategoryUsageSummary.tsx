import './CategoryUsageSummary.css';

// Defino la forma de cada elemento del resumen.
// Cada item representa una categoría y cuántos productos tiene.
interface CategoryUsageItem {
  name: string;
  count: number;
}

// Defino las props que necesita el componente
interface CategoryUsageSummaryProps {
  // Título del bloque resumen
  title: string;
  // Lista de categorías con su recuento
  items: CategoryUsageItem[];
  // Mensaje opcional si no hay datos
  emptyMessage?: string;
}

// Defino el componente y hago destructuring de sus props
export function CategoryUsageSummary({
  title,
  items,
  emptyMessage = 'No hay datos de categorías disponibles.' // Valor por defecto
}: CategoryUsageSummaryProps) {
  return (
    <div className="dashboard-category-summary">
      <h2 className="dashboard-section-title">{title}</h2>

      {items.length === 0 ? (
        <p className="empty-message">{emptyMessage}</p> // Mensaje vacío que se muestra si no hay datos disponibles
      ) : (
        // Si sí que hay elementos, abro el contenedor de la lista
        <div className="dashboard-category-list">
          {items.map((item) => (
            <article key={item.name} className="dashboard-category-card">
              <h3>{item.name}</h3>
              <p>{item.count} productos</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}