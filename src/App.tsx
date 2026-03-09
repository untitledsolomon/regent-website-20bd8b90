import { Toaster } from "@/components/ui/toaster";
import { CookieConsent } from "@/components/CookieConsent";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { useEffect, lazy, Suspense } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { AuthProvider, useAuth } from "@/hooks/useAuth";

const Index = lazy(() => import("./pages/Index"));
const Platform = lazy(() => import("./pages/Platform"));
const Capabilities = lazy(() => import("./pages/Capabilities"));
const Industries = lazy(() => import("./pages/Industries"));
const Resources = lazy(() => import("./pages/Resources"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const About = lazy(() => import("./pages/About"));
const Demo = lazy(() => import("./pages/Demo"));
const CaseStudies = lazy(() => import("./pages/CaseStudies"));
const CaseStudyDetail = lazy(() => import("./pages/CaseStudyDetail"));
const Careers = lazy(() => import("./pages/Careers"));
const ModuleDetail = lazy(() => import("./pages/ModuleDetail"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const NotFound = lazy(() => import("./pages/NotFound"));

// Admin pages
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./components/admin/AdminLayout"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const PostEditor = lazy(() => import("./pages/admin/PostEditor"));
const CaseStudyList = lazy(() => import("./pages/admin/CaseStudyList"));
const CaseStudyEditor = lazy(() => import("./pages/admin/CaseStudyEditor"));
const ResourceList = lazy(() => import("./pages/admin/ResourceList"));
const ResourceEditor = lazy(() => import("./pages/admin/ResourceEditor"));
const PostList = lazy(() => import("./pages/admin/PostList"));
const SubscriberList = lazy(() => import("./pages/admin/SubscriberList"));
const NewsletterCompose = lazy(() => import("./pages/admin/NewsletterCompose"));
const ConsultationList = lazy(() => import("./pages/admin/ConsultationList"));
const CareerList = lazy(() => import("./pages/admin/CareerList"));
const CareerEditor = lazy(() => import("./pages/admin/CareerEditor"));
const Unsubscribe = lazy(() => import("./pages/Unsubscribe"));

const queryClient = new QueryClient();

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [pathname]);
  return null;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen" />;
  if (!user) return <Navigate to="/admin/login" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  const location = useLocation();
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <main className="pt-16 min-h-screen" role="main">
        <Suspense fallback={<div className="min-h-screen" />}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 16, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.99 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <Routes location={location}>
                <Route path="/" element={<Index />} />
                <Route path="/platform" element={<Platform />} />
                <Route path="/platform/:moduleSlug" element={<ModuleDetail />} />
                <Route path="/capabilities" element={<Capabilities />} />
                <Route path="/industries" element={<Industries />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />
                <Route path="/about" element={<About />} />
                <Route path="/demo" element={<Demo />} />
                <Route path="/case-studies" element={<CaseStudies />} />
                <Route path="/case-studies/:slug" element={<CaseStudyDetail />} />
                <Route path="/careers" element={<Careers />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/unsubscribe" element={<Unsubscribe />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </motion.div>
          </AnimatePresence>
        </Suspense>
      </main>
      <Footer />
    </>
  );
}

function AdminRoutes() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <Routes>
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="posts" element={<PostList />} />
          <Route path="posts/new" element={<PostEditor />} />
          <Route path="posts/:id/edit" element={<PostEditor />} />
          <Route path="case-studies" element={<CaseStudyList />} />
          <Route path="case-studies/new" element={<CaseStudyEditor />} />
          <Route path="case-studies/:id/edit" element={<CaseStudyEditor />} />
          <Route path="resources" element={<ResourceList />} />
          <Route path="resources/new" element={<ResourceEditor />} />
          <Route path="resources/:id/edit" element={<ResourceEditor />} />
          <Route path="careers" element={<CareerList />} />
          <Route path="careers/new" element={<CareerEditor />} />
          <Route path="careers/:id/edit" element={<CareerEditor />} />
          <Route path="subscribers" element={<SubscriberList />} />
          <Route path="newsletter/compose" element={<NewsletterCompose />} />
          <Route path="inquiries" element={<ConsultationList />} />
        </Route>
      </Routes>
    </Suspense>
  );
}

function AppRouter() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith("/admin");

  if (isAdmin) return <AdminRoutes />;
  return <AppRoutes />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppRouter />
          <CookieConsent />
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
