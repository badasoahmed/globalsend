import { ArrowUpRight, Send, TrendingUp, Wallet, LogOut, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useInternetIdentity } from "../hooks/useInternetIdentity";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetCallerUserProfile,
  useGetBalance,
  useGetTransferHistory,
} from "../hooks/useQueries";
import { formatCurrency, formatDate, getCurrencyInfo, getCountryFlag } from "../utils/constants";
import type { Transfer } from "../backend.d";

interface DashboardPageProps {
  onNavigate: (page: "send" | "history" | "recipients") => void;
}

function TransactionSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30">
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-full bg-muted" />
        <div className="space-y-1.5">
          <Skeleton className="w-28 h-3.5 bg-muted" />
          <Skeleton className="w-20 h-3 bg-muted" />
        </div>
      </div>
      <div className="space-y-1.5 text-right">
        <Skeleton className="w-20 h-3.5 bg-muted" />
        <Skeleton className="w-14 h-5 bg-muted rounded-full" />
      </div>
    </div>
  );
}

function TransactionRow({ transfer }: { transfer: Transfer }) {
  const srcCurrency = getCurrencyInfo(transfer.sourceCurrency);
  const destCurrency = getCurrencyInfo(transfer.destinationCurrency);
  const countryFlag = getCountryFlag(transfer.recipient.country);

  return (
    <div className="flex items-center justify-between p-4 rounded-xl bg-secondary/30 hover:bg-secondary/50 transition-colors duration-150 group">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg shrink-0">
          {countryFlag}
        </div>
        <div>
          <p className="font-semibold text-foreground text-sm">{transfer.recipient.name}</p>
          <p className="text-xs text-muted-foreground">
            {srcCurrency.flag} {transfer.sourceCurrency} → {destCurrency.flag} {transfer.destinationCurrency}
            {" · "}{formatDate(transfer.timestamp)}
          </p>
        </div>
      </div>
      <div className="text-right space-y-1">
        <p className="font-semibold text-foreground text-sm font-mono">
          -{formatCurrency(transfer.amount, transfer.sourceCurrency)}
        </p>
        <Badge
          variant="secondary"
          className={
            transfer.status
              ? "bg-accent/20 text-accent border-accent/30 text-[10px] px-2 py-0.5"
              : "bg-warning/20 text-warning border-warning/30 text-[10px] px-2 py-0.5"
          }
          style={{
            color: transfer.status
              ? "oklch(0.72 0.17 162)"
              : "oklch(0.78 0.16 68)",
            borderColor: transfer.status
              ? "oklch(0.72 0.17 162 / 0.3)"
              : "oklch(0.78 0.16 68 / 0.3)",
            backgroundColor: transfer.status
              ? "oklch(0.72 0.17 162 / 0.15)"
              : "oklch(0.78 0.16 68 / 0.15)",
          }}
        >
          {transfer.status ? "Completed" : "Pending"}
        </Badge>
      </div>
    </div>
  );
}

export function DashboardPage({ onNavigate }: DashboardPageProps) {
  const { clear } = useInternetIdentity();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useGetCallerUserProfile();
  const { data: balance, isLoading: balanceLoading, refetch: refetchBalance } = useGetBalance();
  const { data: transfers, isLoading: transfersLoading } = useGetTransferHistory();

  const recentTransfers = transfers?.slice(-5).reverse() ?? [];

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className="pb-20 space-y-6 animate-fade-up">
      {/* Header */}
      <header className="flex items-center justify-between pt-2">
        <div>
          {profileLoading ? (
            <Skeleton className="w-32 h-4 bg-muted" />
          ) : (
            <>
              <p className="text-muted-foreground text-xs">{greeting()},</p>
              <h1 className="text-lg font-bold text-foreground">
                {profile?.name ?? "User"}
              </h1>
            </>
          )}
        </div>
        <button
          type="button"
          onClick={handleLogout}
          className="w-9 h-9 rounded-xl bg-secondary/50 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <LogOut className="w-4 h-4" />
        </button>
      </header>

      {/* Balance Card */}
      <div className="balance-display rounded-2xl p-6 space-y-4 animate-fade-up stagger-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wallet className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              Available Balance
            </span>
          </div>
          <button
            type="button"
            onClick={() => refetchBalance()}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {balanceLoading ? (
          <Skeleton className="w-40 h-10 bg-muted/50" />
        ) : (
          <div>
            <p className="text-4xl font-bold text-foreground font-mono tracking-tight">
              ${(balance ?? 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-muted-foreground text-xs mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-accent" />
              USD
            </p>
          </div>
        )}

        <Button
          onClick={() => onNavigate("send")}
          className="w-full bg-primary text-primary-foreground font-semibold h-11 btn-primary-glow rounded-xl"
        >
          <Send className="w-4 h-4 mr-2" />
          Send Money
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-3 animate-fade-up stagger-2">
        {[
          { label: "Send", icon: Send, page: "send" as const },
          { label: "History", icon: ArrowUpRight, page: "history" as const },
          { label: "Recipients", icon: ArrowUpRight, page: "recipients" as const },
        ].map(({ label, icon: Icon, page }) => (
          <button
            key={label}
            type="button"
            onClick={() => onNavigate(page)}
            className="glass-card rounded-xl p-3 flex flex-col items-center gap-2 hover:border-primary/30 hover:bg-primary/5 transition-all duration-200 group"
          >
            <div className="w-9 h-9 rounded-lg bg-primary/10 group-hover:bg-primary/20 flex items-center justify-center transition-colors">
              <Icon className="w-4 h-4 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground group-hover:text-foreground transition-colors">
              {label}
            </span>
          </button>
        ))}
      </div>

      {/* Recent Transactions */}
      <div className="space-y-3 animate-fade-up stagger-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground text-sm">Recent Transfers</h2>
          <button
            type="button"
            onClick={() => onNavigate("history")}
            className="text-primary text-xs font-medium hover:underline"
          >
            View all
          </button>
        </div>

        <div className="space-y-2">
          {transfersLoading ? (
            (["skel-1", "skel-2", "skel-3"]).map((k) => <TransactionSkeleton key={k} />)
          ) : recentTransfers.length === 0 ? (
            <div className="text-center py-10 space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-secondary/50 flex items-center justify-center mx-auto">
                <Send className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">No transfers yet</p>
              <p className="text-muted-foreground text-xs">
                Your recent transfers will appear here.
              </p>
            </div>
          ) : (
            recentTransfers.map((transfer) => (
              <TransactionRow key={Number(transfer.id)} transfer={transfer} />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
