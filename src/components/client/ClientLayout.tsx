import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Menu, X, Scissors } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { BusinessSettings } from '../../types';
import { mergeWithDefaultSettings, defaultSettings } from '../../lib/settingsDefaults';

export default function ClientLayout() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const [settings, setSettings] = useState<BusinessSettings | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const querySnapshot = await getDocs(query(collection(db, 'settings'), where('__name__', '==', 'general')));
        if (!querySnapshot.empty) {
           setSettings(mergeWithDefaultSettings(querySnapshot.docs[0].data() as Partial<BusinessSettings>));
        } else {
           setSettings(defaultSettings);
        }
      } catch (err) {
        console.error("Error loading settings", err);
      }
    };
    fetchSettings();
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Contact', path: '/contact' },
    { name: 'My Bookings', path: '/my-bookings' }
  ];

  const brandColor = settings?.brand?.themeColor || '#6c5c47';
  const buttonColor = settings?.brand?.buttonColor || '#2a2626';

  return (
    <div className="min-h-screen bg-[#f8f7f5] flex flex-col font-sans text-stone-900 selection:bg-stone-200">
      {/* Navigation */}
      <nav className="bg-[#fefdfb] border-b border-stone-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex justify-between h-24 items-center">
            {/* Logo area */}
            <Link to="/" className="flex items-center gap-3 group" onClick={closeMenu}>
              <div 
                className="w-10 h-10 rounded-full flex items-center justify-center text-white transition-transform group-hover:scale-105"
                style={{ backgroundColor: brandColor }}
              >
                <Scissors size={20} strokeWidth={1.5} />
              </div>
              <span className="font-serif font-bold text-2xl tracking-tight text-[#1a1a1a]">
                {settings?.brand?.bookingHeadline || "Our Studio"}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-10">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-[15px] transition-colors ${
                    location.pathname === link.path ? 'font-medium' : 'text-stone-500 font-light hover:text-stone-900'
                  }`}
                  style={location.pathname === link.path ? { color: brandColor } : {}}
                >
                  {link.name}
             </Link>
              ))}
              <Link
                to="/book"
                className="px-8 py-3 rounded-full text-[15px] font-medium text-white shadow-sm hover:opacity-90 hover:-translate-y-0.5 transition-all"
                style={{ backgroundColor: buttonColor }}
              >
                Book Now
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-stone-500 hover:text-stone-900 hover:bg-stone-50 focus:outline-none transition-colors"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? <X size={28} strokeWidth={1.5} /> : <Menu size={28} strokeWidth={1.5} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-stone-100 bg-white">
            <div className="px-6 pt-4 pb-8 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-4 py-4 rounded-2xl text-lg transition-colors ${
                    location.pathname === link.path ? 'font-medium bg-stone-50' : 'text-stone-600 font-light active:bg-stone-50'
                  }`}
                  style={location.pathname === link.path ? { color: brandColor } : {}}
                  onClick={closeMenu}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/book"
                className="block w-full text-center mt-6 px-6 py-4 rounded-full text-lg font-medium text-white shadow-sm transition-opacity"
                style={{ backgroundColor: buttonColor }}
                onClick={closeMenu}
              >
                Book Appointment
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col items-center">
        <div className="w-full flex-1 flex flex-col">
          <Outlet context={{ settings }} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-stone-200 mt-auto">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2 mb-4 opacity-50">
               <Scissors size={18} strokeWidth={1.5} />
               <span className="font-serif font-bold text-lg tracking-tight">
                 {settings?.brand?.bookingHeadline || "Our Studio"}
               </span>
            </div>
            <p className="text-stone-500 font-light text-sm">
              &copy; {new Date().getFullYear()} {settings?.brand?.bookingHeadline || "Our Studio"}. All rights reserved.
            </p>
            {settings?.brand?.footerText && (
              <p className="text-stone-400 font-light text-xs mt-2">{settings.brand.footerText}</p>
            )}
          </div>
          <div className="flex flex-col items-center md:items-end gap-6 mt-4 md:mt-0">
            {/* Social Media Links */}
            <div className="flex items-center gap-5 text-stone-400">
              {settings?.socials?.instagram ? (
                <a href={settings.socials.instagram} target="_blank" rel="noreferrer" className="hover:text-stone-800 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
              ) : (
                <a href="#" className="hover:text-stone-800 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                </a>
              )}
              {settings?.socials?.facebook ? (
                <a href={settings.socials.facebook} target="_blank" rel="noreferrer" className="hover:text-stone-800 transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
              ) : (
                <a href="#" className="hover:text-stone-800 transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                </a>
              )}
              {settings?.socials?.twitter ? (
                <a href={settings.socials.twitter} target="_blank" rel="noreferrer" className="hover:text-stone-800 transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </a>
              ) : (
                <a href="#" className="hover:text-stone-800 transition-colors">
                   <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
                </a>
              )}
            </div>
            <Link to="/admin" className="text-xs uppercase tracking-widest font-medium text-stone-400 hover:text-stone-800 transition-colors">
              Admin Access
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
