import React from 'react';
import { Utensils, Coffee, Cookie, Layers } from 'lucide-react';

export const CategoryPills = ({ categories, activeCategoryId, onSelectCategory, totalProductCount }) => {
    // Category icon helper
    const getCategoryIcon = (name) => {
        const lower = name.toLowerCase();
        if (lower.includes('makan')) return <Utensils size={15} />;
        if (lower.includes('minum')) return <Coffee size={15} />;
        if (lower.includes('camil') || lower.includes('snack')) return <Cookie size={15} />;
        return <Layers size={15} />;
    };

    return (
        <div className="category-pills-wrapper">
            <div className="category-pills-scroll">
                {/* All Products Pill */}
                <button
                    className={`category-pill ${activeCategoryId === '' ? 'active' : ''}`}
                    onClick={() => onSelectCategory('')}
                    id="cat-pill-all"
                >
                    <Layers size={15} />
                    <span>Semua Menu</span>
                    <span className="pill-count">{totalProductCount}</span>
                </button>
                {/* Dynamic Category Pills */}
                {categories.map((cat) => {
                    const isActive = activeCategoryId === cat.id;
                    return (
                        <button
                            key={cat.id}
                            className={`category-pill ${isActive ? 'active' : ''}`}
                            onClick={() => onSelectCategory(cat.id)}
                            id={`cat-pill-${cat.slug || cat.id}`}
                        >
                            {getCategoryIcon(cat.name)}
                            <span>{cat.name}</span>
                            {cat.productCount !== undefined && (
                                <span className="pill-count">{cat.productCount}</span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
