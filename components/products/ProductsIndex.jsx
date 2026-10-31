// "Every product, at a glance": the product cards (#cyIdx, filled by the page script).
// Markup from site/src/products.html, unchanged apart from JSX syntax.
export default function ProductsIndex() {
  return (
    <section className="scene tight cy-index" aria-labelledby="cy-idx-h">
      <div className="wrap">
        <h2 className="h-1" id="cy-idx-h" data-reveal="">Every product, at a glance.</h2>
        <div className="cy-idx6" id="cyIdx"></div>
      </div>
    </section>
  );
}
