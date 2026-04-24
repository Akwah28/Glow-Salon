import React, { useState } from 'react';
import { collection, query, where, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Booking, Service, Staff } from '../../types';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { ChevronLeft, Search, Copy, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const WALLET_DETAILS = {
  bank: "Zenith Bank",
  name: "Salon Studio",
  account: "1234567890"
};

const WHATSAPP_NUMBER = "2340000000000"; // Admin's WhatsApp

export default function MyBookings() {
  const navigate = useNavigate();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [servicesMap, setServicesMap] = useState<Record<string, string>>({});
  const [staffMap, setStaffMap] = useState<Record<string, string>>({});

  const [payingBookingId, setPayingBookingId] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return;
    
    setLoading(true);
    setHasSearched(true);
    setPayingBookingId(null);
    try {
      // Fetch bookings, services, and staff
      const bookingsQ = query(
        collection(db, 'bookings'), 
        where('clientPhone', '==', phoneNumber)
      );
      
      const [bookingsSnap, servicesSnap, staffSnap] = await Promise.all([
        getDocs(bookingsQ),
        getDocs(collection(db, 'services')),
        getDocs(collection(db, 'staff'))
      ]);

      const sortedBookings = bookingsSnap.docs
        .map(d => ({ id: d.id, ...d.data() } as Booking))
        .sort((a, b) => {
           const aCreated = a.createdAt?.seconds || 0;
           const bCreated = b.createdAt?.seconds || 0;
           if (bCreated !== aCreated) return bCreated - aCreated;
           const dDiff = (b.date || '').localeCompare(a.date || '');
           if (dDiff !== 0) return dDiff;
           return (b.startTime || '').localeCompare(a.startTime || '');
        });

      setBookings(sortedBookings);
      
      const sMap: Record<string, string> = {};
      servicesSnap.docs.forEach(d => { 
        sMap[d.id] = d.data().title; 
      });
      setServicesMap(sMap);

      const stMap: Record<string, string> = {};
      staffSnap.docs.forEach(d => { 
        stMap[d.id] = d.data().name; 
      });
      setStaffMap(stMap);

    } catch (error) {
      console.error(error);
      toast.error("Failed to load your bookings. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    const confirmCancel = window.confirm("Are you sure you want to cancel this booking?");
    if (!confirmCancel) return;

    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'cancelled',
        cancelledBy: 'client'
      });
      
      setBookings(bookings.map(b => b.id === bookingId ? { ...b, status: 'cancelled', cancelledBy: 'client' } : b));
      toast.success("Booking cancelled successfully.");
    } catch (error) {
      console.error(error);
      toast.error("Could not cancel booking. Please call the salon.");
    }
  };

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(WALLET_DETAILS.account);
    toast.success("Account number copied!");
  };

  const handleWhatsAppRedirect = (booking: Booking) => {
    const text = `Hello! I just made a payment for my booking.
Name: ${booking.clientName}
Date: ${booking.date} at ${booking.startTime}
Please find my receipt attached.`;
      
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-slate-50 flex flex-col flex-1 py-12">
      <div className="max-w-md w-full mx-auto shadow-xl rounded-2xl overflow-hidden bg-white relative font-sans text-slate-800 border border-slate-100">
        <header className="bg-white border-b border-slate-100 sticky top-0 z-10 px-6 py-5 flex items-center justify-between">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-lg hover:bg-slate-50 text-slate-500 transition-colors">
            <ChevronLeft size={20} className="stroke-[2.5]" />
          </button>
          <div className="font-bold text-slate-800 tracking-tight text-lg">My Bookings</div>
          <div className="w-10"></div> 
        </header>

        <div className="p-6 flex-1 bg-slate-50">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
          <p className="text-sm text-slate-500 mb-4 font-medium">Enter the phone number you used to book your appointments.</p>
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">Phone Number</label>
              <input
                type="tel"
                required
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white transition-all font-medium text-slate-900"
                placeholder="0803 000 0000"
              />
            </div>
            <button
               type="submit"
               disabled={loading}
               className="w-full bg-indigo-600 text-white rounded-lg py-2.5 text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {loading ? 'Searching...' : <><Search size={16} /> Find Bookings</>}
            </button>
          </form>
        </div>

        {hasSearched && !loading && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 tracking-tight">Your History</h3>
            
            {bookings.length === 0 ? (
               <div className="p-8 text-center text-slate-500 bg-white border border-slate-200 rounded-xl shadow-sm">
                 <p className="text-sm font-medium">No bookings found for this number.</p>
               </div>
            ) : (
              bookings.map(booking => (
                <div key={booking.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-900">{servicesMap[booking.serviceId] || 'Service'}</h4>
                      <p className="text-xs text-slate-500 font-medium tracking-wide uppercase mt-1">with {staffMap[booking.staffId] || 'Staff'}</p>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${
                      booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-800' :
                      booking.status === 'paid' ? 'bg-indigo-100 text-indigo-800' :
                      booking.status === 'lost' ? 'bg-rose-100 text-rose-800' :
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'completed' ? 'bg-indigo-100 text-indigo-800' :
                      booking.status === 'no-show' ? 'bg-purple-100 text-purple-800' :
                      'bg-rose-100 text-rose-800'
                    }`}>
                      {booking.status}
                    </span>
                  </div>
                  
                  <div className="p-3 bg-slate-50 rounded-lg text-sm border border-slate-100">
                    <p className="font-semibold text-slate-800">{format(parseISO(booking.date), 'EEEE, MMMM d, yyyy')}</p>
                    <p className="text-slate-500 mt-0.5">{booking.startTime}</p>
                  </div>

                  {(booking.status === 'pending' || booking.status === 'confirmed') && (
                    <div className="pt-2 flex flex-col gap-2">
                       {payingBookingId !== booking.id ? (
                         <>
                           <button 
                             onClick={() => setPayingBookingId(booking.id!)}
                             className="text-sm font-bold text-white w-full text-center py-2.5 bg-indigo-600 rounded-lg transition-colors hover:bg-indigo-700 shadow-sm"
                           >
                             Pay Now
                           </button>
                           <button 
                             onClick={() => handleCancelBooking(booking.id!)}
                             className="text-sm font-bold text-rose-600 hover:text-rose-700 w-full text-center py-2.5 border border-rose-100 bg-rose-50 rounded-lg transition-colors hover:bg-rose-100"
                           >
                             Cancel Booking
                           </button>
                         </>
                       ) : (
                         <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200 mt-2">
                           <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl text-left space-y-3">
                             <p className="text-xs text-indigo-700 font-bold uppercase tracking-wider mb-2">Our Bank Details</p>
                             
                             <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-indigo-100">
                               <div>
                                  <p className="text-[10px] text-slate-500 uppercase font-bold">Bank</p>
                                  <p className="text-sm font-bold text-slate-900">{WALLET_DETAILS.bank}</p>
                               </div>
                             </div>
               
                              <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-indigo-100">
                               <div>
                                  <p className="text-[10px] text-slate-500 uppercase font-bold">Account Name</p>
                                  <p className="text-sm font-bold text-slate-900">{WALLET_DETAILS.name}</p>
                               </div>
                             </div>
               
                              <div className="flex justify-between items-center bg-white p-2.5 rounded-lg border border-indigo-100">
                               <div>
                                  <p className="text-[10px] text-slate-500 uppercase font-bold">Account Number</p>
                                  <p className="text-lg font-bold text-slate-900 tracking-widest">{WALLET_DETAILS.account}</p>
                               </div>
                               <button onClick={handleCopyAccount} className="p-2 bg-indigo-50 text-indigo-600 rounded-md hover:bg-indigo-100 transition-colors" title="Copy Account Number">
                                 <Copy size={16} />
                               </button>
                             </div>
                           </div>
               
                           <button
                              onClick={() => handleWhatsAppRedirect(booking)}
                              className="w-full bg-[#25D366] text-white rounded-lg py-3.5 text-sm font-bold shadow-sm hover:bg-[#20bd5a] transition-colors flex justify-center items-center gap-2"
                           >
                              <MessageCircle size={18} />
                              I have paid - Send Receipt
                           </button>
                           
                           <button onClick={() => setPayingBookingId(null)} className="text-xs w-full text-center font-bold text-slate-400 hover:text-slate-600 mt-2">Cancel Payment</button>
                         </div>
                       )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
      </div>
    </div>
  );
}
