import { useState } from "react";
import { Toaster } from "@/components/ui/sonner";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import { useGetCallerUserProfile } from "./hooks/useQueries";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { SendMoneyPage } from "./pages/SendMoneyPage";
import { HistoryPage } from "./pages/HistoryPage";
import { RecipientsPage } from "./pages/RecipientsPage";
import { ProfileSetupModal } from "./components/ProfileSetupModal";
import { BottomNav } from "./components/BottomNav";
import { Skeleton } from "@/components/ui/skeleton";

type Page = "dashboard" | "send" | "history" | "recipients";

function LoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-6">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-2xl bg-primary/20 animate-pulse" />
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center relative z-10">
          <img
            src="/assets/generated/globalsend-logo-transparent.dim_120x120.png"
            alt="GlobalSend"
            className="w-16 h-16 drop-shadow-lg"
          />
        </div>
      </div>
      <div className="space-y-2 w-48">
        <Skeleton className="h-3 bg-muted rounded-full" />
        <Skeleton className="h-3 bg-muted rounded-full w-3/4 mx-auto" />
      </div>
    </div>
  );
}

export default function App() {
  const { identity, isInitializing } = useInternetIdentity();
  const isAuthenticated = !!identity;

  const [currentPage, setCurrentPage] = useState<Page>("dashboard");

  const { data: userProfile, isLoading: profileLoading, isFetched: profileFetched } =
    useGetCallerUserProfile();

  const showProfileSetup =
    isAuthenticated && !profileLoading && profileFetched && userProfile === null;

  if (isInitializing) {
    return (
      <>
        <LoadingScreen />
        <Toaster richColors theme="dark" position="top-center" />
      </>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <LoginPage />
        <Toaster richColors theme="dark" position="top-center" />
      </>
    );
  }

  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  const renderPage = () => {
    switch (currentPage) {
      case "dashboard":
        return (
          <DashboardPage
            onNavigate={(page) => handleNavigate(page)}
          />
        );
      case "send":
        return (
          <SendMoneyPage
            onBack={() => handleNavigate("dashboard")}
          />
        );
      case "history":
        return (
          <HistoryPage
            onBack={() => handleNavigate("dashboard")}
          />
        );
      case "recipients":
        return (
          <RecipientsPage
            onBack={() => handleNavigate("dashboard")}
          />
        );
      default:
        return (
          <DashboardPage
            onNavigate={(page) => handleNavigate(page)}
          />
        );
    }
  };

  return (
    <>
      {/* Profile setup modal - shown on first login */}
      <ProfileSetupModal open={showProfileSetup} />

      {/* Main layout */}
      <div className="min-h-screen flex flex-col">
        <main className="flex-1 max-w-lg mx-auto w-full px-4 pt-6">
          {renderPage()}
        </main>

        {/* Bottom nav only shown when not in send flow */}
        {currentPage !== "send" && (
          <BottomNav currentPage={currentPage} onNavigate={handleNavigate} />
        )}
      </div>

      <Toaster richColors theme="dark" position="top-center" />
    </>
  );
}
