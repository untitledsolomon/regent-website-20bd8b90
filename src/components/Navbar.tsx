import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Icons } from "./Icons";
import { motion } from "framer-motion";

const links = [
  { label: "Solutions", to: "/platform" },
  { label: "Capabilities", to: "/capabilities" },
  { label: "Industries", to: "/industries" },
  { label: "Case Studies", to: "/case-studies" },
  { label: "Resources", to: "/resources" },
  { label: "Blog", to: "/blog" },
  { label: "Careers", to: "/careers" },
  { label: "About", to: "/about" },
];

export function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-[100] h-16 bg-background/92 backdrop-blur-[20px] border-b border-border">
        <div className="section-container w-full h-full flex items-center justify-between">
          <Link to="/" className="font-heading font-semibold text-lg tracking-[-0.03em] text-text-primary shrink-0">
            Regent<span className="text-primary">.</span>
          </Link>

          <ul className="hidden lg:flex items-center gap-1">
            {links.map((l) => (
              <li key={l.to}>
                <Link
                  to={l.to}
                  className={`relative text-sm px-3 py-1.5 rounded-md transition-colors ${
                    location.pathname === l.to
                      ? "text-text-primary"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface"
                  }`}
                >
                  {l.label}
                  {location.pathname === l.to && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute bottom-0 left-3 right-3 h-[2px] bg-primary rounded-full"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-3">
            <Link
              to="/demo"
              className="hidden sm:inline-flex font-heading text-[13px] font-medium tracking-[-0.01em] bg-text-primary text-background border-none rounded-lg px-[18px] py-[9px] items-center gap-1.5 hover:shadow-lg hover:-translate-y-px transition-all"
            >
              Start a Project <Icons.ArrowRight />
            </Link>
            <button
              className="lg:hidden flex items-center p-2 text-text-primary"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
            >
              {menuOpen ? <Icons.X /> : <Icons.Menu />}
            </button>
          </div>
        </div>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 top-16 bg-background z-[200] lg:hidden overflow-y-auto">
          <div className="p-5">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                onClick={() => setMenuOpen(false)}
                className={`block py-3.5 border-b border-border text-lg font-heading font-medium ${
                  location.pathname === l.to ? "text-primary" : "text-text-primary"
                }`}
              >
                {l.label}
              </Link>
            ))}
            <div className="mt-6">
              <Link
                to="/demo"
                onClick={() => setMenuOpen(false)}
                className="block w-full text-center font-heading text-[15px] font-medium bg-primary text-primary-foreground rounded-lg py-3.5"
              >
                Start a Project
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
