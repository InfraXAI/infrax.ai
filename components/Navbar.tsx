'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

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
        <div className="nav-logo flex items-center gap-2">
          <img src="logo-dark.svg" alt="InfraX AI" style={{ height: '36px', width: 'auto' }} />
        </div>
        <div className="nav-links hidden md:flex items-center gap-8">
          <Link href="#platform" className="text-[14px] text-[#5a5a7a] font-medium hover:text-[#1a1a2e] transition-colors">Platform</Link>
          <Link href="#how" className="text-[14px] text-[#5a5a7a] font-medium hover:text-[#1a1a2e] transition-colors">How It Works</Link>
          <Link href="#ai" className="text-[14px] text-[#5a5a7a] font-medium hover:text-[#1a1a2e] transition-colors">AI Capabilities</Link>
          <Link href="#contact" className="nav-cta px-5 py-2 bg-[#2673B5] text-white rounded-lg text-[14px] font-medium hover:opacity-85 transition-opacity">Get in Touch</Link>
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
      
      <div 
        className={`nav-mobile fixed top-[55px] left-0 right-0 bg-white/97 backdrop-blur-xl border-b border-[#e8e8ee] p-4 flex flex-col gap-4 z-[99] ${isOpen ? 'flex' : 'hidden'}`}
      >
        <Link href="#platform" className="text-[16px] text-[#5a5a7a] font-medium py-2 hover:text-[#1a1a2e]" onClick={() => setIsOpen(false)}>Platform</Link>
        <Link href="#how" className="text-[16px] text-[#5a5a7a] font-medium py-2 hover:text-[#1a1a2e]" onClick={() => setIsOpen(false)}>How It Works</Link>
        <Link href="#ai" className="text-[16px] text-[#5a5a7a] font-medium py-2 hover:text-[#1a1a2e]" onClick={() => setIsOpen(false)}>AI Capabilities</Link>
        <Link href="#contact" className="text-[16px] text-[#5a5a7a] font-medium py-2 hover:text-[#1a1a2e]" onClick={() => setIsOpen(false)}>Get in Touch</Link>
      </div>
    </>
  );
}
