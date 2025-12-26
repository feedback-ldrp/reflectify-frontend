// src/components/common/Dialog.tsx
"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";

const DialogRoot = DialogPrimitive.Root; // Renamed to avoid conflict with our wrapper export
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;

const DialogOverlay = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Overlay>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Overlay
        ref={ref}
        className={cn(
            "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
            className
        )}
        {...props}
    />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContentPrimitive = React.forwardRef<
    // Renamed to avoid conflict
    React.ElementRef<typeof DialogPrimitive.Content>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
    <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content
            ref={ref}
            className={cn(
                "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border-light-secondary dark:border-dark-secondary bg-light-background dark:bg-dark-muted-background p-4 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
                className
            )}
            {...props}
        >
            {children}
            {/* <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-primary-dark focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
                <X className="h-4 w-4" />
                <span className="sr-only">Close</span>
            </DialogPrimitive.Close> */}
        </DialogPrimitive.Content>
    </DialogPortal>
));
DialogContentPrimitive.displayName = DialogPrimitive.Content.displayName;

const DialogHeader = ({
    className,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
    <div
        className={cn(
            "flex flex-col space-y-1.5 text-center sm:text-left",
            className
        )}
        {...props}
    />
);
DialogHeader.displayName = "DialogHeader";

const DialogTitle = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Title>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Title
        ref={ref}
        className={cn(
            "mt-3 mb-2 text-2xl font-semibold leading-none tracking-tight text-center text-light-text dark:text-dark-text",
            className
        )}
        {...props}
    />
));
DialogTitle.displayName = DialogPrimitive.Title.displayName;

const DialogDescription = React.forwardRef<
    React.ElementRef<typeof DialogPrimitive.Description>,
    React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
    <DialogPrimitive.Description
        ref={ref}
        className={cn(
            "text-md text-light-muted-text dark:text-dark-muted-text text-center",
            className
        )}
        {...props}
    />
));
DialogDescription.displayName = DialogPrimitive.Description.displayName;

// --- New Wrapper Component for easier usage ---

interface DialogProps {
    open: boolean;
    onClose: () => void;
    title: string;
    description?: React.ReactNode; // Make description an optional prop
    children: React.ReactNode;
}

const Dialog = ({
    open,
    onClose,
    title,
    description,
    children,
}: DialogProps) => {
    return (
        <DialogRoot
            open={open}
            onOpenChange={(newOpenState) => !newOpenState && onClose()}
        >
            <DialogContentPrimitive>
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    {description && (
                        <DialogDescription>{description}</DialogDescription>
                    )}
                </DialogHeader>
                {children}
            </DialogContentPrimitive>
        </DialogRoot>
    );
};

export {
    Dialog,
    DialogTrigger,
    DialogContentPrimitive as DialogContent, // Export original as DialogContent for consistency
    DialogHeader,
    DialogTitle,
    DialogDescription, // Export the new description component
    DialogRoot, // Export the primitive root if needed elsewhere
    DialogPortal,
    DialogOverlay,
};

export type {
    DialogProps,
    DialogContentPrimitive as DialogContentPrimitiveType, // Export the type for the primitive content
    DialogHeader as DialogHeaderType,
    DialogTitle as DialogTitleType,
    DialogDescription as DialogDescriptionType,
    DialogRoot as DialogRootType, // Export the type for the primitive root
    DialogPortal as DialogPortalType,
    DialogOverlay as DialogOverlayType,
    DialogTrigger as DialogTriggerType,
    DialogPrimitive as DialogPrimitiveType, // Export the primitive type if needed
};
