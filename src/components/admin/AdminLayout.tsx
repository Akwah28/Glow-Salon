import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, useLocation, Link } from 'react-router-dom';
import { auth, db } from '../../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { LayoutDashboard, Scissors, Users, CalendarDays, Settings, LogOut } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate('/admin/login', { replace: true });
        return;
      }
      
      try {
        const adminDoc = await getDoc(doc(db, 'admins', user.uid));
        const adminEmailDoc = user.email ? await getDoc(doc(db, 'adminEmails', user.email)) : null;
        const isSuperAdminEmail = user.email === 'godgiftakwah28@gmail.com' || user.email === 'godgiftkabariledumakwah@gmail.com';
        
        if (!adminDoc.exists() && (!adminEmailDoc || !adminEmailDoc.exists()) && !isSuperAdminEmail) {
          auth.signOut();
          toast.error('Unauthorized access. Admin privileges required.');
          navigate('/admin/login', { replace: true });
          return;
        }
      } catch (err) {
        console.error("Admin check error", err);
      }

      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500">Loading...</div>;
  }

  const handleLogout = () => {
    auth.signOut();
  };

  const menuItems = [
    { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { label: 'Bookings', path: '/admin/bookings', icon: CalendarDays },
    { label: 'Services', path: '/admin/services', icon: Scissors },
    { label: 'Staff', path: '/admin/staff', icon: Users },
    { label: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 md:flex-row flex-col">
      <style>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      <aside className="md:w-64 w-full bg-white border-r border-b md:border-b-0 border-slate-200 md:min-h-screen flex flex-col sticky top-0 z-20 shadow-sm md:shadow-none">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">S</span>
            </div>
            <h1 className="font-bold text-xl tracking-tight text-slate-800">GlowSalon</h1>
          </div>
          <button 
             onClick={handleLogout}
             className="md:hidden p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-x-auto md:overflow-x-visible flex md:flex-col flex-row hide-scrollbar">
          {menuItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${
                  isActive 
                    ? 'bg-indigo-50 text-indigo-700' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                }`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-200 hidden md:block">
          <button 
             onClick={handleLogout}
             className="flex items-center gap-3 px-3 py-2.5 rounded-lg w-full text-sm font-medium text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      <main className="flex-1 p-4 md:p-8 max-w-6xl w-full">
        <Outlet />
      </main>
    </div>
  );
}
