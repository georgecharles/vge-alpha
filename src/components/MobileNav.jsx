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
          className="fixed inset-0 z-50 bg-background lg:hidden"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2, delay: 0.1 }}
            className={cn(
              "fixed inset-0 bg-gradient-to-b from-background/90 via-background/50 to-background/90 backdrop-blur-xl",
              "flex flex-col overflow-y-auto pb-12",
            )}
          >
            <div className="flex h-16 items-center justify-between px-6 pt-4">
              <a href="/" className="hover:opacity-80 transition-opacity">
                <img
                  src="https://i.postimg.cc/1zhYWbNc/my-1-1.png"
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
            <div className="flex-1 px-6 pt-10">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
