'use client';
// Runs the Products page script (lib/pages/products.js) after the page markup mounts, and stops it on the way out.
import { usePage } from '@/lib/use-page';
import { init } from '@/lib/pages/products';

export default function ProductsScript() {
  usePage('products', init);
  return null;
}
