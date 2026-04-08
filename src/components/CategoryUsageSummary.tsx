import './CategoryUsageSummary.css';

interface CategoryUsageItem {
  name: string;
  count: number;
}

interface CategoryUsageSummaryProps {
  title: string;
  items: CategoryUsageItem[];
  emptyMessage?: string;
}

export function CategoryUsageSummary({
  title,
  items,
  emptyMessage = 'No hay datos de categorías disponibles.'
}: CategoryUsageSummaryProps) {
  return (
    <div className="dashboard-category-summary">
      <h2 className="dashboard-section-title">{title}</h2>

      {items.length === 0 ? (
        <p className="empty-message">{emptyMessage}</p>
      ) : (
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