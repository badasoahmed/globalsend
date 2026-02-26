import { ArrowLeft, Clock, Send } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useGetTransferHistory } from "../hooks/useQueries";
import { formatCurrency, formatDate, getCurrencyInfo, getCountryFlag } from "../utils/constants";
import type { Transfer } from "../backend.d";

interface HistoryPageProps {
  onBack: () => void;
}

function HistoryItemSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 glass-card rounded-xl">
      <Skeleton className="w-11 h-11 rounded-full bg-muted shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-32 h-3.5 bg-muted" />
        <Skeleton className="w-24 h-3 bg-muted" />
      </div>
      <div className="space-y-2 text-right">
        <Skeleton className="w-20 h-3.5 bg-muted" />
        <Skeleton className="w-16 h-5 bg-muted rounded-full" />
      </div>
    </div>
  );
}

function HistoryItem({ transfer }: { transfer: Transfer }) {
  const srcCurrency = getCurrencyInfo(transfer.sourceCurrency);
  const destCurrency = getCurrencyInfo(transfer.destinationCurrency);
  const countryFlag = getCountryFlag(transfer.recipient.country);
  const receivedAmount = transfer.amount * transfer.exchangeRate;

  return (
    <div className="flex items-start gap-3 p-4 glass-card rounded-xl hover:border-primary/20 transition-colors duration-150">
      <div className="w-11 h-11 rounded-full bg-secondary flex items-center justify-center text-xl shrink-0">
        {countryFlag}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm">{transfer.recipient.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {transfer.recipient.country} · {transfer.recipient.bankName}
        </p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className="text-xs text-muted-foreground">
            {srcCurrency.flag} {formatCurrency(transfer.amount, transfer.sourceCurrency)}
          </span>
          <span className="text-xs text-muted-foreground">→</span>
          <span
            className="text-xs font-medium"
            style={{ color: "oklch(0.72 0.17 162)" }}
          >
            {destCurrency.flag} {formatCurrency(receivedAmount, transfer.destinationCurrency)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatDate(transfer.timestamp)}
        </p>
      </div>
      <div className="shrink-0 text-right space-y-1">
        <p className="text-sm font-semibold text-foreground font-mono">
          -{formatCurrency(transfer.amount, transfer.sourceCurrency)}
        </p>
        <span
          className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={
            transfer.status
              ? {
                  color: "oklch(0.72 0.17 162)",
                  backgroundColor: "oklch(0.72 0.17 162 / 0.15)",
                  border: "1px solid oklch(0.72 0.17 162 / 0.3)",
                }
              : {
                  color: "oklch(0.78 0.16 68)",
                  backgroundColor: "oklch(0.78 0.16 68 / 0.15)",
                  border: "1px solid oklch(0.78 0.16 68 / 0.3)",
                }
          }
        >
          {transfer.status ? "Completed" : "Pending"}
        </span>
      </div>
    </div>
  );
}

export function HistoryPage({ onBack }: HistoryPageProps) {
  const { data: transfers = [], isLoading } = useGetTransferHistory();

  const sortedTransfers = [...transfers].sort(
    (a, b) => Number(b.timestamp) - Number(a.timestamp),
  );

  return (
    <div className="pb-20 space-y-4 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={onBack}
          className="w-9 h-9 rounded-xl bg-secondary/50 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="font-bold text-foreground text-lg">Transfer History</h1>
          {!isLoading && (
            <p className="text-xs text-muted-foreground">
              {sortedTransfers.length} total transfer{sortedTransfers.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>
      </div>

      <div className="space-y-2">
        {isLoading ? (
          (["h1", "h2", "h3", "h4"]).map((k) => <HistoryItemSkeleton key={k} />)
        ) : sortedTransfers.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-secondary/50 flex items-center justify-center mx-auto">
              <Send className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No transfers yet</p>
              <p className="text-muted-foreground text-sm mt-1">
                Your transfer history will appear here.
              </p>
            </div>
          </div>
        ) : (
          sortedTransfers.map((transfer) => (
            <HistoryItem key={Number(transfer.id)} transfer={transfer} />
          ))
        )}
      </div>
    </div>
  );
}
