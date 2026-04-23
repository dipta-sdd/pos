"use client";

import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, Listbox, ListboxItem } from "@heroui/react";
import { PaymentMethod } from "@/lib/types/general";

interface Props {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  methods: PaymentMethod[];
  onSelect: (method: PaymentMethod) => void;
  title: string;
}

export const PaymentMethodSelectorModal: React.FC<Props> = ({
  isOpen,
  onOpenChange,
  methods,
  onSelect,
  title,
}) => {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="sm" hideCloseButton>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1 text-primary">{title}</ModalHeader>
        <ModalBody className="pb-6">
          <Listbox
            aria-label="Select Payment Method"
            variant="flat"
            onAction={(key) => {
              const method = methods.find((m) => m.id.toString() === key.toString());
              if (method) {
                onSelect(method);
                onOpenChange(false);
              }
            }}
          >
            {methods.map((method) => (
              <ListboxItem 
                key={method.id} 
                description={method.type}
                className="py-3"
              >
                {method.name}
              </ListboxItem>
            ))}
          </Listbox>
          <div className="text-[10px] text-default-400 text-center font-bold uppercase tracking-widest pt-2">
            Use Arrows & Enter to Select
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
