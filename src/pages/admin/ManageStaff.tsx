import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Staff } from '../../types';
import { Users, Plus, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function ManageStaff() {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(query(collection(db, 'staff')));
      setStaffList(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Staff)));
    } catch (error) {
      toast.error('Failed to load staff');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    try {
      await addDoc(collection(db, 'staff'), {
        name: newName,
        isActive: true,
        createdAt: serverTimestamp()
      });
      toast.success('Staff added');
      setIsAdding(false);
      setNewName('');
      fetchStaff();
    } catch (err) {
      toast.error('Could not add staff');
    }
  };

  const toggleStatus = async (staff: Staff) => {
    if (!staff.id) return;
    try {
      await updateDoc(doc(db, 'staff', staff.id), {
        isActive: !staff.isActive
      });
      fetchStaff();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Staff</h2>
          <p className="text-slate-500 mt-1">Manage your salon staff members.</p>
        </div>
        <button 
          onClick={() => setIsAdding(!isAdding)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm hover:bg-indigo-700 transition-colors flex items-center gap-2"
        >
          {isAdding ? 'Cancel' : <><Plus size={16} className="stroke-[2.5]" /> Add Staff</>}
        </button>
      </header>

      {isAdding && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 max-w-md space-y-4">
           <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">New Staff Member</h3>
           <div>
              <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Full Name</label>
              <input 
                required value={newName} onChange={e => setNewName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white" placeholder="e.g. John Smith" />
           </div>
           <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-medium shadow-sm flex items-center gap-2 mt-2">
             <Save size={16} /> Save Staff
           </button>
        </form>
      )}

      {loading ? (
        <p className="text-slate-500 font-medium text-sm">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staffList.map(staff => (
            <div key={staff.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-lg flex items-center justify-center font-bold">
                  {staff.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-800">{staff.name}</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-wider ${staff.isActive ? 'text-emerald-600' : 'text-slate-400'}`}>
                    {staff.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              
              <button 
                onClick={() => toggleStatus(staff)}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg border border-indigo-100 bg-indigo-50/50 transition-colors"
              >
                {staff.isActive ? 'Deactivate' : 'Activate'}
              </button>
            </div>
          ))}
          {staffList.length === 0 && !isAdding && (
             <p className="text-slate-500 font-medium text-sm col-span-full">No staff members found. Add one to get started.</p>
          )}
        </div>
      )}
    </div>
  );
}
