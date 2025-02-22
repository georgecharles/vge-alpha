import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";

export function MobileNav({ isOpen, onClose, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm lg:hidden"
          style={{ width: '100vw' }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className={cn(
              "fixed inset-0 bg-white",
              "flex flex-col overflow-y-auto"
            )}
            style={{ width: '100vw' }}
          >
            <div className="flex h-16 items-center justify-between px-4">
              <a href="/" className="hover:opacity-80 transition-opacity">
                <img
                  src="https://i.postimg.cc/GpdY6N74/my-1920-x-1080-px-1.png"
                  alt="MyVGE"
                  className="h-8"
                />
              </a>
              <Button
                variant="ghost"
                className="h-auto p-2 hover:bg-transparent"
                onClick={onClose}
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            <div className="flex-1 px-4 pb-12">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
