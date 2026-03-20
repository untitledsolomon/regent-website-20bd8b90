"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { motion } from "framer-motion";
import { PageMeta } from "@/components/PageMeta";

const NotFound = () => {
  const pathname = usePathname();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", pathname);
  }, [pathname]);

  return (
    <>
      <PageMeta title="Page Not Found — Regent Systems" description="The page you're looking for doesn't exist." />
      <div className="flex min-h-[80vh] items-center justify-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-md px-6"
        >
          <div className="font-heading text-8xl font-bold text-primary/20 mb-4">404</div>
          <h1 className="font-heading text-2xl font-semibold text-foreground mb-3">Page not found</h1>
          <p className="text-muted-foreground mb-8 leading-relaxed">
            The page at <code className="text-sm bg-muted px-1.5 py-0.5 rounded">{pathname}</code> doesn't exist or has been moved.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-medium rounded-lg px-6 py-3 hover:bg-primary/90 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 8H4M7 4l-4 4 4 4" />
            </svg>
            Back to Home
          </Link>
        </motion.div>
      </div>
    </>
  );
};

export default NotFound;
