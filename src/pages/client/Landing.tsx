import React from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { Clock, Scissors, Star, CheckCircle, ArrowRight } from 'lucide-react';
import { BusinessSettings } from '../../types';

export default function Landing() {
  const navigate = useNavigate();
  const { settings } = useOutletContext<{ settings: BusinessSettings | null }>();

  const themeColor = settings?.brand?.themeColor || '#6c5c47'; // A warmer earthy default
  const buttonColor = settings?.brand?.buttonColor || '#2a2626'; // Dark sophisticated button

  return (
    <div className="bg-[#f8f7f5] flex flex-col flex-1 selection:bg-stone-200">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-28 pb-32 border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 relative z-10 flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2 flex flex-col items-start text-left">
            <h1 className="text-5xl sm:text-7xl font-serif text-[#1a1a1a] mb-6 leading-[1.1] tracking-tight">
              {settings?.brand?.bookingHeadline || "Elevate your daily ritual."}
            </h1>
            <p className="text-xl text-stone-600 mb-10 leading-relaxed font-light">
              {settings?.brand?.welcomeMessage || "Experience expert treatments in a relaxing atmosphere. We specialize in bringing out your best self with personalized care and modern techniques."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
               <button
                  onClick={() => navigate('/book')}
                  className="px-10 py-4 rounded-full text-white font-medium text-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: buttonColor }}
               >
                  Book Appointment <ArrowRight size={20} />
               </button>
               <button
                  onClick={() => navigate('/services')}
                  className="px-10 py-4 rounded-full bg-white text-stone-800 font-medium text-lg border border-stone-300 hover:bg-stone-50 transition-colors"
               >
                  View Services
               </button>
            </div>
          </div>
          <div className="lg:w-1/2 relative">
             <div className="absolute inset-0 -m-8 bg-stone-200/50 rounded-full blur-[80px]"></div>
             <img 
               referrerPolicy="no-referrer"
               src="https://images.unsplash.com/photo-1544161515-4ab6ce6db874?auto=format&fit=crop&q=80&w=1200" 
               alt="Luxury Spa" 
               className="relative rounded-[200px] rounded-bl-[40px] rounded-tr-[40px] w-full aspect-[4/5] object-cover shadow-2xl"
             />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
         <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="text-center max-w-3xl mx-auto mb-20">
               <h2 className="text-4xl font-serif text-[#1a1a1a] mb-4">The Experience</h2>
               <div className="w-16 h-[1px] bg-stone-300 mx-auto my-6"></div>
               <p className="text-stone-500 text-lg font-light leading-relaxed">We pride ourselves on delivering exceptional results with a focus on your comfort and specific needs.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-x-12 gap-y-16">
               {[
                  { icon: <Star size={24} strokeWidth={1.5} />, title: "Expert Professionals", desc: "Our team consists of highly trained specialists dedicated to their craft." },
                  { icon: <Clock size={24} strokeWidth={1.5} />, title: "Time Respected", desc: "We know your time is valuable. Our scheduling ensures minimal waiting." },
                  { icon: <CheckCircle size={24} strokeWidth={1.5} />, title: "Premium Quality", desc: "We use only the highest quality products and state-of-the-art equipment." }
               ].map((feature, i) => (
                  <div key={i} className="flex flex-col items-center text-center">
                     <div className="p-5 rounded-full mb-8 shrink-0 bg-stone-50 border border-stone-100" style={{ color: themeColor }}>
                        {feature.icon}
                     </div>
                     <h3 className="text-2xl font-serif text-[#1a1a1a] mb-4">{feature.title}</h3>
                     <p className="text-stone-500 font-light leading-relaxed">{feature.desc}</p>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* Gallery Section */}
      <section className="py-24 bg-[#f8f7f5] border-t border-stone-200">
         <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
               <div className="max-w-2xl">
                  <h2 className="text-4xl font-serif text-[#1a1a1a] mb-4">Our Environment</h2>
                  <p className="text-stone-500 text-lg font-light">A glimpse into our relaxing and professional environment.</p>
               </div>
               <button 
                  onClick={() => navigate('/services')}
                  className="font-medium text-stone-900 border-b border-stone-900 pb-1 hover:text-stone-600 hover:border-stone-600 transition-colors"
               >
                  Explore Services
               </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
               <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&q=80&w=800" alt="Salon interior" className="w-full aspect-square object-cover rounded-[40px] shadow-sm hover:opacity-90 transition-opacity" />
               <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=800" alt="Spa treatment" className="w-full aspect-square object-cover rounded-3xl shadow-sm hover:opacity-90 transition-opacity" />
               <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?auto=format&fit=crop&q=80&w=800" alt="Hair styling" className="w-full aspect-square object-cover rounded-[100px] rounded-tl-[20px] rounded-br-[20px] shadow-sm hover:opacity-90 transition-opacity" />
               <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?auto=format&fit=crop&q=80&w=800" alt="Esthetician" className="w-full aspect-[2/1] md:col-span-2 lg:col-span-3 object-cover rounded-full shadow-sm hover:opacity-90 transition-opacity" />
            </div>
         </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-[#1a1a1a] text-white">
         <div className="max-w-4xl mx-auto px-6 sm:px-8 text-center">
            <h2 className="text-4xl sm:text-6xl font-serif mb-8 text-stone-100">Ready to refresh your look?</h2>
            <p className="text-stone-400 text-xl mb-12 max-w-2xl mx-auto font-light">Book your appointment today and let our specialists take care of the rest.</p>
            <button
               onClick={() => navigate('/book')}
               className="px-12 py-5 rounded-full text-[#1a1a1a] font-medium text-lg hover:scale-105 transition-transform bg-white"
            >
               Schedule Now
            </button>
         </div>
      </section>
    </div>
  );
}
