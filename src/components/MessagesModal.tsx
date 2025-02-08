import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { PropertyMessages } from "./PropertyMessages";

interface MessagesModalProps {
  isOpen: boolean;
  onClose: () => void;
  receiverId?: string;
}

export function MessagesModal({
  isOpen,
  onClose,
  receiverId,
}: MessagesModalProps) {
  if (!receiverId) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Messages</DialogTitle>
        </DialogHeader>
        <PropertyMessages receiverId={receiverId} />
      </DialogContent>
    </Dialog>
  );
}
