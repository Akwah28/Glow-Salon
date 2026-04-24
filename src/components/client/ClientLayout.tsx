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

  const brandColor = settings?.brand?.themeColor || '#4f46e5';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      {/* Top Banner indicating Theme */}
      <div className="w-full h-1.5" style={{ backgroundColor: brandColor }}></div>
      
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            {/* Logo area */}
            <Link to="/" className="flex items-center gap-2 group" onClick={closeMenu}>
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105"
                style={{ backgroundColor: brandColor }}
              >
                <Scissors size={18} />
              </div>
              <span className="font-bold text-lg tracking-tight">
                {settings?.brand?.bookingHeadline || "Our Studio"}
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`text-sm font-semibold transition-colors ${
                    location.pathname === link.path ? 'text-indigo-600' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  style={location.pathname === link.path ? { color: brandColor } : {}}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/book"
                className="px-5 py-2.5 rounded-lg text-sm font-bold text-white shadow hover:opacity-90 transition-opacity"
                style={{ backgroundColor: settings?.brand?.buttonColor || brandColor }}
              >
                Book Now
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="flex md:hidden items-center">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 focus:outline-none transition-colors"
                aria-expanded="false"
              >
                <span className="sr-only">Open main menu</span>
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-slate-100 bg-white">
            <div className="px-4 pt-2 pb-6 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`block px-3 py-3 rounded-md text-base font-bold transition-colors ${
                    location.pathname === link.path ? 'text-indigo-600 bg-indigo-50' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                  style={location.pathname === link.path ? { color: brandColor, backgroundColor: `${brandColor}15` } : {}}
                  onClick={closeMenu}
                >
                  {link.name}
                </Link>
              ))}
              <Link
                to="/book"
                className="block w-full text-center mt-4 px-5 py-3 rounded-xl text-base font-bold text-white shadow transition-opacity"
                style={{ backgroundColor: settings?.brand?.buttonColor || brandColor }}
                onClick={closeMenu}
              >
                Book Appointment
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 w-full flex flex-col">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p className="text-slate-500 text-sm font-medium">
              &copy; {new Date().getFullYear()} {settings?.brand?.bookingHeadline || "Our Studio"}. All rights reserved.
            </p>
            {settings?.brand?.footerText && (
              <p className="text-slate-400 text-xs mt-1">{settings.brand.footerText}</p>
            )}
          </div>
          <div className="flex gap-6">
            <Link to="/admin" className="text-xs uppercase tracking-widest font-bold text-slate-400 hover:text-slate-600 transition-colors">
              Admin Login
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
