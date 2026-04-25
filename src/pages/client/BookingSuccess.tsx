import React, { useState } from 'react';
import { useNavigate, useLocation, useOutletContext } from 'react-router-dom';
import { CheckCircle2, Copy, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';
import { BusinessSettings } from '../../types';

export default function BookingSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state?.booking;

  const [paymentStep, setPaymentStep] = useState<'initial' | 'pay_now' | 'pay_later'>('initial');
  const { settings } = useOutletContext<{ settings: BusinessSettings | null }>();

  const WALLET_DETAILS = {
    bank: settings?.payments?.bankName || "Zenith Bank",
    name: settings?.payments?.accountName || "Salon Studio",
    account: settings?.payments?.accountNumber || "1234567890"
  };

  const WHATSAPP_NUMBER = settings?.whatsappNumber || "2340000000000"; // Admin's WhatsApp (Placeholder)

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(WALLET_DETAILS.account);
    toast.success("Account number copied!");
  };

  const handleWhatsAppRedirect = () => {
    const text = booking ? 
      `Hello! I just made a payment for my booking.
Name: ${booking.clientName}
Date: ${booking.date} at ${booking.startTime}
Please find my receipt attached.` : 
      "Hello! I just made a payment for my booking. Please find my receipt attached.";
      
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="bg-slate-50 flex flex-col flex-1 items-center justify-center p-6 font-sans">
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 max-w-md w-full text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center shadow-inner">
          <CheckCircle2 size={32} />
        </div>
        
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">Booking Confirmed!</h1>
          <p className="text-slate-500 text-sm font-medium">
            We've successfully received your appointment.
          </p>
        </div>

        {booking && (
          <div className="bg-slate-50 p-4 rounded-lg text-left space-y-3 border border-slate-100">
            <div className="flex flex-col gap-1">
              <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Date & Time</span>
              <span className="text-slate-900 font-bold text-sm">{booking.date} at {booking.startTime}</span>
            </div>
            {booking.clientName && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Name</span>
                <span className="text-slate-900 font-bold text-sm">{booking.clientName}</span>
              </div>
            )}
             {booking.price && (
              <div className="flex flex-col gap-1">
                <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Price</span>
                <span className="text-slate-900 font-bold text-sm">₦{booking.price.toLocaleString()}</span>
              </div>
            )}
          </div>
        )}

        {booking && booking.date && booking.startTime && (() => {
           let startDt = new Date(`${booking.date}T${booking.startTime}:00`);
           if (isNaN(startDt.getTime())) return null;
           
           let endDt = new Date(startDt.getTime() + 60*60*1000);
           const formatDt = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
           
           return (
              <a 
                 href={`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent('Appointment')}&dates=${formatDt(startDt)}/${formatDt(endDt)}&details=${encodeURIComponent('Appointment details')}`}
                 target="_blank" 
                 rel="noopener noreferrer"
                 className="mt-2 inline-flex items-center justify-center gap-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg py-2.5 px-4 transition-colors w-full"
              >
                 Add to Google Calendar
              </a>
           )
        })()}

        <hr className="border-slate-100" />

        {paymentStep === 'initial' && (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-800 tracking-tight">How would you like to pay?</h3>
            <div className="space-y-3">
              <button
                onClick={() => setPaymentStep('pay_now')}
                className="w-full bg-indigo-600 text-white rounded-lg py-3.5 text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors"
              >
                Pay Now (Bank Transfer)
              </button>
              <button
                onClick={() => setPaymentStep('pay_later')}
                className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg py-3.5 text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm"
              >
                Pay After Service
              </button>
            </div>
          </div>
        )}

        {paymentStep === 'pay_now' && (
          <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
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
               onClick={handleWhatsAppRedirect}
               className="w-full bg-[#25D366] text-white rounded-lg py-3.5 text-sm font-bold shadow-sm hover:bg-[#20bd5a] transition-colors flex justify-center items-center gap-2"
            >
               <MessageCircle size={18} />
               I have paid - Send Receipt
            </button>
            
            <div className="pt-2">
               <button onClick={() => navigate('/my-bookings')} className="text-xs font-bold text-slate-500 hover:text-slate-800 underline">Manage My Booking</button>
            </div>
          </div>
        )}

        {paymentStep === 'pay_later' && (
          <div className="space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <p className="text-sm text-slate-600 font-medium">
               No problem! We've noted that you will pay in person after your service. We look forward to seeing you.
            </p>
            <div className="pt-4 space-y-3">
              <button
                onClick={() => navigate('/my-bookings')}
                className="w-full bg-indigo-600 text-white rounded-lg py-3.5 text-sm font-bold shadow-sm hover:bg-indigo-700 transition-colors"
              >
                Manage My Booking
              </button>
              <button
                onClick={() => navigate('/')}
                className="w-full bg-white border border-slate-200 text-slate-700 rounded-lg py-3.5 text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors"
              >
                Return Home
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
