export interface UserProfile {
  role: 'admin' | 'staff';
  email: string;
  createdAt: number;
}

export interface Service {
  id?: string;
  title: string;
  durationMinutes: number;
  price: number;
  isActive: boolean;
  createdAt: number;
}

export interface Staff {
  id?: string;
  name: string;
  isActive: boolean;
  createdAt: number;
}

export interface Booking {
  id?: string;
  serviceId: string;
  staffId: string;
  date: string;
  startTime: string;
  endTime: string;
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  price?: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no-show' | 'paid' | 'lost';
  cancelledBy?: 'client' | 'admin';
  createdAt: number;
}

export interface BusinessSettings {
  businessName: string;
  businessEmail: string;
  businessPhone: string;
  whatsappNumber: string;
  address: string;
  timezone: string;
  currency: string;
  website: string;

  bookingInterval: number;
  leadTimeHours: number;
  maxAdvanceDays: number;
  bufferTimeMins: number;
  weekStartDay: number;

  hours: {
    [day: string]: { open: string; close: string; isClosed: boolean };
  };

  holidays: { date: string; reason: string; isClosed: boolean; open?: string; close?: string }[];

  notifications: {
    emailEnabled: boolean;
    whatsappEnabled: boolean;
    templates: {
      confirmation: string;
      reminder: string;
      cancellation: string;
      reschedule: string;
    };
  };

  payments: {
    onlinePaymentsEnabled: boolean;
    depositsEnabled: boolean;
    depositType: 'fixed' | 'percentage';
    depositAmount: number;
    offlineModeEnabled: boolean;
    refundPolicy: string;
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
  };

  brand: {
    themeColor: string;
    buttonColor: string;
    bookingHeadline: string;
    welcomeMessage: string;
    footerText: string;
  };

  integrations: {
    webhookUrl: string;
  };

  socials: {
    facebook: string;
    instagram: string;
    twitter: string;
  };
}
