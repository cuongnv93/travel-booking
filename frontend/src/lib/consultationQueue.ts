import api from './api';

export interface PendingConsultation {
  id: string;
  name: string;
  phone: string;
  email?: string;
  country?: string;
  travelDate?: string;
  guests?: number | string;
  type: 'visa' | 'tour' | 'hotel' | 'general';
  notes?: string;
  createdAt: number;
}

const STORAGE_KEY = 'pending_consultations_v1';

/**
 * Enqueues a consultation lead locally in case of network or server failure
 * ensuring customer leads are NEVER lost.
 */
export function enqueueConsultationLead(lead: Omit<PendingConsultation, 'id' | 'createdAt'>): void {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const list: PendingConsultation[] = raw ? JSON.parse(raw) : [];
    const item: PendingConsultation = {
      ...lead,
      id: 'lead_' + Date.now() + '_' + Math.random().toString(36).slice(2, 7),
      createdAt: Date.now(),
    };
    list.push(item);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (err) {
    console.error('Failed to save consultation lead locally:', err);
  }
}

/**
 * Flushes all locally stored leads to the backend server.
 */
export async function flushPendingConsultations(): Promise<void> {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const list: PendingConsultation[] = JSON.parse(raw);
    if (!Array.isArray(list) || list.length === 0) return;

    const remaining: PendingConsultation[] = [];

    for (const item of list) {
      try {
        await api.post('/consultations', {
          name: item.name,
          phone: item.phone,
          email: item.email,
          country: item.country,
          travelDate: item.travelDate,
          guests: item.guests,
          type: item.type,
          notes: item.notes,
        });
      } catch {
        // If still failing, keep it in remaining queue
        remaining.push(item);
      }
    }

    if (remaining.length === 0) {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(remaining));
    }
  } catch (err) {
    console.error('Failed to flush pending consultations:', err);
  }
}
