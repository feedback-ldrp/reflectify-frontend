/**
 * @file src/components/modals/ConfirmationDialog.tsx
 * @description A reusable confirmation dialog component
 */

"use client";

import React from "react";
import { Button } from "@/components/ui/Button";
import { Dialog, DialogContent } from "@radix-ui/react-dialog";

// You can use your own UI components for header, title, description, and footer
// For example, import from your UI library or define simple wrappers here:
const DialogHeader: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => <div className="dialog-header">{children}</div>;
const DialogTitle: React.FC<{
    className?: string;
    children: React.ReactNode;
}> = ({ className, children }) => <h2 className={className}>{children}</h2>;
const DialogDescription: React.FC<{
    className?: string;
    children: React.ReactNode;
}> = ({ className, children }) => <p className={className}>{children}</p>;
const DialogFooter: React.FC<{
    className?: string;
    children: React.ReactNode;
}> = ({ className, children }) => <div className={className}>{children}</div>;

interface ConfirmationDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    confirmVariant?:
        | "default"
        | "destructive"
        | "outline"
        | "secondary"
        | "ghost"
        | "link";
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
    isOpen,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    confirmVariant = "default",
}) => {
    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-light-background dark:bg-dark-muted-background border-light-secondary dark:border-dark-secondary">
                <DialogHeader>
                    <DialogTitle className="text-light-text dark:text-dark-text">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-light-muted-text dark:text-dark-muted-text">
                        {description}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="pt-4">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        className="mr-2"
                    >
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        variant={confirmVariant}
                        onClick={() => {
                            onConfirm();
                            onClose();
                        }}
                    >
                        {confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
