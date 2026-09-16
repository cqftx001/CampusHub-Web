import type {
  CategoryGroup,
} from "../../types/marketplace";

interface CategoryNavigationProps {
  categories: CategoryGroup[];
  selectedCategory?: string;
  isLoading: boolean;
  onSelect: (category?: string) => void;
}

export function CategoryNavigation({
  categories,
  selectedCategory,
  isLoading,
  onSelect,
}: CategoryNavigationProps) {
  if (isLoading) {
    return (
      <div
        className="category-navigation-skeleton"
        aria-label="Loading categories"
      >
        {Array.from({ length: 4 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
    );
  }

  const activeGroup = categories.find(
    (group) =>
      group.slug === selectedCategory ||
      group.children.some(
        (child) => child.slug === selectedCategory,
      ),
  );

  return (
    <section className="category-navigation">
      <div className="category-groups">
        <button
          type="button"
          className={
            selectedCategory
              ? "category-button"
              : "category-button active"
          }
          onClick={() => onSelect()}
        >
          All items
        </button>

        {categories.map((group) => (
          <button
            key={group.slug}
            type="button"
            className={
              activeGroup?.slug === group.slug
                ? "category-button active"
                : "category-button"
            }
            onClick={() => onSelect(group.slug)}
          >
            {group.displayName}
          </button>
        ))}
      </div>

      {activeGroup && (
        <div className="category-children">
          <button
            type="button"
            className={
              selectedCategory === activeGroup.slug
                ? "subcategory-button active"
                : "subcategory-button"
            }
            onClick={() => onSelect(activeGroup.slug)}
          >
            All {activeGroup.displayName}
          </button>

          {activeGroup.children.map((child) => (
            <button
              key={child.slug}
              type="button"
              className={
                selectedCategory === child.slug
                  ? "subcategory-button active"
                  : "subcategory-button"
              }
              onClick={() => onSelect(child.slug)}
            >
              {child.displayName}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}