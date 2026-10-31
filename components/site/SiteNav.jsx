'use client';
// Skip link, top nav (Products and Platform menus) and the mobile sheet: JSX port of build.py nav() + products_menu().
// Markup and classes are identical; behaviour (menus, sheet, scrolled state) is bound once by lib/site-runtime.js.
// The current-page marks (aria-current on [data-nav] links, .is-current on the menu button) come from the route here.
import { usePathname } from 'next/navigation';
import { PLATFORM, PRODUCTS, MARKS, PRODUCT_LOGOS, pageForPath } from '@/lib/site-data';
import ProductName from './ProductName';
import { Arrow } from './Arrow';

function Chevron() {
  return <svg width="10" height="6" viewBox="0 0 10 6" fill="none" aria-hidden="true"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" /></svg>;
}

export default function SiteNav() {
  const page = pageForPath(usePathname());
  const cur = (name) => (name === page ? 'page' : undefined);
  const menuFor = ['how-it-works', 'analytics', 'deployment', 'integrations'].includes(page) ? 'platform' : page === 'products' ? 'products' : null;
  const btnClass = (m) => (menuFor === m ? 'is-current' : undefined);

  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="site-nav"><div className="wrap">
        <a className="brand" href="/" aria-label="INFRAX.AI home"><img src="/assets/logo.svg" alt="INFRAX.AI" width="110" height="32" /></a>
        <ul className="nav-links">
          <li className="has-menu"><button type="button" aria-expanded="false" aria-haspopup="true" data-menu="products" className={btnClass('products')}>Products <Chevron /></button>
            <div className="menu menu-products"><div className="pm-row">
              {PRODUCTS.map(([s, n, d]) => (
                <a key={s} href={`/products#${s}`} data-nav="products" aria-current={cur('products')}>{PRODUCT_LOGOS[s] ? <i className="mk" aria-hidden="true"><img className="lt" src={`/assets/products/${PRODUCT_LOGOS[s][0]}-mark.svg`} alt="" width="40" height="40" /><img className="dk" src={`/assets/products/${PRODUCT_LOGOS[s][0]}-mark-white.svg`} alt="" width="40" height="40" /></i> : <i style={{ '--pc': MARKS[s][0], '--pr': `${MARKS[s][1]}deg` }} aria-hidden="true"></i>}<b><ProductName slug={s} /></b><span>{d}</span></a>
              ))}
            </div><a className="pm-all" href="/products">See every product in action &rarr;</a></div></li>
          <li className="has-menu"><button type="button" aria-expanded="false" aria-haspopup="true" data-menu="platform" className={btnClass('platform')}>Platform <Chevron /></button>
            <div className="menu">
              {PLATFORM.map(([p, t, d, icon]) => (
                <a key={p} href={`/${p}`} data-nav={p} aria-current={cur(p)}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true" dangerouslySetInnerHTML={{ __html: icon }} /><b>{t}</b><span>{d}</span></a>
              ))}
            </div></li>
          <li><a href="/services" data-nav="services" aria-current={cur('services')}>Services</a></li>
          <li><a href="/#company" data-nav="company" aria-current={cur('company')}>Company</a></li>
        </ul>
        <div className="nav-cta"><a className="btn btn-primary" href="/#demo" data-magnetic="">Book a demo <Arrow /></a></div>
        <button className="nav-toggle" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="navSheet"><svg viewBox="0 0 20 20" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6"><path className="nt-open" d="M3 6h14M3 10h14M3 14h14" /><path className="nt-close" d="M5 5l10 10M15 5L5 15" /></svg></button>
      </div></header>
      <nav className="sheet" id="navSheet" aria-label="Mobile">
        <a href="/" data-nav="home" aria-current={cur('home')}>Home<small>INFRAX.AI</small></a>
        <a href="/products" data-nav="products" aria-current={cur('products')}>Products<small>Our products</small></a>
        {PLATFORM.map(([p, t]) => (
          <a key={p} href={`/${p}`} data-nav={p} aria-current={cur(p)}>{t}<small>Platform</small></a>
        ))}
        <a href="/services" data-nav="services" aria-current={cur('services')}>Services<small>Integration &amp; delivery</small></a>
        <a href="/#company">Company<small>About</small></a>
        <a className="btn btn-primary" href="/#demo">Book a demo <Arrow /></a>
      </nav>
    </>
  );
}
