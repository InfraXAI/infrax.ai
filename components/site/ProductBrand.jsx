// A product's mark and name wordmark from /assets/products, read as its plain name by screen readers.
import { PRODUCT_LOGOS, PRODUCT_TAGS } from '@/lib/site-data';

export default function ProductBrand({ slug, children }) {
  const [f, name, w] = PRODUCT_LOGOS[slug];
  return (
    <span className="pb">
      <img className="pb-mark" src={`/assets/products/${f}-mark.svg`} alt="" width="30" height="30" />
      <img className="pb-name" src={`/assets/products/${f}-name.svg`} alt={name} width={Math.round(w * 15 / 80)} height="15" />
      {children === undefined && PRODUCT_TAGS[slug] ? <span className="pb-x">{PRODUCT_TAGS[slug]}</span> : children}
    </span>
  );
}
