'use client';

import { useState, FormEvent } from 'react';

interface LeadCaptureFormProps {
  source?: string;
  className?: string;
}

export default function LeadCaptureForm({ source = 'website', className = '' }: LeadCaptureFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    organization: '',
    email: '',
    phone: '',
    audience: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const inputClass = "w-full py-3.5 px-4 border border-[#e8e8ee] rounded-[10px] text-[14px] bg-[#f8f9fb] text-[#1a1a2e] outline-none focus:border-[#2673B5] transition-colors font-[inherit]";

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, source }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit form');
      }

      setStatus('success');
      setFormData({ name: '', organization: '', email: '', phone: '', audience: '', message: '' });
    } catch {
      setStatus('error');
      setErrorMessage('Failed to submit. Please try again or email us directly at info@infrax.ai');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  if (status === 'success') {
    return (
      <div className={`bg-[#f0fdf4] border border-[#bbf7d0] rounded-[10px] p-8 text-center ${className}`}>
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" className="mx-auto mb-4"><path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" strokeLinecap="round" strokeLinejoin="round"/></svg>
        <h3 className="text-[22px] font-bold text-[#1a1a2e] mb-2">Thank you!</h3>
        <p className="text-[15px] text-[#5a5a7a]">We&apos;ve received your message and will get back to you within 24 hours.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`grid gap-[14px] ${className}`}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-[14px]">
        <div>
          <label className="block text-[13px] font-medium text-[#5a5a7a] mb-1.5">Name *</label>
          <input type="text" name="name" required value={formData.name} onChange={handleChange} placeholder="Your full name" className={inputClass} />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#5a5a7a] mb-1.5">Organization *</label>
          <input type="text" name="organization" required value={formData.organization} onChange={handleChange} placeholder="Company or department" className={inputClass} />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#5a5a7a] mb-1.5">Email *</label>
          <input type="email" name="email" required value={formData.email} onChange={handleChange} placeholder="your.email@example.com" className={inputClass} />
        </div>
        <div>
          <label className="block text-[13px] font-medium text-[#5a5a7a] mb-1.5">Phone</label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+91 98765 43210" className={inputClass} />
        </div>
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[#5a5a7a] mb-1.5">I am a... *</label>
        <select name="audience" required value={formData.audience} onChange={handleChange} className={inputClass}>
          <option value="">Select your role</option>
          <option value="Government">Government Official</option>
          <option value="System Integrator">System Integrator</option>
          <option value="Smart City">Smart City Developer</option>
          <option value="Builder">Building Developer/Manager</option>
          <option value="Other">Other</option>
        </select>
      </div>
      <div>
        <label className="block text-[13px] font-medium text-[#5a5a7a] mb-1.5">Message</label>
        <textarea name="message" rows={4} value={formData.message} onChange={handleChange} placeholder="Tell us about your infrastructure monitoring needs..." className={`${inputClass} min-h-[100px] resize-y`} />
      </div>

      {status === 'error' && (
        <div className="bg-[#fef2f2] border border-[#fecaca] rounded-[10px] p-3 text-[13px] text-[#dc2626]">{errorMessage}</div>
      )}

      <button type="submit" disabled={status === 'submitting'} className="w-full py-3.5 px-8 bg-[#2673B5] text-white rounded-[10px] text-[15px] font-semibold border-none cursor-pointer transition-all hover:bg-[#3a8fd4] hover:-translate-y-[1px] text-center disabled:opacity-50">
        {status === 'submitting' ? 'Submitting...' : 'Get Started'}
      </button>

      <p className="text-[12px] text-[#9090a8] text-center">
        By submitting, you agree to receive communications from InfraX AI. We respect your privacy.
      </p>
    </form>
  );
}
