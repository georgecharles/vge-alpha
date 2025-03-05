import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { ScrollArea } from "./ui/scroll-area";

export function MobileNav({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm lg:hidden"
            onClick={onClose}
            style={{ width: '100vw' }}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            className={cn(
              "fixed inset-y-0 right-0 z-50 w-full max-w-xs bg-white shadow-2xl lg:hidden",
              "flex flex-col"
            )}
          >
            <div className="flex h-16 items-center justify-between border-b px-6">
              <a href="/" className="hover:opacity-80 transition-opacity">
                <img
                  src="https://i.postimg.cc/GpdY6N74/my-1920-x-1080-px-1.png"
                  alt="MyVGE"
                  className="h-8"
                />
              </a>
              <Button
                variant="ghost"
                size="icon"
                className="h-10 w-10 rounded-full hover:bg-muted"
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="flex flex-col p-6 pb-16">
                <div className="flex-1">{children}</div>
                <div className="mt-auto pt-6">
                  <p className="text-sm text-muted-foreground text-center">
                    © {new Date().getFullYear()} MyVGE. All rights reserved.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
