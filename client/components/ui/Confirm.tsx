"use client";

import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/react";
import { Button } from "@heroui/button";

interface ConfirmProps {
  onConfirmProp: string | number;
  onConfirm: (prop: string | number) => void;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "danger"
    | "warning";
  size?: "sm" | "md" | "lg";
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
}
const Confirm = ({
  onConfirmProp,
  onConfirm,
  isOpen,
  onOpenChange,
  color = "danger",
  size = "sm",
  title = "Confirm",
  message = "Are you sure you want to delete this ?",
  confirmText = "Delete",
  cancelText = "Cancel",
}: ConfirmProps) => {
  return (
    <>
      <Modal isOpen={isOpen} size={size} onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader className="pb-0">
            <h2 className="text-lg font-medium">{title}</h2>
          </ModalHeader>
          <ModalBody>
            <p>{message}</p>
          </ModalBody>
          <ModalFooter className="pt-0">
            <Button
              color={color}
              size={size}
              onPress={() => onConfirm(onConfirmProp)}
            >
              {confirmText}
            </Button>
            <Button
              size={size}
              variant="bordered"
              onPress={() => onOpenChange(false)}
            >
              {cancelText}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Confirm;
