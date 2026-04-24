import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { BusinessSettings } from '../../types';
import { mergeWithDefaultSettings, defaultSettings } from '../../lib/settingsDefaults';
import { MapPin, Phone, Mail, Clock, MessageCircle } from 'lucide-react';

export default function Contact() {
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

  return (
    <div className="bg-white pb-20 flex-1">
      {/* Header */}
      <div className="relative bg-slate-900 py-24 text-center px-4 overflow-hidden">
         <div className="absolute inset-0 z-0 opacity-40">
            <img src="https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&q=80&w=1600" alt="Salon Tools Background" className="w-full h-full object-cover" />
         </div>
         <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-md">Contact Us</h1>
            <p className="text-slate-200 max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed drop-shadow">
               We'd love to hear from you. Get in touch with us for any inquiries, or visit us during our working hours.
            </p>
         </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
         <div className="grid md:grid-cols-2 gap-12 lg:gap-20">
            {/* Contact Information */}
            <div className="space-y-10">
               <div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Get in Touch</h3>
                  
                  <div className="space-y-6">
                     {settings?.businessAddress && (
                        <div className="flex items-start gap-4">
                           <div className="p-3 bg-slate-50 rounded-xl text-indigo-600 shrink-0" style={{ color: themeColor }}>
                              <MapPin size={24} />
                           </div>
                           <div>
                              <h4 className="font-bold text-slate-900">Address</h4>
                              <p className="text-slate-500 leading-relaxed mt-1">{settings.businessAddress}</p>
                           </div>
                        </div>
                     )}
                     
                     <div className="flex items-start gap-4">
                        <div className="p-3 bg-slate-50 rounded-xl text-indigo-600 shrink-0" style={{ color: themeColor }}>
                           <Phone size={24} />
                        </div>
                        <div>
                           <h4 className="font-bold text-slate-900">Phone</h4>
                           <p className="text-slate-500 leading-relaxed mt-1">
                              {settings?.whatsappNumber ? (
                                 <a href={`tel:${settings.whatsappNumber}`} className="hover:underline">{settings.whatsappNumber}</a>
                              ) : "+1 (555) 000-0000"}
                           </p>
                        </div>
                     </div>

                     <div className="flex items-start gap-4">
                        <div className="p-3 bg-slate-50 rounded-xl text-indigo-600 shrink-0" style={{ color: themeColor }}>
                           <Mail size={24} />
                        </div>
                        <div>
                           <h4 className="font-bold text-slate-900">Email</h4>
                           <p className="text-slate-500 leading-relaxed mt-1">
                              {settings?.businessEmail ? (
                                 <a href={`mailto:${settings.businessEmail}`} className="hover:underline">{settings.businessEmail}</a>
                              ) : "hello@example.com"}
                           </p>
                        </div>
                     </div>
                  </div>
               </div>

               <div>
                 <h3 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
                    <Clock size={24} style={{ color: themeColor }} />
                    Business Hours
                  </h3>
                 <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    <ul className="space-y-3">
                       {['0','1','2','3','4','5','6'].map((dayStr) => {
                          const info = settings?.hours[dayStr];
                          if (!info) return null;
                          const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                          const isClosed = info.isClosed;
                          
                          return (
                             <li key={dayStr} className="flex justify-between items-center text-sm">
                                <span className="font-bold text-slate-700">{dayNames[parseInt(dayStr)]}</span>
                                <span className={isClosed ? "text-slate-400 font-medium" : "text-slate-600"}>
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
            <div className="bg-slate-50 rounded-3xl p-8 border border-slate-100 h-fit">
               <h3 className="text-2xl font-bold text-slate-900 mb-2">Connect Instantly</h3>
               <p className="text-slate-500 mb-8 leading-relaxed">
                  Have a quick question? The fastest way to reach us is usually through WhatsApp.
               </p>
               
               {settings?.whatsappNumber && (
                  <a 
                     href={`https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, '')}`}
                     target="_blank"
                     rel="noreferrer"
                     className="w-full flex items-center justify-center gap-3 bg-[#25D366] text-white py-4 rounded-xl font-bold shadow-md hover:bg-[#22bf5b] transition-colors"
                  >
                     <MessageCircle size={20} />
                     Message on WhatsApp
                  </a>
               )}

               <div className="mt-8 pt-8 border-t border-slate-200">
                  <h4 className="font-bold text-slate-900 mb-4">Ready for your treatment?</h4>
                  <a
                     href="/book"
                     className="w-full block text-center py-4 rounded-xl text-white font-bold shadow-md transition-opacity hover:opacity-90"
                     style={{ backgroundColor: settings?.brand?.buttonColor || themeColor }}
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
