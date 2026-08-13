import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CartItem } from '@/types';

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (itemId: string, travelDate: string) => void;
  updateItem: (itemId: string, travelDate: string, data: Partial<CartItem>) => void;
  clearCart: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const getItemIdentifier = (itemData: any) => String(itemData?._id || itemData?.id || itemData?.slug || '');

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) => set((state) => {
        const targetId = getItemIdentifier(item.itemData);
        const existingItemIndex = state.items.findIndex(
          (i) => getItemIdentifier(i.itemData) === targetId && i.travelDate === item.travelDate && i.type === item.type
        );
        if (existingItemIndex >= 0) {
          const newItems = [...state.items];
          newItems[existingItemIndex] = item;
          return { items: newItems };
        }
        return { items: [...state.items, item] };
      }),
      removeItem: (itemId, travelDate) => set((state) => ({
        items: state.items.filter((i) => {
          const currentId = getItemIdentifier(i.itemData);
          const idMatches = currentId === String(itemId) || i.itemData?.id === itemId || i.itemData?._id === itemId;
          const dateMatches = !travelDate || i.travelDate === travelDate;
          return !(idMatches && dateMatches);
        })
      })),
      updateItem: (itemId, travelDate, data) => set((state) => ({
        items: state.items.map((i) => {
          const currentId = getItemIdentifier(i.itemData);
          const idMatches = currentId === String(itemId) || i.itemData?.id === itemId || i.itemData?._id === itemId;
          const dateMatches = !travelDate || i.travelDate === travelDate;
          return (idMatches && dateMatches) ? { ...i, ...data } : i;
        })
      })),
      clearCart: () => set({ items: [] }),
      getTotalPrice: () => get().items.reduce((total, item) => total + (item.totalPrice || 0), 0),
      getTotalItems: () => get().items.reduce((total, item) => total + (item.guests?.adults || 0) + (item.guests?.children || 0), 0),
    }),
    {
      name: 'cart-storage',
    }
  )
);
