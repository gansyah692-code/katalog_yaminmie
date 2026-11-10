import React from 'react';

export const CategoryPills = ({ categories, activeCategoryId, onSelectCategory }) => {
    return (
        <div className="category-pills-wrapper">
            <div className="category-pills-scroll">
                <button
                    className={`category-pill ${activeCategoryId === '' ? 'active' : ''}`}
                    onClick={() => onSelectCategory('')}
                    id="cat-pill-all"
                    aria-pressed={activeCategoryId === ''}
                >
                    <span>Semua Menu</span>
                </button>
                {categories.map((category) => {
                    const isActive = activeCategoryId === category.id;
                    return (
                        <button
                            key={category.id}
                            className={`category-pill ${isActive ? 'active' : ''}`}
                            onClick={() => onSelectCategory(category.id)}
                            id={`cat-pill-${category.slug || category.id}`}
                            aria-pressed={isActive}
                        >
                            <span>{category.name}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
