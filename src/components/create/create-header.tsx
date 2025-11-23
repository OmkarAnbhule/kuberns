"use client";

import { motion } from "framer-motion";

interface CreateHeaderProps {
  currentStep: number;
  isEditing?: boolean;
}

export function CreateHeader({ currentStep, isEditing = false }: CreateHeaderProps) {
  return (
    <motion.div
      className="mb-8 flex items-start justify-between"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div>
        <h1 className="text-3xl font-bold mb-2 text-foreground">
          {isEditing ? "Edit App" : "Create New App"}
        </h1>
        <p className="text-muted-foreground text-base">
          {isEditing 
            ? "Update your app configuration and settings."
            : "Connect your repository and fill in the requirements to see the app deployed in seconds."
          }
        </p>
      </div>
      <div className="flex items-center gap-2 text-sm">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
          currentStep === 1 
            ? "border-primary text-primary bg-primary/10" 
            : "border-muted-foreground/30 text-muted-foreground"
        }`}>
          <span className="font-semibold">1</span>
        </div>
        <span className="text-muted-foreground/50">---</span>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
          currentStep === 2 
            ? "border-primary text-primary bg-primary/10" 
            : "border-muted-foreground/30 text-muted-foreground"
        }`}>
          <span className="font-semibold">2</span>
        </div>
      </div>
    </motion.div>
  );
}

