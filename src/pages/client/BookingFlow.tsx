import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Clock, User as UserIcon } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Service, Staff, Booking, BusinessSettings } from '../../types';
import { mergeWithDefaultSettings, defaultSettings } from '../../lib/settingsDefaults';
import { format, isSameDay, parse, startOfToday, addDays, getDay } from 'date-fns';
import { DayPicker, Matcher } from 'react-day-picker';
import 'react-day-picker/dist/style.css';
import { toast } from 'sonner';
import emailjs from '@emailjs/browser';

type Step = 'service' | 'staff' | 'datetime' | 'details';

export default function BookingFlow() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('service');
  
  // Data
  const [services, setServices] = useState<Service[]>([]);
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([]);
  
  // Selections
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  
  // Details
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [servicesSnapshot, staffSnapshot, settingsDoc] = await Promise.all([
          getDocs(query(collection(db, 'services'), where('isActive', '==', true))),
          getDocs(query(collection(db, 'staff'), where('isActive', '==', true))),
          getDocs(query(collection(db, 'settings'), where('__name__', '==', 'general')))
        ]);

        setServices(servicesSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Service)));
        setStaffList(staffSnapshot.docs.map(d => ({ id: d.id, ...d.data() } as Staff)));
        if (!settingsDoc.empty) {
          setSettings(mergeWithDefaultSettings(settingsDoc.docs[0].data() as Partial<BusinessSettings>));
        } else {
          setSettings(defaultSettings);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error("Failed to load salon info.");
      } finally {
        setIsInitialLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  // Compute available time slots when date or staff changes
  useEffect(() => {
    const fetchAvailability = async () => {
      if (!selectedDate || !selectedService || !settings) return;

      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const dayOfWeek = getDay(selectedDate).toString(); // 0 (Sun) to 6 (Sat)
      
      const daySettings = settings.hours[dayOfWeek];
      if (!daySettings || daySettings.isClosed) {
        setAvailableTimeSlots([]);
        return;
      }
      
      const isDateHoliday = settings.holidays?.some(h => h.date === dateStr && h.isClosed);
      if (isDateHoliday) {
        setAvailableTimeSlots([]);
        return;
      }

      const parseTimeToMins = (ts?: string) => {
        if (!ts) return 0;
        const [h, m] = ts.split(':').map(Number);
        return (h || 0) * 60 + (m || 0);
      };

      const openTime = parseTimeToMins(daySettings.open);
      const closeTime = parseTimeToMins(daySettings.close);
      const interval = settings.bookingInterval || 30;
      const buffer = settings.bufferTimeMins || 0;
      
      const slots: string[] = [];
      for (let time = openTime; time < closeTime; time += interval) {
        if (time + selectedService.durationMinutes <= closeTime) {
          const hours = Math.floor(time / 60);
          const mins = time % 60;
          slots.push(`${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`);
        }
      }

      let existingBookings: Booking[] = [];
      try {
        const bookingsQ = query(
          collection(db, 'bookings'),
          where('date', '==', dateStr)
        );
        const bookingsSnapshot = await getDocs(bookingsQ);
        
        existingBookings = bookingsSnapshot.docs
          .map(d => d.data() as Booking)
          .filter(b => 
             ['pending', 'confirmed', 'paid'].includes(b.status || 'pending') &&
             (!selectedStaff || b.staffId === selectedStaff.id)
          );
      } catch (err) {
        console.error("Error fetching bookings:", err);
      }

      const filteredSlots = slots.filter(slot => {
        const slotStart = parseTimeToMins(slot);
        const slotEnd = slotStart + selectedService.durationMinutes + buffer;

        // Ensure lead times don't hide today's immediate slots
        if (isSameDay(selectedDate, new Date())) {
          const now = new Date();
          const leadMins = (settings.leadTimeHours || 0) * 60;
          const currentMins = now.getHours() * 60 + now.getMinutes() + leadMins;
          if (slotStart <= currentMins) return false;
        }

        // If specific staff selected, check just against their bookings
        if (selectedStaff) {
          for (const b of existingBookings) {
            const bStart = parseTimeToMins(b.startTime || '00:00');
            const bEnd = parseTimeToMins(b.endTime || '00:00') + buffer;
            if (slotStart < bEnd && slotEnd > bStart) {
              return false; // Conflict for this specific staff
            }
          }
          return true;
        } 
        
        // "Any Provider" selected - we must find at least ONE staff member who has no conflicts for this slot
        const availableStaff = staffList.find(staff => {
          const staffBookings = existingBookings.filter(b => b.staffId === staff.id);
          for (const b of staffBookings) {
            const bStart = parseTimeToMins(b.startTime || '00:00');
            const bEnd = parseTimeToMins(b.endTime || '00:00') + buffer;
            if (slotStart < bEnd && slotEnd > bStart) {
              return false; // This staff member has a conflict
            }
          }
          return true; // This staff member is completely free for this slot
        });

        // Slot is only available if at least one staff member is free
        return !!availableStaff;
      });
      setAvailableTimeSlots(filteredSlots);
    };
    
    fetchAvailability();
  }, [selectedDate, selectedService, selectedStaff, settings]);

  const parseTime = (timeStr?: string) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return (h || 0) * 60 + (m || 0);
  };

  const handleNext = (nextStep: Step) => {
    setCurrentStep(nextStep);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    if (currentStep === 'details') setCurrentStep('datetime');
    else if (currentStep === 'datetime') setCurrentStep('staff');
    else if (currentStep === 'staff') setCurrentStep('service');
    else navigate('/');
  };

  const calculateEndTime = (startStr: string, durationMin: number) => {
    const startMins = parseTime(startStr);
    const endMins = startMins + durationMin;
    const h = Math.floor(endMins / 60);
    const m = endMins % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedService || !selectedDate || !selectedTime || !name || !phone) return;
    
    setIsSubmitting(true);
    try {
      let finalStaff = selectedStaff;
      
      const dateStr = format(selectedDate, 'yyyy-MM-dd');
      const slotStart = parseTime(selectedTime);
      const buffer = settings?.bufferTimeMins || 0;
      const slotEnd = slotStart + selectedService.durationMinutes + buffer;

      // If "Any Provider", we need to figure out who is ACTUALLY free for this slot right now
      if (!finalStaff) {
         const bookingsQ = query(collection(db, 'bookings'), where('date', '==', dateStr));
         const bookingsSnapshot = await getDocs(bookingsQ);
         const existingBookings = bookingsSnapshot.docs
            .map(d => d.data() as Booking)
            .filter(b => ['pending', 'confirmed', 'paid'].includes(b.status || 'pending'));
            
         finalStaff = staffList.find(staff => {
           const staffBookings = existingBookings.filter(b => b.staffId === staff.id);
           for (const b of staffBookings) {
             const bStart = parseTime(b.startTime || '00:00');
             const bEnd = parseTime(b.endTime || '00:00') + buffer;
             if (slotStart < bEnd && slotEnd > bStart) {
               return false; // Conflict
             }
           }
           return true; 
         });
      }

      if (!finalStaff) {
        toast.error("Sorry, this time slot is no longer available. Please select another.");
        setIsSubmitting(false);
        return;
      }

      const newBooking: Partial<Booking> = {
        serviceId: selectedService.id,
        staffId: finalStaff.id,
        price: selectedService.price,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedTime,
        endTime: calculateEndTime(selectedTime, selectedService.durationMinutes),
        clientName: name,
        clientPhone: phone,
        clientEmail: email || "",
        status: 'pending'
      };

      await addDoc(collection(db, 'bookings'), {
        ...newBooking,
        createdAt: serverTimestamp()
      });

      // Try notifying via EmailJS
      try {
        // Generate Google Calendar Link
        const [h, m] = (selectedTime || '00:00').split(':').map(Number);
        const eventStart = new Date(selectedDate);
        eventStart.setHours(h, m, 0, 0);
        const eventEnd = new Date(eventStart.getTime() + (selectedService?.durationMinutes || 0) * 60000);

        const formatGCalDate = (date: Date) => date.toISOString().replace(/-|:|\.\d{3}/g, '');
        const gcalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Booking: ' + name + ' - ' + (selectedService?.title || ''))}&dates=${formatGCalDate(eventStart)}/${formatGCalDate(eventEnd)}&details=${encodeURIComponent('Phone: ' + phone + '\nEmail: ' + email + '\nMessage: ' + message + '\n\nAdd this to your calendar to keep track of the appointment!')}`;

        const templateParams = {
          name,
          email,
          phone,
          service: selectedService?.title || '',
          date: format(selectedDate, 'MMM d, yyyy'),
          time: selectedTime,
          message: message ? `${message}\n\n---\nOwner: Add to Google Calendar: ${gcalUrl}` : `Owner: Add to Google Calendar: ${gcalUrl}`,
          calendar_link: gcalUrl
        };

        // EmailJS credentials
        const SERVICE_ID = "service_mv3qd1m";
        const PUBLIC_KEY = "u5Ghpxgeqbtndic3H";
        const OWNER_TEMPLATE_ID = "template_ktx4nxr";
        const CLIENT_TEMPLATE_ID = "template_glyzo0m";

        // 1. Send email to owner/admin
        await emailjs.send(
          SERVICE_ID,
          OWNER_TEMPLATE_ID,
          templateParams,
          PUBLIC_KEY
        );

        // 2. Send confirmation to client (only if email provided)
        if (email) {
          await emailjs.send(
            SERVICE_ID,
            CLIENT_TEMPLATE_ID,
            templateParams,
            PUBLIC_KEY
          );
        }

        toast.success("Booking confirmed and emails sent successfully!");
      } catch (notifyErr: any) {
        console.error("Failed to send EmailJS notification:", notifyErr);
        if (notifyErr?.text) {
          console.error("EmailJS Error Response:", notifyErr.text);
        }
        
        toast.error(
          "Booking confirmed, but email notifications failed to send. " + 
          (notifyErr?.message || "There was a network error. You may need to disable Origin restrictions in your EmailJS dashboard or turn off ad-blockers.")
        );
      }

      navigate('/success', { state: { booking: newBooking } });
    } catch (error) {
      console.error(error);
      toast.error("Failed to submit booking. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-slate-50 flex flex-col flex-1 py-12">
      <div className="max-w-md w-full mx-auto shadow-xl rounded-2xl overflow-hidden bg-white relative font-sans text-slate-800 border border-slate-100">
        {/* Header */}
        <header className="bg-white border-b border-slate-100 sticky top-0 z-10 px-6 py-5 flex items-center justify-between">
          <button onClick={handleBack} className="p-2 -ml-2 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors">
            <ChevronLeft size={20} className="stroke-[2.5]" />
          </button>
          <div className="font-bold text-slate-800 tracking-tight text-lg">
          {currentStep === 'service' && "Select Service"}
          {currentStep === 'staff' && "Choose Provider"}
          {currentStep === 'datetime' && "Date & Time"}
          {currentStep === 'details' && "Your Details"}
        </div>
        <div className="w-10"></div> 
      </header>

      {/* Progress Bar */}
      <div className="w-full bg-slate-200 h-1">
        <div 
           className="bg-indigo-600 h-1 transition-all duration-300 ease-in-out" 
           style={{ 
             width: 
               currentStep === 'service' ? '25%' : 
               currentStep === 'staff' ? '50%' : 
               currentStep === 'datetime' ? '75%' : '100%' 
           }} 
        />
      </div>

      <div className="p-5 flex-1">
        {/* Step 1: Service */}
        {currentStep === 'service' && (
          <div className="space-y-3 mt-2">
            {isInitialLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="w-full bg-slate-200 h-24 rounded-xl"></div>
                ))}
              </div>
            ) : (
              <>
                {services.map(service => (
                  <button
                    key={service.id}
                    onClick={() => {
                      setSelectedService(service);
                      handleNext('staff');
                    }}
                    className={`w-full text-left p-5 rounded-xl border transition-all ${selectedService?.id === service.id ? 'bg-indigo-50 border-indigo-600 ring-1 ring-indigo-600 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{service.title}</h3>
                        <div className="flex items-center gap-2 mt-1.5 text-xs font-medium text-slate-500 uppercase tracking-wider">
                          <Clock size={12} />
                          <span>{service.durationMinutes} min</span>
                        </div>
                      </div>
                      <div className="font-bold text-slate-800">₦{service.price.toLocaleString()}</div>
                    </div>
                  </button>
                ))}
                {services.length === 0 && <p className="text-center font-medium text-slate-500 py-10">No services available</p>}
              </>
            )}
          </div>
        )}

        {/* Step 2: Staff */}
        {currentStep === 'staff' && (
          <div className="space-y-3 mt-2">
            <button
              onClick={() => {
                setSelectedStaff(null);
                handleNext('datetime');
              }}
              className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${selectedStaff === null ? 'bg-indigo-50 border-indigo-600 ring-1 ring-indigo-600 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${selectedStaff === null ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                <UserIcon size={16} />
              </div>
              <div className="text-left font-bold text-slate-900 text-sm">
                Any Provider
              </div>
            </button>
            
            <div className="my-6 border-b border-slate-200" />
            <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-3">Or choose someone specific</h4>
            
            {staffList.map(staff => (
              <button
                key={staff.id}
                onClick={() => {
                  setSelectedStaff(staff);
                  handleNext('datetime');
                }}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${selectedStaff?.id === staff.id ? 'bg-indigo-50 border-indigo-600 ring-1 ring-indigo-600 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300'}`}
              >
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${selectedStaff?.id === staff.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-800'}`}>
                   {staff.name.charAt(0).toUpperCase()}
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-900 text-sm">{staff.name}</div>
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">Specialist</div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 3: Date & Time */}
        {currentStep === 'datetime' && (
          <div className="mt-2 space-y-6">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-center">
              <DayPicker
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                fromDate={new Date()}
                toDate={settings ? addDays(new Date(), settings.maxAdvanceDays || 30) : undefined}
                disabled={(date) => {
                  if (!settings) return false;
                  // Disable if day of week is closed
                  const dayStr = getDay(date).toString();
                  if (settings.hours[dayStr]?.isClosed) return true;
                  // Disable if holiday
                  const dateStr = format(date, 'yyyy-MM-dd');
                  if (settings.holidays?.some(h => h.date === dateStr && h.isClosed)) return true;
                  return false;
                }}
                className="max-w-full"
                modifiersClassNames={{
                  selected: 'bg-indigo-600 text-white font-bold',
                  today: 'font-bold text-indigo-600'
                }}
                styles={{
                  selected: settings?.brand?.themeColor ? { backgroundColor: settings.brand.themeColor, color: 'white' } : undefined,
                }}
              />
            </div>
            
            <div>
              <h4 className="font-bold text-slate-800 mb-4 text-sm">Available Times</h4>
              {availableTimeSlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-3">
                  {availableTimeSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      style={selectedTime === time ? { backgroundColor: settings?.brand?.themeColor || '#4f46e5', borderColor: settings?.brand?.themeColor || '#4f46e5', color: '#fff' } : {}}
                      className={`py-2 rounded-lg border text-sm font-bold transition-colors shadow-sm ${selectedTime === time ? '' : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'}`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-sm font-medium text-slate-500 bg-white border border-slate-200 rounded-xl shadow-sm">
                   {settings ? "No times available on this date." : "Loading..."}
                </div>
              )}
            </div>

            {selectedTime && (
              <button 
                 onClick={() => handleNext('details')}
                 style={{ backgroundColor: settings?.brand?.buttonColor || '#4f46e5' }}
                 className="w-full text-white rounded-lg py-3 text-sm font-bold shadow-sm mt-6 transition-colors opacity-90 hover:opacity-100"
              >
                Continue
              </button>
            )}
          </div>
        )}

        {/* Step 4: Details */}
        {currentStep === 'details' && (
          <form id="booking-form" onSubmit={submitBooking} className="mt-2 space-y-5">
            <div className="space-y-4 bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Full Name <span className="text-rose-500">*</span></label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-medium text-slate-900"
                  placeholder="Jane Doe"
                />
              </div>
              
               <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Phone Number <span className="text-rose-500">*</span></label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-medium text-slate-900"
                  placeholder="0803 000 0000"
                />
              </div>

               <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Email Address <span className="text-slate-400 font-normal normal-case">(Optional)</span></label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-medium text-slate-900"
                  placeholder="jane@example.com"
                />
              </div>

               <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Message <span className="text-slate-400 font-normal normal-case">(Optional)</span></label>
                <textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-medium text-slate-900"
                  placeholder="Any special requests or details..."
                />
              </div>
            </div>

            <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl flex flex-col gap-1 text-sm shadow-sm">
              <div className="flex justify-between items-start text-indigo-900">
                <span className="font-bold">{selectedService?.title}</span>
                <span className="font-bold">₦{selectedService?.price.toLocaleString()}</span>
              </div>
              <div className="text-indigo-700/80 font-medium text-xs mt-1">
                 {selectedDate && format(selectedDate, 'MMM d, yyyy')} • {selectedTime}
              </div>
            </div>

            <button
               type="submit"
               disabled={isSubmitting}
               style={{ backgroundColor: settings?.brand?.buttonColor || '#4f46e5' }}
               className="w-full text-white rounded-lg py-3 text-sm font-bold shadow-sm mt-6 hover:opacity-90 transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isSubmitting ? 'Confirming...' : 'Confirm Appointment'}
            </button>
          </form>
        )}
      </div>
      </div>
    </div>
  );
}
