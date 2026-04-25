import React, { useEffect, useState } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Booking } from '../../types';
import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, isToday, parseISO, format, subDays } from 'date-fns';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area, CartesianGrid } from 'recharts';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'bookings'), (snapshot) => {
      setBookings(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking)));
      setLoading(false);
    }, (error) => {
      console.error(error);
      toast.error('Failed to load dashboard data');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
     return <div className="animate-pulse flex space-x-4 text-slate-500">Loading dashboard...</div>;
  }

  // Current scope
  const now = new Date();

  // Financial KPIs
  const profitsMade = bookings
    .filter(b => b.status === 'paid' || b.status === 'completed') // Legacy completion maps to paid mentally
    .reduce((sum, b) => sum + (b.price || 0), 0);
    
  const expectedRevenue = bookings
    .filter(b => b.status === 'pending' || b.status === 'confirmed')
    .reduce((sum, b) => sum + (b.price || 0), 0);

  // Generate 7 days of rolling data for charts
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const date = subDays(now, i);
    const dateStr = format(date, 'yyyy-MM-dd');
    
    // Leads (Total bookings made for this date)
    const leads = bookings.filter(b => b.date === dateStr).length;
    
    // Revenue (Total money from paid bookings on this date)
    const revenue = bookings
      .filter(b => b.date === dateStr && (b.status === 'paid' || b.status === 'completed'))
      .reduce((sum, b) => sum + (b.price || 0), 0);

    chartData.push({
      name: format(date, 'MMM d'),
      leads,
      revenue
    });
  }

  return (
    <div className="flex flex-col h-full gap-6">
      <header className="flex justify-between items-center mb-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Dashboard</h2>
          <p className="text-slate-500">{format(now, 'EEEE, MMMM d, yyyy')}</p>
        </div>
      </header>

      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Profits Made" value={`₦${profitsMade.toLocaleString()}`} note="Total finalized revenue" className="text-emerald-600" />
        <StatCard title="Expected Revenue" value={`₦${expectedRevenue.toLocaleString()}`} note="Based on pending bookings" />
        <StatCard title="Total Leads" value={bookings.length.toString()} note="All time bookings" />
        <StatCard title="Lost/Cancelled" value={bookings.filter(b => b.status === 'lost' || b.status === 'cancelled').length.toString()} note="Missed opportunities" isWarning />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full max-w-full overflow-hidden">
        {/* Payments History Chart */}
        <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-80 min-w-0">
          <h3 className="font-bold flex items-center justify-between text-slate-800 mb-6">
            <span>Payment History (Last 7 Days)</span>
          </h3>
          <div className="flex-1 w-full min-h-0 min-w-0 pb-4">
             <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(val) => `₦${val}`} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Leads History Chart */}
        <section className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col h-80 min-w-0">
          <h3 className="font-bold flex items-center justify-between text-slate-800 mb-6">
            <span>Leads History (Last 7 Days)</span>
          </h3>
          <div className="flex-1 w-full min-h-0 min-w-0 pb-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="leads" fill="#4f46e5" radius={[4, 4, 0, 0]} barSize={32} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ title, value, note, isWarning = false, className = '' }: { title: string, value: string, note: string, isWarning?: boolean, className?: string }) {
  return (
    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">{title}</p>
      <p className={`text-3xl font-bold ${className ? className : isWarning ? 'text-rose-600' : 'text-slate-800'}`}>{value}</p>
      <p className="text-xs text-indigo-600 font-medium mt-2">{note}</p>
    </div>
  );
}
