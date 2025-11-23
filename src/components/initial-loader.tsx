"use client";

import { useEffect, useState } from "react";
import { InitialLoader as Loader } from "@/components/loading";
import { AnimatePresence } from "framer-motion";

export function InitialLoader() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {loading && <Loader />}
    </AnimatePresence>
  );
}

