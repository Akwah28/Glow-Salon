import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { BusinessSettings } from '../../types';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';

export default function Contact() {
  const { settings } = useOutletContext<{ settings: BusinessSettings | null }>();

  const themeColor = settings?.brand?.themeColor || '#6c5c47';

  return (
    <div className="bg-[#f8f7f5] pb-20 flex-1 selection:bg-stone-200">
      {/* Header */}
      <div className="relative py-32 text-center px-4 overflow-hidden border-b border-stone-200 bg-stone-50">
         <div className="absolute inset-0 z-0 opacity-40">
            <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&q=80&w=1600" alt="Spa and Salon Background" className="w-full h-full object-cover" />
         </div>
         <div className="absolute inset-0 z-0 bg-gradient-to-t from-stone-50 via-stone-50/60 to-transparent"></div>
         <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-serif text-[#1a1a1a] mb-6 tracking-tight drop-shadow-sm">Contact Us</h1>
            <p className="text-stone-500 max-w-2xl mx-auto text-lg leading-relaxed font-light">
               We'd love to hear from you. Get in touch with us for any inquiries, or visit us during our working hours.
            </p>
         </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
         <div className="grid md:grid-cols-2 gap-16 lg:gap-24">
            {/* Contact Information */}
            <div className="space-y-16">
               <div>
                  <h3 className="text-3xl font-serif text-[#1a1a1a] mb-8">Get in Touch</h3>
                  
                  <div className="space-y-8">
                     {settings?.address && (
                        <div className="flex items-start gap-4">
                           <div className="p-4 bg-white rounded-2xl shrink-0 border border-stone-100 shadow-sm text-stone-700">
                              <MapPin size={24} strokeWidth={1.5} />
                           </div>
                           <div>
                              <h4 className="font-serif text-[#1a1a1a] text-xl mb-1">Address</h4>
                              <p className="text-stone-500 leading-relaxed font-light">{settings.address}</p>
                           </div>
                        </div>
                     )}
                     
                     <div className="flex items-start gap-4">
                        <div className="p-4 bg-white rounded-2xl shrink-0 border border-stone-100 shadow-sm text-stone-700">
                           <Phone size={24} strokeWidth={1.5} />
                        </div>
                        <div>
                           <h4 className="font-serif text-[#1a1a1a] text-xl mb-1">Phone</h4>
                           <p className="text-stone-500 leading-relaxed font-light">
                              {settings?.whatsappNumber ? (
                                 <a href={`tel:${settings.whatsappNumber}`} className="hover:text-stone-800 transition-colors">{settings.whatsappNumber}</a>
                              ) : "+1 (555) 000-0000"}
                           </p>
                        </div>
                     </div>

                     <div className="flex items-start gap-4">
                        <div className="p-4 bg-white rounded-2xl shrink-0 border border-stone-100 shadow-sm text-stone-700">
                           <Mail size={24} strokeWidth={1.5} />
                        </div>
                        <div>
                           <h4 className="font-serif text-[#1a1a1a] text-xl mb-1">Email</h4>
                           <p className="text-stone-500 leading-relaxed font-light">
                              {settings?.businessEmail ? (
                                 <a href={`mailto:${settings.businessEmail}`} className="hover:text-stone-800 transition-colors">{settings.businessEmail}</a>
                              ) : "hello@example.com"}
                           </p>
                        </div>
                     </div>
                  </div>
               </div>

               <div>
                 <h3 className="text-3xl font-serif text-[#1a1a1a] mb-8 flex items-center gap-3">
                    <Clock size={28} className="text-stone-400 font-light" />
                    Business Hours
                  </h3>
                 <div className="bg-white p-8 rounded-[32px] border border-stone-100 shadow-sm">
                    <ul className="space-y-4">
                       {['0','1','2','3','4','5','6'].map((dayStr) => {
                          const info = settings?.hours[dayStr];
                          if (!info) return null;
                          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                          const isClosed = info.isClosed;
                          
                          return (
                             <li key={dayStr} className="flex justify-between items-center text-[15px] pb-4 border-b border-stone-50 last:border-0 last:pb-0">
                                <span className="font-serif text-lg text-stone-800">{dayNames[parseInt(dayStr)]}</span>
                                <span className={isClosed ? "text-stone-400 font-light" : "text-stone-600 font-medium tracking-wide"}>
                                   {isClosed ? "Closed" : `${info.open} - ${info.close}`}
                                </span>
                             </li>
                          );
                       })}
                    </ul>
                 </div>
               </div>
            </div>

            {/* Optional Small Form / Connect Section */}
            <div className="bg-white rounded-[40px] p-10 border border-stone-100 shadow-sm h-fit">
               <h3 className="text-3xl font-serif text-[#1a1a1a] mb-4">Connect Instantly</h3>
               <p className="text-stone-500 mb-10 leading-relaxed font-light">
                  Have a quick question? The fastest way to reach us is usually through WhatsApp.
               </p>
               
               {settings?.whatsappNumber && (
                  <a 
                     href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                     target="_blank"
                     rel="noreferrer"
                     className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white py-5 rounded-full font-medium shadow hover:bg-[#22bf5b] transition-all hover:-translate-y-0.5 mb-8"
                  >
                     <MessageCircle size={22} />
                     Message on WhatsApp
                  </a>
               )}

               <div className="pt-8 border-t border-stone-100">
                  <h4 className="font-serif text-[#1a1a1a] text-xl mb-6">Ready for your treatment?</h4>
                  <a
                     href="/book"
                     className="w-full block text-center py-5 rounded-full text-white font-medium shadow-md transition-all hover:-translate-y-0.5 bg-[#2a2626] hover:bg-black"
                  >
                     Book an Appointment
                  </a>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
}
