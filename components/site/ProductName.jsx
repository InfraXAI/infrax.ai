// A product's name with its category tag after it (same tag style as the product cards), e.g. Dhrishya  VIDES.
import { PRODUCTS, PRODUCT_TAGS } from '@/lib/site-data';

export default function ProductName({ slug }) {
  const p = PRODUCTS.find((q) => q[0] === slug);
  return <>{p[1]}{PRODUCT_TAGS[slug] ? <>{" "}<span className="pb-x pn-tag">{PRODUCT_TAGS[slug]}</span></> : null}</>;
}
