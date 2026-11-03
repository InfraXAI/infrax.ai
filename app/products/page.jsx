// /products: port of site/src/products.html. Markup in components/products/*, page CSS in ./products.css,
// page script in lib/pages/products.js (run by ProductsScript).
import './products.css';
import { pageMetadata } from '@/lib/seo';
import JsonLd from '@/components/site/JsonLd';
import ProductsDeepHold from '@/components/products/ProductsDeepHold';
import ProductsIntro from '@/components/products/ProductsIntro';
import ProductsTunnel from '@/components/products/ProductsTunnel';
import ProductsIndex from '@/components/products/ProductsIndex';
import ProductsNext from '@/components/products/ProductsNext';
import ProductsScript from '@/components/products/ProductsScript';

export const metadata = pageMetadata('products');

export default function ProductsPage() {
  return (
    <>
      <JsonLd page="products" />
      <ProductsDeepHold />
      <ProductsIntro />
      <ProductsTunnel />
      <ProductsIndex />
      <ProductsNext />
      <ProductsScript />
    </>
  );
}
