'use client';

import React, { memo } from 'react';
import { CalendarDays, BedDouble, Mail, Phone, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export interface HotelBookingFormData {
  name: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  roomsCount: number;
  adults: number;
  children: number;
  notes: string;
}

export interface HotelBookingSidebarProps {
  selectedRoom: any;
  formData: HotelBookingFormData;
  error: string;
  nights: number;
  totalPrice: number;
  isPending: boolean;
  onFormChange: (field: keyof HotelBookingFormData, value: any) => void;
  onSubmit: (e: React.FormEvent) => void;
  t: (key: string, options?: any) => string;
}

export const HotelBookingSidebar = memo(function HotelBookingSidebar({
  selectedRoom,
  formData,
  error,
  nights,
  totalPrice,
  isPending,
  onFormChange,
  onSubmit,
  t,
}: HotelBookingSidebarProps) {
  const todayIso = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full lg:w-[400px] shrink-0 lg:sticky lg:top-24 h-fit" id="booking-form-section">
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xl p-6">
        <h3 className="text-xl font-bold text-slate-900 mb-1">{t('bookingInfo')}</h3>
        <p className="text-sm text-slate-500 mb-6 pb-4 border-b border-slate-100">
          {selectedRoom ? (
            <span>
              {t('selectedLabel')} <strong className="text-blue-600">{selectedRoom.name}</strong>
            </span>
          ) : (
            <span>{t('pleaseSelectRoom')}</span>
          )}
        </p>

        {error && (
          <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={onSubmit} className="space-y-4">
          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">{t('checkIn')}</label>
              <div className="relative">
                <CalendarDays className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="date"
                  value={formData.checkIn}
                  min={todayIso}
                  onChange={(e) => onFormChange('checkIn', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">{t('checkOut')}</label>
              <div className="relative">
                <CalendarDays className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="date"
                  value={formData.checkOut}
                  min={formData.checkIn || todayIso}
                  onChange={(e) => onFormChange('checkOut', e.target.value)}
                  className="w-full border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Rooms & Guests */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">{t('roomCount')}</label>
              <div className="relative">
                <BedDouble className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={formData.roomsCount}
                  onChange={(e) => onFormChange('roomsCount', Number(e.target.value))}
                  className="w-full border border-slate-200 rounded-xl pl-9 pr-2 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">{t('adults')}</label>
              <input
                type="number"
                min={1}
                max={20}
                value={formData.adults}
                onChange={(e) => onFormChange('adults', Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1.5">{t('children')}</label>
              <input
                type="number"
                min={0}
                max={10}
                value={formData.children}
                onChange={(e) => onFormChange('children', Number(e.target.value))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4 mt-2">
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">{t('fullName')}</label>
            <input
              value={formData.name}
              onChange={(e) => onFormChange('name', e.target.value)}
              placeholder="Nguyễn Văn A"
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">{t('email')}</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => onFormChange('email', e.target.value)}
                placeholder="email@example.com"
                className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">{t('phone')}</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => onFormChange('phone', e.target.value)}
                placeholder="0912 345 678"
                className="w-full border border-slate-200 rounded-xl pl-9 pr-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700 block mb-1.5">{t('notes')}</label>
            <textarea
              rows={2}
              value={formData.notes}
              onChange={(e) => onFormChange('notes', e.target.value)}
              placeholder={t('notesPlaceholder')}
              className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-slate-900 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            />
          </div>

          {/* Price Summary */}
          {selectedRoom && nights > 0 ? (
            <div className="bg-slate-50 rounded-2xl p-4 space-y-2 mt-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span>
                  {t('priceBreakdown', {
                    price: formatPrice(selectedRoom.price),
                    nights,
                    rooms: formData.roomsCount,
                  })}
                </span>
              </div>
              <div className="flex justify-between items-end border-t border-slate-200 pt-2">
                <span className="font-bold text-slate-900">{t('total')}</span>
                <span className="text-orange-500 text-2xl font-bold">{formatPrice(totalPrice)}</span>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-2xl p-4 mt-2 border border-slate-100 text-center">
              <p className="text-sm text-slate-500">{t('pleaseSelectDates')}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isPending || !selectedRoom}
            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold py-4 rounded-xl shadow-md transition-colors flex items-center justify-center gap-2 mt-2 text-lg cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                {t('processing')}
              </>
            ) : (
              <>
                {t('confirmBooking')} <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
});
