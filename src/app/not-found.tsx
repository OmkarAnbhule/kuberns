"use client";

import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/page-transition";

export default function NotFound() {
  const router = useRouter();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-16">
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="max-w-2xl mx-auto"
            >
              {/* 404 Number */}
              <motion.h1
                className="text-9xl font-bold bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                404
              </motion.h1>

              {/* Error Message */}
              <motion.h2
                className="text-3xl font-semibold mb-4"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Page Not Found
              </motion.h2>

              <motion.p
                className="text-muted-foreground text-lg mb-8 max-w-md mx-auto"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                Oops! The page you&apos;re looking for doesn&apos;t exist or has been moved.
                Let&apos;s get you back on track.
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 justify-center items-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Button
                  onClick={() => router.push("/")}
                  size="lg"
                  className="bg-primary hover:bg-primary/90"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
                <Button
                  onClick={() => router.back()}
                  variant="outline"
                  size="lg"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Go Back
                </Button>
              </motion.div>

              {/* Decorative Elements */}
              <motion.div
                className="mt-16 relative"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
                </div>
                <div className="relative flex items-center justify-center">
                  <Search className="h-32 w-32 text-muted-foreground/20" />
                </div>
              </motion.div>
            </motion.div>
          </div>
        </main>
      </div>
    </PageTransition>
  );
}

