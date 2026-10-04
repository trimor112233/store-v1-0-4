import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem, Product, StudentKit } from '../types';
import { useToast } from './ToastContext';

interface CartContextType {
  cart: CartItem[];
  addToCart: (item: CartItem) => void;
  addProductToCart: (product: Product, quantity?: number) => void;
  addKitToCart: (kit: StudentKit) => void;
  removeFromCart: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  cartBounce: boolean;
  totalItemsCount: number;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => { success: boolean; message: string };
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { success, info } = useToast();
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('studenthub_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartBounce, setCartBounce] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('studenthub_cart', JSON.stringify(cart));
  }, [cart]);

  const triggerBounce = () => {
    setCartBounce(true);
    setTimeout(() => setCartBounce(false), 500);
  };

  const addToCart = (item: CartItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => (i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i));
      }
      return [...prev, item];
    });

    triggerBounce();
    success('Added to cart', `${item.title.substring(0, 32)}...`, {
      label: 'View Cart',
      onClick: () => setIsCartOpen(true),
    });
  };

  const addProductToCart = (product: Product, quantity = 1) => {
    addToCart({
      id: product.id,
      type: 'product',
      title: product.title,
      price: product.price,
      originalPrice: product.originalPrice,
      quantity,
      image: product.image,
      category: product.category,
    });
  };

  const addKitToCart = (kit: StudentKit) => {
    addToCart({
      id: kit.id,
      type: 'kit',
      title: kit.title,
      price: kit.price,
      originalPrice: kit.originalPrice,
      quantity: 1,
      image: kit.image,
      category: 'Student Kit Bundle',
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const applyCoupon = (code: string) => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === 'STUDENT10') {
      setAppliedCoupon('STUDENT10');
      return { success: true, message: '10% Student Discount Applied!' };
    }
    if (cleanCode === 'FRESHMAN50') {
      setAppliedCoupon('FRESHMAN50');
      return { success: true, message: '50 EGP Campus Welcome Voucher Applied!' };
    }
    return { success: false, message: 'Invalid coupon code. Try STUDENT10 or FRESHMAN50' };
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    info('Coupon removed');
  };

  let discount = 0;
  if (appliedCoupon === 'STUDENT10') {
    discount = Math.round(subtotal * 0.1);
  } else if (appliedCoupon === 'FRESHMAN50') {
    discount = Math.min(subtotal, 50);
  }

  // Free delivery over 500 EGP
  const shipping = subtotal === 0 ? 0 : subtotal >= 500 ? 0 : 35;
  const total = Math.max(0, subtotal - discount + shipping);
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        addProductToCart,
        addKitToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        cartBounce,
        totalItemsCount,
        subtotal,
        discount,
        shipping,
        total,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};
