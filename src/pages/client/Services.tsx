import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Service, BusinessSettings } from '../../types';
import { mergeWithDefaultSettings, defaultSettings } from '../../lib/settingsDefaults';
import { Clock } from 'lucide-react';

export default function Services() {
  const navigate = useNavigate();
  const [services, setServices] = useState<Service[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [servicesSnapshot, settingsDoc] = await Promise.all([
          getDocs(query(collection(db, 'services'), where('isActive', '==', true))),
          getDocs(query(collection(db, 'settings'), where('__name__', '==', 'general')))
        ]);

        setServices(servicesSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Service)));
         
        if (!settingsDoc.empty) {
          setSettings(mergeWithDefaultSettings(settingsDoc.docs[0].data() as Partial<BusinessSettings>));
        } else {
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBookService = (serviceId: string) => {
     // In a fully integrated flow, this would pre-select the service.
     // For now, adhering strictly to the constraint of NOT breaking backend/booking logic,
     // we route to the existing booking page which expects a clean start.
     navigate('/book');
  };

  return (
    <div className="bg-white pb-20">
      {/* Header */}
      <div className="relative bg-slate-900 py-24 text-center px-4 overflow-hidden">
         <div className="absolute inset-0 z-0 opacity-40">
            <img src="https://images.unsplash.com/photo-1521590832167-7bfcfaa6362f?auto=format&fit=crop&q=80&w=1600" alt="Salon background" className="w-full h-full object-cover" />
         </div>
         <div className="relative z-10">
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-md">Our Services</h1>
            <p className="text-slate-200 max-w-2xl mx-auto text-lg sm:text-xl leading-relaxed drop-shadow">
               Discover our range of professional treatments tailored to your needs. 
               Select a service below to schedule your appointment.
            </p>
         </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-slate-100 h-48 rounded-2xl"></div>
            ))}
          </div>
        ) : services.length > 0 ? (
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map(service => (
                <div key={service.id} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex justify-between items-start mb-4 gap-4">
                     <h3 className="font-bold text-xl text-slate-900 leading-tight">{service.title}</h3>
                     <span className="font-bold text-slate-900 bg-slate-50 px-3 py-1 rounded-lg shrink-0">
                        ₦{service.price.toLocaleString()}
                     </span>
                  </div>
                  {service.description && (
                     <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">{service.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                     <div className="flex items-center gap-2 text-sm font-semibold text-slate-500 uppercase tracking-wider">
                        <Clock size={16} />
                        <span>{service.durationMinutes} min</span>
                     </div>
                     <button
                        onClick={() => handleBookService(service.id)}
                        className="text-sm font-bold text-white px-5 py-2.5 rounded-lg transition-colors opacity-90 hover:opacity-100"
                        style={{ backgroundColor: settings?.brand?.buttonColor || settings?.brand?.themeColor || '#4f46e5' }}
                     >
                        Book Now
                     </button>
                  </div>
                </div>
              ))}
           </div>
        ) : (
           <div className="text-center py-20 text-slate-500 bg-slate-50 rounded-2xl border border-dashed border-slate-300">
             No services are currently available. Check back soon!
           </div>
        )}
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto px-4 py-12 border-t border-slate-100">
         <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Frequently Asked Questions</h2>
         <div className="space-y-6">
            <div>
               <h4 className="font-bold text-slate-900 text-lg">Do I need to book in advance?</h4>
               <p className="text-slate-500 mt-2">While we accept walk-ins if there's availability, we highly recommend booking in advance to secure your preferred time slots.</p>
            </div>
            <div>
               <h4 className="font-bold text-slate-900 text-lg">What is your cancellation policy?</h4>
               <p className="text-slate-500 mt-2">{settings?.payments?.refundPolicy || "Appointments can be rescheduled or cancelled up to 24 hours in advance without penalty."}</p>
            </div>
            <div>
               <h4 className="font-bold text-slate-900 text-lg">Can I choose my specific stylist/provider?</h4>
               <p className="text-slate-500 mt-2">Yes! During the booking process, you will have the option to select a specific staff member or choose "Any Provider" for maximum flexibility.</p>
            </div>
         </div>
      </div>
    </div>
  );
}
