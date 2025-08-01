import { createContext, useContext, useState, ReactNode } from 'react';

type ModalType = 'login' | 'register' | null;

interface AuthModalContextValue {
  open: boolean;
  type: ModalType;
  openModal: (type: ModalType) => void;
  closeModal: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | undefined>(undefined);

export function AuthModalProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<ModalType>(null);

  const openModal = (modalType: ModalType) => {
    setType(modalType);
    setOpen(true);
  };
  const closeModal = () => {
    setOpen(false);
    setType(null);
  };

  return (
    <AuthModalContext.Provider value={{ open, type, openModal, closeModal }}>
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error('useAuthModal must be used within AuthModalProvider');
  return ctx;
}
