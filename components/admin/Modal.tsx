"use client";
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ModalProps = {
  open: boolean;
  title?: string;
  description?: string;
  children: React.ReactNode;
  onClose: () => void;
  footer?: React.ReactNode;
};

export function Modal({ open, title, description, children, onClose, footer }: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md border border-[#d5d7d5] rounded-lg">
        {(title || description) ? (
          <DialogHeader className="pb-4">
            {title ? (
              <DialogTitle className="text-[#291b13] text-lg font-semibold">
                {title}
              </DialogTitle>
            ) : null}
            {description ? (
              <DialogDescription className="text-[#58514d] text-sm">
                {description}
              </DialogDescription>
            ) : null}
          </DialogHeader>
        ) : null}
        <div className="py-4">{children}</div>
        {footer ? (
          <DialogFooter className="flex gap-3 justify-end pt-4 border-t border-[#e6e7e6]">
            {footer}
          </DialogFooter>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

export default Modal;


