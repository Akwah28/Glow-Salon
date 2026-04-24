import { BusinessSettings } from '../types';

export const defaultSettings: BusinessSettings = {
  businessName: 'GlowSalon',
  businessEmail: '',
  businessPhone: '',
  whatsappNumber: '',
  address: '',
  timezone: 'Africa/Lagos',
  currency: 'NGN',
  website: '',
  bookingInterval: 30,
  leadTimeHours: 2,
  maxAdvanceDays: 30,
  bufferTimeMins: 0,
  weekStartDay: 1,
  hours: {
    '0': { open: '09:00', close: '17:00', isClosed: true }, // Sun
    '1': { open: '09:00', close: '17:00', isClosed: false },
    '2': { open: '09:00', close: '17:00', isClosed: false },
    '3': { open: '09:00', close: '17:00', isClosed: false },
    '4': { open: '09:00', close: '17:00', isClosed: false },
    '5': { open: '09:00', close: '17:00', isClosed: false },
    '6': { open: '09:00', close: '17:00', isClosed: false },
  },
  holidays: [],
  notifications: {
    emailEnabled: true,
    whatsappEnabled: true,
    templates: {
      confirmation: 'Hi {{client_name}}, your booking for {{service_name}} on {{appointment_date}} at {{appointment_time}} is confirmed.',
      reminder: 'Hi {{client_name}}, reminder that you have an appointment on {{appointment_date}} at {{appointment_time}}.',
      cancellation: 'Hi {{client_name}}, your booking on {{appointment_date}} has been cancelled.',
      reschedule: 'Hi {{client_name}}, your booking has been rescheduled to {{appointment_date}} at {{appointment_time}}.'
    }
  },
  payments: {
    onlinePaymentsEnabled: false,
    depositsEnabled: false,
    depositType: 'fixed',
    depositAmount: 0,
    offlineModeEnabled: true,
    refundPolicy: 'Refunds provided if cancelled 24 hours prior.'
  },
  brand: {
    themeColor: '#4f46e5',
    buttonColor: '#4f46e5',
    bookingHeadline: 'Book Your Appointment',
    welcomeMessage: 'We look forward to seeing you.',
    footerText: '© 2026 Salon Setup'
  },
  integrations: {
    webhookUrl: ''
  }
};

export function mergeWithDefaultSettings(data: Partial<BusinessSettings> | undefined | null): BusinessSettings {
  if (!data) return defaultSettings;
  
  // Clone to avoid mutation problems
  const merged = JSON.parse(JSON.stringify(defaultSettings)) as BusinessSettings;
  
  if (data.businessName !== undefined) merged.businessName = data.businessName;
  if (data.businessEmail !== undefined) merged.businessEmail = data.businessEmail;
  if (data.businessPhone !== undefined) merged.businessPhone = data.businessPhone;
  if (data.whatsappNumber !== undefined) merged.whatsappNumber = data.whatsappNumber;
  if (data.address !== undefined) merged.address = data.address;
  if (data.timezone !== undefined) merged.timezone = data.timezone;
  if (data.currency !== undefined) merged.currency = data.currency;
  if (data.website !== undefined) merged.website = data.website;
  if (data.bookingInterval !== undefined) merged.bookingInterval = data.bookingInterval;
  if (data.leadTimeHours !== undefined) merged.leadTimeHours = data.leadTimeHours;
  if (data.maxAdvanceDays !== undefined) merged.maxAdvanceDays = data.maxAdvanceDays;
  if (data.bufferTimeMins !== undefined) merged.bufferTimeMins = data.bufferTimeMins;
  if (data.weekStartDay !== undefined) merged.weekStartDay = data.weekStartDay;
  if (data.holidays !== undefined) merged.holidays = data.holidays;

  if (data.hours) merged.hours = { ...merged.hours, ...data.hours };
  
  if (data.notifications) {
    if (data.notifications.emailEnabled !== undefined) merged.notifications.emailEnabled = data.notifications.emailEnabled;
    if (data.notifications.whatsappEnabled !== undefined) merged.notifications.whatsappEnabled = data.notifications.whatsappEnabled;
    if (data.notifications.templates) merged.notifications.templates = { ...merged.notifications.templates, ...data.notifications.templates };
  }
  
  if (data.payments) merged.payments = { ...merged.payments, ...data.payments };
  if (data.brand) merged.brand = { ...merged.brand, ...data.brand };
  if (data.integrations) merged.integrations = { ...merged.integrations, ...data.integrations };
  
  return merged;
}
