import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, addDoc, updateDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Service } from '../../types';
import { Scissors, Plus, Save, Edit2, X } from 'lucide-react';
import { toast } from 'sonner';

export default function ManageServices() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newTitle, setNewTitle] = useState('');
  const [newDuration, setNewDuration] = useState('30');
  const [newPrice, setNewPrice] = useState('5000');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(query(collection(db, 'services')));
      setServices(snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Service)));
    } catch (error) {
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle) return;

    try {
      if (editingId) {
        await updateDoc(doc(db, 'services', editingId), {
          title: newTitle,
          durationMinutes: parseInt(newDuration, 10),
          price: parseInt(newPrice, 10),
        });
        toast.success('Service updated');
        setEditingId(null);
      } else {
        await addDoc(collection(db, 'services'), {
          title: newTitle,
          durationMinutes: parseInt(newDuration, 10),
          price: parseInt(newPrice, 10),
          isActive: true,
          createdAt: serverTimestamp()
        });
        toast.success('Service created');
      }
      setIsAdding(false);
      setNewTitle('');
      setNewDuration('30');
      setNewPrice('5000');
      fetchServices();
    } catch (err) {
      toast.error(editingId ? 'Could not update service' : 'Could not create service');
    }
  };

  const startEditing = (service: Service) => {
    setEditingId(service.id!);
    setNewTitle(service.title);
    setNewDuration(service.durationMinutes.toString());
    setNewPrice(service.price.toString());
    setIsAdding(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelSetup = () => {
    setIsAdding(false);
    setEditingId(null);
    setNewTitle('');
    setNewDuration('30');
    setNewPrice('5000');
  };

  const toggleStatus = async (service: Service) => {
    if (!service.id) return;
    try {
      await updateDoc(doc(db, 'services', service.id), {
        isActive: !service.isActive
      });
      fetchServices();
    } catch (err) {
      toast.error('Update failed');
    }
  };

  return (
    <div className="space-y-8">
      <header className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Services</h2>
          <p className="text-slate-500 mt-1">Manage your salon's services and prices.</p>
        </div>
        <button 
          onClick={isAdding ? cancelSetup : () => setIsAdding(true)}
          className={`px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center gap-2 ${isAdding ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
        >
          {isAdding ? <><X size={16} /> Cancel</> : <><Plus size={16} className="stroke-[2.5]" /> Add Service</>}
        </button>
      </header>

      {isAdding && (
        <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 space-y-4">
           <h3 className="font-bold text-sm text-slate-800 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">
             {editingId ? 'Edit Service' : 'New Service'}
           </h3>
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Service Title</label>
                <input 
                  required value={newTitle} onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white" placeholder="e.g. Men's Haircut" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Duration (mins)</label>
                <input 
                  type="number" required value={newDuration} onChange={e => setNewDuration(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white" />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Price (₦)</label>
                <input 
                  type="number" required value={newPrice} onChange={e => setNewPrice(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:bg-white" />
              </div>
           </div>
           <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2 text-sm font-medium shadow-sm flex items-center gap-2 mt-2">
             <Save size={16} /> {editingId ? 'Update Service' : 'Save Service'}
           </button>
        </form>
      )}

      {loading ? (
        <p className="text-slate-500 font-medium text-sm">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(service => (
            <div key={service.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center text-slate-600">
                    <Scissors size={18} />
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => startEditing(service)}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      <Edit2 size={14} />
                    </button>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${service.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500'}`}>
                      {service.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <h3 className="font-bold text-slate-800">{service.title}</h3>
                <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mt-1">{service.durationMinutes} minutes</p>
              </div>
              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="font-bold text-slate-900">₦{service.price.toLocaleString()}</span>
                <button 
                  onClick={() => toggleStatus(service)}
                  className="text-xs font-bold text-indigo-600 hover:text-indigo-800 px-3 py-1.5 rounded-lg border border-indigo-100 bg-indigo-50/50 transition-colors"
                >
                  {service.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
