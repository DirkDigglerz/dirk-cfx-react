import { createContext, useContext, useRef } from "react";
import { create, StoreApi, useStore } from "zustand";
import Modal from "./Modal";

type ModalProps = {
  children: React.ReactNode;
  title: string;
  icon: string;
  description?: string;
  height?: string;
  width?: string;
  clickOutside?: boolean;
};

type ModalStore = {
  active: ModalProps | null;
}

export const ModalContext = createContext<StoreApi<ModalStore> | null>(null);

export function useModal<T>(selector: (state: ModalStore) => T): T {
  const modal = useContext(ModalContext);
  if(!modal){
    throw new Error('useModal must be used within a ModalProvider');
  }
  return useStore(modal, selector);
}

export function ModalProvider({ children, defaultPage }: { children: React.ReactNode, defaultPage?: string }){
  const storeRef = useRef<StoreApi<ModalStore>>(
    create<ModalStore>(() => ({
      active: null,
    }))
  );

  return (
    <ModalContext.Provider value={storeRef.current}>
      <Modal/>
      {children}
    </ModalContext.Provider>
  );
}

export function useModalActions() {
  const modal = useContext(ModalContext);
  if (!modal) throw new Error("useModalActions must be used within a ModalProvider");

  const showModal = (openModal: ModalProps) => {
    modal.setState({ active: openModal });
  };

  const hideModal = () => {
    modal.setState({ active: null });
  };

  return { showModal, hideModal };
}

