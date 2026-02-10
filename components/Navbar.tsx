'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [solOpen, setSolOpen] = useState(false);

  return (
    <>
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        padding: '14px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #e8e8ee',
      }}>
        <Link href="/" className="nav-logo flex items-center gap-2">
          <img src="/logo-dark.svg" alt="InfraX AI" style={{ height: '36px', width: 'auto' }} />
        </Link>
        <div className="nav-links hidden md:flex items-center gap-8">
          {/* Solutions dropdown */}
          <div className="relative" onMouseEnter={() => setSolOpen(true)} onMouseLeave={() => setSolOpen(false)}>
            <button className="text-[14px] text-[#5a5a7a] font-medium hover:text-[#1a1a2e] transition-colors flex items-center gap-1">
              Solutions
              <svg width="10" height="6" viewBox="0 0 10 6" fill="none" className="mt-[1px]"><path d="M1 1l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
            </button>
            {solOpen && (
              <div className="absolute top-full left-[-16px] pt-2">
                <div className="bg-white rounded-xl border border-[#e8e8ee] shadow-lg py-2 min-w-[220px]">
                  <Link href="/solutions/government" className="block px-4 py-2.5 text-[14px] text-[#5a5a7a] hover:bg-[#f8f9fb] hover:text-[#1a1a2e] transition-colors">
                    Government & NHAI
                  </Link>
                  <Link href="/solutions/system-integrators" className="block px-4 py-2.5 text-[14px] text-[#5a5a7a] hover:bg-[#f8f9fb] hover:text-[#1a1a2e] transition-colors">
                    System Integrators
                  </Link>
                  <Link href="/solutions/smart-cities" className="block px-4 py-2.5 text-[14px] text-[#5a5a7a] hover:bg-[#f8f9fb] hover:text-[#1a1a2e] transition-colors">
                    Smart Cities
                  </Link>
                  <Link href="/solutions/smart-buildings" className="block px-4 py-2.5 text-[14px] text-[#5a5a7a] hover:bg-[#f8f9fb] hover:text-[#1a1a2e] transition-colors">
                    Smart Buildings
                  </Link>
                </div>
              </div>
            )}
          </div>
          <Link href="/case-studies/transharyana-atms" className="text-[14px] text-[#5a5a7a] font-medium hover:text-[#1a1a2e] transition-colors">Case Study</Link>
          <Link href="/about" className="text-[14px] text-[#5a5a7a] font-medium hover:text-[#1a1a2e] transition-colors">About</Link>
          <Link href="/#contact" className="nav-cta px-5 py-2 bg-[#2673B5] text-white rounded-lg text-[14px] font-medium hover:opacity-85 transition-opacity">Get in Touch</Link>
        </div>
        <button 
          className={`nav-hamburger md:hidden flex flex-col gap-[5px] cursor-pointer p-1 bg-none border-none ${isOpen ? 'open' : ''}`} 
          onClick={() => setIsOpen(!isOpen)}
        >
          <span className={`w-[22px] h-[2px] bg-[#1a1a2e] rounded-sm transition-all duration-300 ${isOpen ? 'rotate-45 translate-x-[5px] translate-y-[5px]' : ''}`}></span>
          <span className={`w-[22px] h-[2px] bg-[#1a1a2e] rounded-sm transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`}></span>
          <span className={`w-[22px] h-[2px] bg-[#1a1a2e] rounded-sm transition-all duration-300 ${isOpen ? '-rotate-45 translate-x-[5px] -translate-y-[5px]' : ''}`}></span>
        </button>
      </nav>
      
      {/* Mobile menu */}
      <div 
        className={`nav-mobile fixed top-[55px] left-0 right-0 bg-white/97 backdrop-blur-xl border-b border-[#e8e8ee] p-4 flex flex-col gap-1 z-[99] ${isOpen ? 'flex' : 'hidden'}`}
      >
        <div className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9090a8] px-2 pt-2 pb-1">Solutions</div>
        <Link href="/solutions/government" className="text-[15px] text-[#5a5a7a] font-medium py-2 px-2 hover:text-[#1a1a2e] rounded-lg hover:bg-[#f8f9fb]" onClick={() => setIsOpen(false)}>Government & NHAI</Link>
        <Link href="/solutions/system-integrators" className="text-[15px] text-[#5a5a7a] font-medium py-2 px-2 hover:text-[#1a1a2e] rounded-lg hover:bg-[#f8f9fb]" onClick={() => setIsOpen(false)}>System Integrators</Link>
        <Link href="/solutions/smart-cities" className="text-[15px] text-[#5a5a7a] font-medium py-2 px-2 hover:text-[#1a1a2e] rounded-lg hover:bg-[#f8f9fb]" onClick={() => setIsOpen(false)}>Smart Cities</Link>
        <Link href="/solutions/smart-buildings" className="text-[15px] text-[#5a5a7a] font-medium py-2 px-2 hover:text-[#1a1a2e] rounded-lg hover:bg-[#f8f9fb]" onClick={() => setIsOpen(false)}>Smart Buildings</Link>
        <div className="h-[1px] bg-[#e8e8ee] my-2"></div>
        <Link href="/case-studies/transharyana-atms" className="text-[15px] text-[#5a5a7a] font-medium py-2 px-2 hover:text-[#1a1a2e] rounded-lg hover:bg-[#f8f9fb]" onClick={() => setIsOpen(false)}>Case Study</Link>
        <Link href="/about" className="text-[15px] text-[#5a5a7a] font-medium py-2 px-2 hover:text-[#1a1a2e] rounded-lg hover:bg-[#f8f9fb]" onClick={() => setIsOpen(false)}>About</Link>
        <div className="h-[1px] bg-[#e8e8ee] my-2"></div>
        <Link href="/#contact" className="text-[15px] text-white font-medium py-2.5 px-4 bg-[#2673B5] rounded-lg text-center" onClick={() => setIsOpen(false)}>Get in Touch</Link>
      </div>
    </>
  );
}
