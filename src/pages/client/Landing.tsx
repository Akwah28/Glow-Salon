import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Calendar, Clock, Scissors, Star, CheckCircle } from 'lucide-react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { BusinessSettings } from '../../types';
import { mergeWithDefaultSettings, defaultSettings } from '../../lib/settingsDefaults';

export default function Landing() {
  const navigate = useNavigate();
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

  const themeColor = settings?.brand?.themeColor || '#4f46e5';
  const buttonColor = settings?.brand?.buttonColor || '#4f46e5';

  return (
    <div className="bg-white flex flex-col flex-1">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-slate-50 py-20 sm:py-32 border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
          <div 
             className="inline-flex items-center justify-center p-3 sm:p-4 rounded-2xl mb-8 shadow-sm"
             style={{ backgroundColor: `${themeColor}10`, color: themeColor }}
          >
             <Scissors size={32} className="sm:w-10 sm:h-10" />
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-slate-900 max-w-4xl mb-6">
            {settings?.brand?.bookingHeadline || "Professional Styling & Wellness"}
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mb-10 leading-relaxed">
            {settings?.brand?.welcomeMessage || "Experience expert treatments in a relaxing atmosphere. We specialize in bringing out your best self with personalized care and modern techniques."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
             <button
                onClick={() => navigate('/book')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl text-white font-bold shadow-md hover:-translate-y-1 transition-transform"
                style={{ backgroundColor: buttonColor }}
             >
                Book Appointment
             </button>
             <button
                onClick={() => navigate('/services')}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-slate-700 font-bold shadow-sm border border-slate-200 hover:bg-slate-50 hover:-translate-y-1 transition-transform"
             >
                View Services
             </button>
          </div>
        </div>
        {/* Abstract background decorative shapes */}
        <div className="absolute top-0 left-1/2 -ml-[40rem] -mt-32 blur-3xl opacity-30 select-none pointer-events-none">
           <div className="w-[80rem] h-[40rem] rounded-full" style={{ background: `radial-gradient(ellipse at center, ${themeColor} 0%, transparent 60%)` }} />
        </div>
      </section>

      {/* Features/Benefits Section */}
      <section className="py-20 bg-white">
         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
               <h2 className="text-3xl font-bold text-slate-900 mb-4">Why Choose Us</h2>
               <p className="text-slate-500 text-lg">We pride ourselves on delivering exceptional results with a focus on your comfort and specific needs.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-10">
               {[
                  { icon: <Star size={24} />, title: "Expert Professionals", desc: "Our team consists of highly trained specialists dedicated to their craft." },
                  { icon: <Clock size={24} />, title: "Time Respected", desc: "We know your time is valuable. Our scheduling ensures minimal waiting." },
                  { icon: <CheckCircle size={24} />, title: "Premium Quality", desc: "We use only the highest quality products and state-of-the-art equipment." }
               ].map((feature, i) => (
                  <div key={i} className="flex flex-col items-center text-center p-6 rounded-2xl bg-slate-50 border border-slate-100">
                     <div className="p-4 rounded-full bg-white shadow-sm mb-6" style={{ color: themeColor }}>
                        {feature.icon}
                     </div>
                     <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                     <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-12">
               <h2 className="text-3xl font-bold text-slate-900 mb-4">Our Studio</h2>
               <p className="text-slate-500 text-lg">A glimpse into our relaxing and professional environment.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
               <img src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800" alt="Salon interior" className="w-full h-64 object-cover rounded-2xl shadow-sm hover:scale-[1.02] transition-transform duration-300" />
               <img src="https://images.unsplash.com/photo-1595476108010-b4d1f10d5e43?auto=format&fit=crop&q=80&w=800" alt="Spa treatment" className="w-full h-64 object-cover rounded-2xl shadow-sm md:col-span-2 lg:col-span-2 hover:scale-[1.02] transition-transform duration-300" />
               <img src="https://images.unsplash.com/photo-1522337660859-02fbefca4702?auto=format&fit=crop&q=80&w=800" alt="Hair styling" className="w-full h-64 object-cover rounded-2xl shadow-sm hover:scale-[1.02] transition-transform duration-300" />
            </div>
         </div>
      </section>

      {/* Trust/Social Proof Section (Placeholder) */}
      <section className="py-24 bg-slate-900 text-white relative overflow-hidden">
         <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
            <h2 className="text-3xl sm:text-4xl font-bold mb-8">Trusted by hundreds of happy clients</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
               {[1, 2, 3].map((n) => (
                  <div key={n} className="bg-slate-800/50 border border-slate-700 p-8 rounded-2xl text-left">
                     <div className="flex text-yellow-400 mb-4">
                        {[1,2,3,4,5].map(star => <Star key={star} size={16} fill="currentColor" />)}
                     </div>
                     <p className="text-slate-300 italic mb-6">"Absolutely fantastic service. The atmosphere is relaxing, the staff is professional, and the results exceeded my expectations."</p>
                     <div className="font-bold text-slate-100">- Client Review</div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-white border-t border-slate-100">
         <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center bg-slate-50 p-12 rounded-3xl border border-slate-200">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Ready to refresh your look?</h2>
            <p className="text-slate-500 text-lg mb-8 max-w-xl mx-auto">Book your appointment today and let our specialists take care of the rest.</p>
            <button
               onClick={() => navigate('/book')}
               className="px-10 py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl transition-shadow"
               style={{ backgroundColor: buttonColor }}
            >
               Schedule Now
            </button>
         </div>
      </section>
    </div>
  );
}
