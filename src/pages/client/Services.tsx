import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Service, BusinessSettings } from '../../types';
import { Clock } from 'lucide-react';

export default function Services() {
  const navigate = useNavigate();
  const { settings } = useOutletContext<{ settings: BusinessSettings | null }>();
  const [services, setServices] = useState<Service[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const servicesSnapshot = await getDocs(collection(db, 'services'));
        const allServices = servicesSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Service));
        // Filter active services, treating undefined as active for backwards compatibility
        setServices(allServices.filter(s => s.isActive !== false));
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleBookService = (serviceId: string) => {
     navigate('/book');
  };

  return (
    <div className="bg-[#f8f7f5] pb-20 selection:bg-stone-200 flex-1">
      {/* Header */}
      <div className="relative py-32 text-center px-4 overflow-hidden border-b border-stone-200 bg-[#fefdfb]">
         <div className="absolute inset-0 z-0 opacity-20 filter grayscale">
            <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1521590832167-7bfcfaa6362f?auto=format&fit=crop&q=80&w=1600" alt="Salon background" className="w-full h-full object-cover" />
         </div>
         <div className="relative z-10 max-w-3xl mx-auto">
            <h1 className="text-5xl sm:text-6xl font-serif text-[#1a1a1a] mb-6 tracking-tight drop-shadow-sm">Our Services</h1>
            <p className="text-stone-500 max-w-2xl mx-auto text-lg leading-relaxed font-light">
               Discover our range of professional treatments tailored to your needs. 
               Select a service below to schedule your appointment.
            </p>
         </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 sm:px-8 lg:px-12 py-20">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="bg-stone-100 h-64 rounded-3xl animate-pulse"></div>
            ))}
          </div>
        ) : services.length > 0 ? (
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
              {services.map(service => (
                <div key={service.id} className="bg-white rounded-3xl p-8 shadow-sm hover:shadow-xl transition-shadow flex flex-col group border border-stone-100">
                  <div className="flex justify-between items-start mb-6 gap-4">
                     <h3 className="font-serif text-2xl text-[#1a1a1a] leading-tight">{service.title}</h3>
                     <span className="font-medium text-stone-600 bg-stone-50 px-4 py-2 rounded-full shrink-0 text-sm border border-stone-200">
                        ₦{service.price.toLocaleString()}
                     </span>
                  </div>
                  {service.description && (
                     <p className="text-stone-500 font-light leading-relaxed mb-10 flex-grow">{service.description}</p>
                  )}
                  <div className="flex items-center justify-between mt-auto pt-6 border-t border-stone-100">
                     <div className="flex items-center gap-2 text-xs font-semibold text-stone-400 uppercase tracking-widest">
                        <Clock size={14} />
                        <span>{service.durationMinutes} min</span>
                     </div>
                     <button
                        onClick={() => handleBookService(service.id)}
                        className="text-sm font-medium text-white px-6 py-3 rounded-full transition-all bg-[#2a2626] hover:bg-black hover:-translate-y-0.5"
                     >
                        Book Now
                     </button>
                  </div>
                </div>
              ))}
           </div>
        ) : (
           <div className="text-center py-24 text-stone-500 bg-white rounded-3xl border border-dashed border-stone-300">
             <p className="text-xl font-light">No services are currently available. Check back soon!</p>
           </div>
        )}

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto pt-16 border-t border-stone-200">
           <div className="text-center mb-16">
             <h2 className="text-4xl font-serif text-[#1a1a1a] mb-6">Frequently Asked Questions</h2>
             <div className="w-16 h-[1px] bg-stone-300 mx-auto"></div>
           </div>
           
           <div className="space-y-10">
              {[
                  { q: "Do I need to book in advance?", a: "While we accept walk-ins if there's availability, we highly recommend booking in advance to secure your preferred time slots." },
                  { q: "What is your cancellation policy?", a: settings?.payments?.refundPolicy || "Appointments can be rescheduled or cancelled up to 24 hours in advance without penalty." },
                  { q: "Can I choose my specific stylist/provider?", a: "Yes! During the booking process, you will have the option to select a specific staff member or choose 'Any Provider' for maximum flexibility." }
              ].map((faq, idx) => (
                <div key={idx} className="bg-white p-8 rounded-[32px] shadow-sm border border-stone-100">
                   <h4 className="font-serif text-[#1a1a1a] text-xl mb-3">{faq.q}</h4>
                   <p className="text-stone-500 font-light leading-relaxed">{faq.a}</p>
                </div>
              ))}
           </div>
        </div>
      </div>
    </div>
  );
}
