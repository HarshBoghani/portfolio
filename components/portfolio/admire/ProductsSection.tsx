'use client';

import ProductCard from './ProductCard';
import { PRODUCTS_PLACEHOLDER } from './products-data';

export default function ProductsSection() {
  return (
    <section className="space-y-3">
      {PRODUCTS_PLACEHOLDER.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </section>
  );
}
