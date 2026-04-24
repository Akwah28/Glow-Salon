import React, { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { BusinessSettings } from '../../types';
import { defaultSettings, mergeWithDefaultSettings } from '../../lib/settingsDefaults';
import { toast } from 'sonner';
import { 
  Store, CalendarClock, Palette, Bell, CreditCard, 
  Link2, Save, X, Plus
} from 'lucide-react';

const TABS = [
  { id: 'profile', label: 'Business Profile', icon: Store },
  { id: 'booking', label: 'Booking Rules', icon: CalendarClock },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'payments', label: 'Payments', icon: CreditCard },
  { id: 'brand', label: 'Branding', icon: Palette },
  { id: 'integrations', label: 'Integrations', icon: Link2 },
];

export default function Settings() {
  const [settings, setSettings] = useState<BusinessSettings | null>(null);
  const [originalSettings, setOriginalSettings] = useState<BusinessSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, 'settings', 'general');
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const merged = mergeWithDefaultSettings(docSnap.data() as Partial<BusinessSettings>);
          setSettings(merged);
          setOriginalSettings(merged);
        } else {
          setSettings(defaultSettings);
          setOriginalSettings(defaultSettings);
        }
      } catch (error) {
        toast.error('Failed to load settings');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSettings();
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    setSaving(true);
    try {
      await setDoc(doc(db, 'settings', 'general'), settings);
      setOriginalSettings(settings);
      toast.success('Settings saved successfully');
    } catch (error) {
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-8 text-slate-500">Loading settings...</div>;
  }

  const hasChanges = JSON.stringify(settings) !== JSON.stringify(originalSettings);

  const updateField = (section: keyof BusinessSettings | null, field: string, value: any) => {
    setSettings(prev => {
      if (!prev) return prev;
      if (section === null) {
        return { ...prev, [field]: value };
      }
      return {
        ...prev,
        [section]: {
          ...(prev[section] as object),
          [field]: value
        }
      };
    });
  };

  const updateNestedField = (section: "notifications", nested: "templates", field: string, value: any) => {
    setSettings(prev => {
       if (!prev) return prev;
       return {
         ...prev,
         [section]: {
           ...prev[section],
           [nested]: {
             ...prev[section][nested],
             [field]: value
           }
         }
       }
    });
  };

  return (
    <div className="flex flex-col h-full max-w-5xl overflow-hidden pb-12">
      <header className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Settings</h2>
          <p className="text-slate-500 mt-1 text-sm">Configure your salon hours, branding, and automation.</p>
        </div>
        <button
          disabled={!hasChanges || saving}
          onClick={handleSave}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
        >
          <Save size={18} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </header>

      <div className="flex flex-col md:flex-row gap-6 min-h-0 flex-1">
        {/* Sidebar Nav */}
        <div className="w-full md:w-64 flex-shrink-0 flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
                  isActive ? 'bg-white shadow-sm border border-slate-200 text-indigo-700' : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800 border border-transparent'
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-y-auto">
          <div className="p-6 max-w-3xl">
            {activeTab === 'profile' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Business Profile</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Business Name</label>
                    <input type="text" value={settings.businessName} onChange={e => updateField(null, 'businessName', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Currency</label>
                    <select value={settings.currency} onChange={e => updateField(null, 'currency', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium">
                      <option value="NGN">NGN - Nigerian Naira</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email Address</label>
                    <input type="email" value={settings.businessEmail} onChange={e => updateField(null, 'businessEmail', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contact Phone</label>
                    <input type="text" value={settings.businessPhone} onChange={e => updateField(null, 'businessPhone', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp Number</label>
                    <input type="text" value={settings.whatsappNumber} onChange={e => updateField(null, 'whatsappNumber', e.target.value)} placeholder="e.g. 23480000000" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Website</label>
                    <input type="text" value={settings.website} onChange={e => updateField(null, 'website', e.target.value)} placeholder="https://..." className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium" />
                  </div>
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address</label>
                    <textarea value={settings.address} onChange={e => updateField(null, 'address', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium" rows={3}></textarea>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'booking' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="space-y-6">
                   <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Booking Limitations</h3>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                     <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Slot Interval (mins)</label>
                       <select value={settings.bookingInterval} onChange={e => updateField(null, 'bookingInterval', parseInt(e.target.value) || 30)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium">
                         <option value={15}>15 Minutes</option>
                         <option value={30}>30 Minutes</option>
                         <option value={60}>60 Minutes</option>
                       </select>
                     </div>
                     <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Buffer Time (mins)</label>
                       <select value={settings.bufferTimeMins} onChange={e => updateField(null, 'bufferTimeMins', parseInt(e.target.value) || 0)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium">
                         <option value={0}>No Buffer</option>
                         <option value={10}>10 Minutes</option>
                         <option value={15}>15 Minutes</option>
                         <option value={30}>30 Minutes</option>
                       </select>
                     </div>
                     <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Min Lead Time (hours)</label>
                       <input type="number" min={0} value={settings.leadTimeHours} onChange={e => updateField(null, 'leadTimeHours', parseInt(e.target.value) || 0)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium" />
                       <p className="text-[10px] text-slate-400">Advance notice needed for booking.</p>
                     </div>
                     <div className="space-y-1">
                       <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Max Advance Days</label>
                       <input type="number" min={1} value={settings.maxAdvanceDays} onChange={e => updateField(null, 'maxAdvanceDays', parseInt(e.target.value) || 1)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium" />
                       <p className="text-[10px] text-slate-400">How far in advance clients can book.</p>
                     </div>
                   </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Weekly Hours</h3>
                  <div className="space-y-3">
                    {['1','2','3','4','5','6','0'].map(day => ( // Mon-Sun mapping
                       <div key={day} className="flex items-center gap-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                          <label className="flex items-center gap-2 w-24">
                            <input 
                              type="checkbox" 
                              checked={!settings.hours[day].isClosed}
                              onChange={e => {
                                const newHours = { ...settings.hours };
                                newHours[day].isClosed = !e.target.checked;
                                updateField(null, 'hours', newHours);
                              }}
                              className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                            />
                            <span className="text-sm font-bold text-slate-700">
                              {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][parseInt(day)]}
                            </span>
                          </label>
                          {!settings.hours[day].isClosed ? (
                            <div className="flex items-center gap-2 flex-1">
                              <input 
                                type="time" 
                                value={settings.hours[day].open}
                                onChange={e => {
                                  const newHours = { ...settings.hours };
                                  newHours[day].open = e.target.value;
                                  updateField(null, 'hours', newHours);
                                }}
                                className="p-1.5 text-sm rounded bg-white border border-slate-200" 
                              />
                              <span className="text-slate-400 text-xs">to</span>
                              <input 
                                type="time" 
                                value={settings.hours[day].close}
                                onChange={e => {
                                  const newHours = { ...settings.hours };
                                  newHours[day].close = e.target.value;
                                  updateField(null, 'hours', newHours);
                                }}
                                className="p-1.5 text-sm rounded bg-white border border-slate-200" 
                              />
                            </div>
                          ) : (
                             <span className="text-xs font-bold text-slate-400 uppercase">Closed</span>
                          )}
                       </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-6">
                   <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                     <h3 className="text-lg font-bold text-slate-900">Holiday Overrides</h3>
                     <button 
                       onClick={() => {
                         const newHolidays = [...settings.holidays, { date: '', reason: 'Special Holiday', isClosed: true }];
                         updateField(null, 'holidays', newHolidays);
                       }}
                       className="text-xs font-bold text-indigo-600 flex items-center gap-1 hover:bg-indigo-50 px-2 py-1 rounded"
                     >
                       <Plus size={14}/> Add Date
                     </button>
                   </div>
                   {settings.holidays.length === 0 ? (
                      <p className="text-sm text-slate-500">No holidays or special closures set.</p>
                   ) : (
                      <div className="space-y-3">
                        {settings.holidays.map((hol, index) => (
                           <div key={index} className="flex items-center gap-3 bg-rose-50 border border-rose-100 p-3 rounded-lg">
                              <input 
                                type="date" 
                                value={hol.date}
                                onChange={e => {
                                  const hols = [...settings.holidays];
                                  hols[index].date = e.target.value;
                                  updateField(null, 'holidays', hols);
                                }}
                                className="p-1.5 text-sm rounded bg-white border border-slate-200 w-36"
                              />
                              <input 
                                type="text"
                                value={hol.reason}
                                onChange={e => {
                                  const hols = [...settings.holidays];
                                  hols[index].reason = e.target.value;
                                  updateField(null, 'holidays', hols);
                                }}
                                className="p-1.5 text-sm rounded bg-white border border-slate-200 flex-1"
                                placeholder="Reason (e.g. Christmas)"
                              />
                              <button onClick={() => {
                                  const hols = settings.holidays.filter((_, i) => i !== index);
                                  updateField(null, 'holidays', hols);
                              }} className="p-2 text-rose-500 hover:bg-rose-100 rounded">
                                <X size={16}/>
                              </button>
                           </div>
                        ))}
                      </div>
                   )}
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={settings.notifications.emailEnabled} 
                      onChange={e => updateField('notifications', 'emailEnabled', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                    />
                    <span className="text-sm font-bold text-slate-700">Enable Email</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      checked={settings.notifications.whatsappEnabled} 
                      onChange={e => updateField('notifications', 'whatsappEnabled', e.target.checked)}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300"
                    />
                    <span className="text-sm font-bold text-slate-700">Enable WhatsApp</span>
                  </label>
                </div>

                <div className="space-y-6">
                  <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Templates</h3>
                  
                  <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs text-slate-600 space-y-1">
                    <p className="font-bold mb-2">Available Variables:</p>
                    <div className="flex flex-wrap gap-2">
                      {['{{client_name}}', '{{service_name}}', '{{appointment_date}}', '{{appointment_time}}', '{{business_name}}'].map(v => (
                         <span key={v} className="px-2 py-1 bg-white border border-slate-200 rounded font-mono text-[10px]">{v}</span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Booking Confirmation</label>
                      <textarea 
                        value={settings.notifications.templates.confirmation}
                        onChange={e => updateNestedField('notifications', 'templates', 'confirmation', e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reminder (24 hrs prior)</label>
                      <textarea 
                        value={settings.notifications.templates.reminder}
                        onChange={e => updateNestedField('notifications', 'templates', 'reminder', e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium min-h-[80px]"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cancellation</label>
                      <textarea 
                        value={settings.notifications.templates.cancellation}
                        onChange={e => updateNestedField('notifications', 'templates', 'cancellation', e.target.value)}
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium min-h-[80px]"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'payments' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Payment Settings</h3>
                
                <div className="space-y-4">
                  <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50">
                    <input 
                      type="checkbox" 
                      checked={settings.payments.onlinePaymentsEnabled} 
                      onChange={e => updateField('payments', 'onlinePaymentsEnabled', e.target.checked)}
                      className="w-5 h-5 text-indigo-600 rounded border-slate-300"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">Enable Online Payments</span>
                      <span className="text-xs text-slate-500">Allow clients to pay via card/transfer booking.</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50">
                    <input 
                      type="checkbox" 
                      checked={settings.payments.depositsEnabled} 
                      onChange={e => updateField('payments', 'depositsEnabled', e.target.checked)}
                      className="w-5 h-5 text-indigo-600 rounded border-slate-300"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">Require Deposit</span>
                      <span className="text-xs text-slate-500">Require an upfront deposit to secure the slot.</span>
                    </div>
                  </label>
                  
                  <label className="flex items-center gap-3 p-4 border border-slate-200 rounded-xl bg-slate-50">
                    <input 
                      type="checkbox" 
                      checked={settings.payments.offlineModeEnabled} 
                      onChange={e => updateField('payments', 'offlineModeEnabled', e.target.checked)}
                      className="w-5 h-5 text-indigo-600 rounded border-slate-300"
                    />
                    <div>
                      <span className="text-sm font-bold text-slate-900 block">Allow 'Pay Later' / In-Person</span>
                      <span className="text-xs text-slate-500">Clients can skip online payment and pay at the shop.</span>
                    </div>
                  </label>

                  {settings.payments.depositsEnabled && (
                    <div className="grid grid-cols-2 gap-4 p-4 border border-slate-200 rounded-xl bg-white">
                      <div className="space-y-1">
                         <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Deposit Type</label>
                         <select 
                           value={settings.payments.depositType}
                           onChange={e => updateField('payments', 'depositType', e.target.value)}
                           className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium"
                         >
                           <option value="fixed">Fixed Amount</option>
                           <option value="percentage">Percentage (%)</option>
                         </select>
                      </div>
                      <div className="space-y-1">
                         <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Amount / %</label>
                         <input 
                           type="number"
                           value={settings.payments.depositAmount}
                           onChange={e => updateField('payments', 'depositAmount', parseInt(e.target.value))}
                           className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium"
                         />
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 mt-6 border-t border-slate-100 pt-6">
                    <h4 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2">Manual Bank Transfer Details</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bank Name</label>
                        <input 
                          type="text"
                          value={settings.payments.bankName || ''}
                          onChange={e => updateField('payments', 'bankName', e.target.value)}
                          placeholder="e.g. Chase Bank"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Name</label>
                        <input 
                          type="text"
                          value={settings.payments.accountName || ''}
                          onChange={e => updateField('payments', 'accountName', e.target.value)}
                          placeholder="e.g. John Doe"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium"
                        />
                      </div>
                      <div className="space-y-1 md:col-span-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Account Number</label>
                        <input 
                          type="text"
                          value={settings.payments.accountNumber || ''}
                          onChange={e => updateField('payments', 'accountNumber', e.target.value)}
                          placeholder="e.g. 1234567890"
                          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-1 mt-6 border-t border-slate-100 pt-6">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cancellation & Refund Policy</label>
                    <textarea 
                      value={settings.payments.refundPolicy}
                      onChange={e => updateField('payments', 'refundPolicy', e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'brand' && (
               <div className="space-y-6 animate-in fade-in duration-300">
                  <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Client Portal Branding</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Theme Color</label>
                      <div className="flex items-center gap-3">
                         <input type="color" value={settings.brand.themeColor} onChange={e => updateField('brand', 'themeColor', e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                         <span className="text-sm font-mono text-slate-500">{settings.brand.themeColor}</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Button Color</label>
                      <div className="flex items-center gap-3">
                         <input type="color" value={settings.brand.buttonColor} onChange={e => updateField('brand', 'buttonColor', e.target.value)} className="w-10 h-10 rounded cursor-pointer border-0 p-0" />
                         <span className="text-sm font-mono text-slate-500">{settings.brand.buttonColor}</span>
                      </div>
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Booking Portal Headline</label>
                      <input type="text" value={settings.brand.bookingHeadline} onChange={e => updateField('brand', 'bookingHeadline', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium" />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Welcome Message</label>
                      <textarea value={settings.brand.welcomeMessage} onChange={e => updateField('brand', 'welcomeMessage', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium" rows={2} />
                    </div>
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Footer Text</label>
                      <input type="text" value={settings.brand.footerText} onChange={e => updateField('brand', 'footerText', e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium" />
                    </div>
                  </div>
               </div>
            )}

            {activeTab === 'integrations' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-2">Integrations</h3>
                <div className="space-y-6">

                   <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">EmailJS (Email Automation)</h4>
                        <p className="text-xs text-slate-500">Awaiting integration details for EmailJS.</p>
                      </div>
                   </div>

                   <div className="p-4 border border-slate-200 rounded-xl bg-slate-50 space-y-3">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm">Webhook URL</h4>
                        <p className="text-xs text-slate-500">Post booking data to external services (Zapier, Make, etc).</p>
                      </div>
                      <input 
                         type="url" 
                         value={settings.integrations.webhookUrl} 
                         onChange={e => updateField('integrations', 'webhookUrl', e.target.value)} 
                         placeholder="https://hooks.zapier.com/..." 
                         className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-sm font-medium" 
                      />
                   </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
