import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, updateDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Booking } from '../../types';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';

export default function ManageBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [servicesMap, setServicesMap] = useState<Record<string, {title: string, price: number}>>({});
  const [staffMap, setStaffMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [bookingsSnap, servicesSnap, staffSnap] = await Promise.all([
        getDocs(query(collection(db, 'bookings'))),
        getDocs(collection(db, 'services')),
        getDocs(collection(db, 'staff'))
      ]);

      const allBookings = bookingsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Booking));
      // Sort in memory: Newest created bookings first, fallback to date
      allBookings.sort((a, b) => {
         const aCreated = a.createdAt?.seconds || 0;
         const bCreated = b.createdAt?.seconds || 0;
         if (bCreated !== aCreated) return bCreated - aCreated;
         const dateDiff = (b.date || '').localeCompare(a.date || '');
         if (dateDiff === 0) return (b.startTime || '').localeCompare(a.startTime || '');
         return dateDiff;
      });
      setBookings(allBookings);
      
      const sMap: Record<string, {title: string, price: number}> = {};
      servicesSnap.docs.forEach(d => { 
        sMap[d.id] = {
          title: d.data().title,
          price: d.data().price || 0
        }; 
      });
      setServicesMap(sMap);

      const stMap: Record<string, string> = {};
      staffSnap.docs.forEach(d => { stMap[d.id] = d.data().name; });
      setStaffMap(stMap);
      
    } catch (error) {
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const setStatus = async (id: string, status: Booking['status']) => {
    try {
      const updateData: Partial<Booking> = { status };
      if (status === 'cancelled') updateData.cancelledBy = 'admin';

      await updateDoc(doc(db, 'bookings', id), updateData);
      setBookings(bookings.map(b => b.id === id ? { ...b, ...updateData } : b));
      toast.success(`Booking marked as ${status}`);
    } catch (err) {
       toast.error("Failed to update status");
    }
  };

  return (
    <div className="flex flex-col h-full space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">All Bookings</h2>
          <p className="text-slate-500">View and manage all client appointments.</p>
        </div>
      </header>

      {loading ? (
        <p className="text-slate-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Client / Date</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Service Ref</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                <th className="p-4 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {bookings.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">No bookings found</td>
                </tr>
              )}
              {bookings.map(booking => (
                <tr key={booking.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="p-4 whitespace-nowrap">
                    <div className="font-bold text-slate-800 text-sm">{booking.clientName}</div>
                    <div className="text-xs text-slate-500 mt-1">{booking.clientPhone}</div>
                    <div className="text-[11px] font-medium text-slate-400 mt-0.5">{format(parseISO(booking.date), 'MMM d, yyyy')} at {booking.startTime}</div>
                  </td>
                  <td className="p-4 text-xs text-slate-500">
                    <span className="font-bold text-slate-800">{servicesMap[booking.serviceId]?.title || 'Unknown Service'}</span>
                    <br />
                    <span className="text-slate-400">with {staffMap[booking.staffId] || 'Unknown Staff'}</span>
                    <br />
                    {booking.status !== 'paid' && booking.status !== 'lost' && booking.status !== 'cancelled' ? (
                       <button 
                           onClick={() => setStatus(booking.id!, 'paid')} 
                           className="mt-1.5 inline-flex items-center gap-1.5 px-2 py-1 bg-slate-100 hover:bg-emerald-100 text-slate-600 hover:text-emerald-700 rounded-md transition-all shadow-sm active:scale-95"
                           title="Click to mark as paid"
                       >
                         <span className="font-bold">₦{(booking.price || servicesMap[booking.serviceId]?.price || 0).toLocaleString()}</span>
                         <span className="text-[9px] uppercase tracking-wider font-bold opacity-80">(Mark Paid)</span>
                       </button>
                    ) : (
                       <div className={`mt-1.5 inline-flex items-center gap-1.5 px-2 py-1 rounded-md shadow-sm border ${
                         booking.status === 'paid' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 
                         'bg-slate-50 text-slate-500 border-slate-100'
                       }`}>
                         <span className="font-bold border-r pr-1.5 border-current border-opacity-20">₦{(booking.price || servicesMap[booking.serviceId]?.price || 0).toLocaleString()}</span>
                         <span className="text-[9px] uppercase tracking-wider font-bold">
                           {booking.status === 'paid' ? 'Paid' : booking.status === 'lost' ? 'Lost' : 'Cancelled'}
                         </span>
                       </div>
                    )}
                  </td>
                  <td className="p-4">
                    <div className="flex flex-col items-start gap-1">
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
                      {booking.status === 'cancelled' && booking.cancelledBy && (
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">(By {booking.cancelledBy})</span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 text-right space-x-3">
                    {(booking.status === 'pending' || booking.status === 'confirmed') ? (
                       <>
                         <button onClick={() => setStatus(booking.id!, 'paid')} className="text-xs text-emerald-600 font-bold hover:underline">Mark Paid</button>
                         <button onClick={() => setStatus(booking.id!, 'lost')} className="text-xs text-rose-600 font-bold hover:underline">Mark Lost</button>
                         <button onClick={() => setStatus(booking.id!, 'cancelled')} className="text-xs text-slate-500 font-bold hover:underline">Cancel</button>
                       </>
                    ) : (
                       <button onClick={() => setStatus(booking.id!, 'pending')} className="text-xs text-slate-400 font-bold hover:text-slate-600 hover:underline">Undo Status</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </div>
  );
}
