import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { MailX, CheckCircle2, XCircle, Loader2 } from "lucide-react";

export default function Unsubscribe() {
  const [params] = useSearchParams();
  const email = params.get("email");
  const [status, setStatus] = useState<"loading" | "success" | "error" | "no-email">("loading");

  useEffect(() => {
    if (!email) {
      setStatus("no-email");
      return;
    }

    const unsubscribe = async () => {
      try {
        const { error } = await supabase.functions.invoke("unsubscribe", {
          body: { email },
        });
        setStatus(error ? "error" : "success");
      } catch {
        setStatus("error");
      }
    };

    unsubscribe();
  }, [email]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        {status === "loading" && (
          <>
            <Loader2 size={40} className="text-primary mx-auto mb-4 animate-spin" />
            <h1 className="font-heading text-xl font-semibold text-foreground mb-2">Unsubscribing…</h1>
            <p className="text-sm text-muted-foreground">Please wait a moment.</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 size={40} className="text-emerald-500 mx-auto mb-4" />
            <h1 className="font-heading text-xl font-semibold text-foreground mb-2">You've been unsubscribed</h1>
            <p className="text-sm text-muted-foreground mb-6">
              You won't receive any more emails from Regent Insights. We're sorry to see you go.
            </p>
            <Link to="/" className="text-sm text-primary hover:underline">← Back to site</Link>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle size={40} className="text-destructive mx-auto mb-4" />
            <h1 className="font-heading text-xl font-semibold text-foreground mb-2">Something went wrong</h1>
            <p className="text-sm text-muted-foreground mb-6">
              We couldn't process your unsubscribe request. Please try again or contact us.
            </p>
            <Link to="/" className="text-sm text-primary hover:underline">← Back to site</Link>
          </>
        )}
        {status === "no-email" && (
          <>
            <MailX size={40} className="text-muted-foreground mx-auto mb-4" />
            <h1 className="font-heading text-xl font-semibold text-foreground mb-2">Invalid link</h1>
            <p className="text-sm text-muted-foreground mb-6">
              This unsubscribe link appears to be invalid. Please use the link from your email.
            </p>
            <Link to="/" className="text-sm text-primary hover:underline">← Back to site</Link>
          </>
        )}
      </div>
    </div>
  );
}
