import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { Button } from "@/components/ui/button";
import { Loader2, Globe, Zap, ShieldCheck, TrendingDown, ArrowRight } from "lucide-react";

const FEATURE_HIGHLIGHTS = [
  {
    icon: Zap,
    title: "Lightning Fast",
    description: "Transfers processed in 1-3 business days worldwide",
  },
  {
    icon: ShieldCheck,
    title: "Bank-Grade Security",
    description: "End-to-end encrypted, built on the Internet Computer",
  },
  {
    icon: TrendingDown,
    title: "Low Fees",
    description: "Just $2 flat + 1% — no hidden charges ever",
  },
];

export function LoginPage() {
  const { login, isLoggingIn } = useInternetIdentity();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12 relative overflow-hidden">
      {/* Decorative background orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full opacity-10 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, oklch(0.60 0.22 255), transparent 70%)" }}
      />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full opacity-8 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, oklch(0.72 0.17 162), transparent 70%)" }}
      />

      <div className="relative z-10 w-full max-w-sm mx-auto space-y-10">
        {/* Logo & Title */}
        <div className="text-center space-y-6 animate-fade-up">
          <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
            <div className="absolute inset-0 rounded-3xl bg-primary/20 animate-pulse-glow" />
            <img
              src="/assets/generated/globalsend-logo-transparent.dim_120x120.png"
              alt="GlobalSend"
              className="w-20 h-20 relative z-10 drop-shadow-lg"
            />
          </div>

          <div>
            <h1 className="text-4xl font-bold tracking-tight gradient-text">
              GlobalSend
            </h1>
            <p className="mt-2 text-muted-foreground text-base leading-relaxed">
              Send money worldwide,<br />
              <span className="text-foreground font-medium">fast and secure</span>
            </p>
          </div>
        </div>

        {/* Feature highlights */}
        <div className="space-y-3 animate-fade-up stagger-2">
          {FEATURE_HIGHLIGHTS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="glass-card rounded-xl p-4 flex items-start gap-3 hover:border-primary/30 transition-colors duration-200"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/15 flex items-center justify-center shrink-0 mt-0.5">
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-foreground text-sm">{title}</p>
                <p className="text-muted-foreground text-xs mt-0.5 leading-relaxed">
                  {description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="space-y-4 animate-fade-up stagger-4">
          <Button
            onClick={login}
            disabled={isLoggingIn}
            className="w-full h-13 text-base font-semibold bg-primary text-primary-foreground btn-primary-glow rounded-xl"
            size="lg"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                Get Started
                <ArrowRight className="w-5 h-5 ml-2" />
              </>
            )}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Secured by Internet Identity · Powered by ICP
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-6 left-0 right-0 text-center">
        <p className="text-xs text-muted-foreground">
          © 2026. Built with ❤️ using{" "}
          <a
            href="https://caffeine.ai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
    </div>
  );
}
