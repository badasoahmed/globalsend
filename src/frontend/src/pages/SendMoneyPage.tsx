import { useState, useEffect } from "react";
import { ArrowLeft, Check, ChevronRight, Plus, Send, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useGetRecipients,
  useAddRecipient,
  useGetExchangeRates,
  useTransferMoney,
} from "../hooks/useQueries";
import type { Recipient } from "../backend.d";
import {
  CURRENCIES,
  COUNTRIES,
  getCurrencyInfo,
  getCountryFlag,
  formatCurrency,
  calculateFee,
  calculateTotal,
} from "../utils/constants";

type Step = 1 | 2 | 3 | 4; // 4 = success

interface SendMoneyPageProps {
  onBack: () => void;
}

// ─── Step Indicator ─────────────────────────────────────────────────────────

function StepIndicator({ currentStep }: { currentStep: Step }) {
  const steps = [
    { num: 1, label: "Recipient" },
    { num: 2, label: "Amount" },
    { num: 3, label: "Review" },
  ];

  return (
    <div className="flex items-center justify-center gap-1 mb-6">
      {steps.map((step, idx) => {
        const isComplete = currentStep > step.num;
        const isActive = currentStep === step.num;

        return (
          <div key={step.num} className="flex items-center gap-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300",
                  isComplete && "step-complete",
                  isActive && "step-active",
                  !isComplete && !isActive && "step-inactive",
                )}
              >
                {isComplete ? <Check className="w-3.5 h-3.5" /> : step.num}
              </div>
              <span
                className={cn(
                  "text-[9px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground",
                )}
              >
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className={cn(
                  "w-12 h-0.5 mb-4 rounded-full transition-all duration-300",
                  isComplete ? "bg-accent" : "bg-border",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Step 1: Select Recipient ─────────────────────────────────────────────

interface Step1Props {
  selected: Recipient | null;
  onSelect: (r: Recipient) => void;
  onNext: () => void;
}

function Step1SelectRecipient({ selected, onSelect, onNext }: Step1Props) {
  const { data: recipients = [], isLoading } = useGetRecipients();
  const addRecipient = useAddRecipient();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    country: "",
    bankName: "",
    accountNumber: "",
  });

  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.country || !form.bankName || !form.accountNumber) return;

    try {
      await addRecipient.mutateAsync(form as Recipient);
      onSelect(form as Recipient);
      setShowForm(false);
      toast.success("Recipient added!");
    } catch {
      toast.error("Failed to add recipient");
    }
  };

  return (
    <div className="space-y-4 animate-fade-up">
      {!showForm ? (
        <>
          <div>
            <h2 className="font-bold text-foreground text-lg">Select Recipient</h2>
            <p className="text-muted-foreground text-xs mt-0.5">Who are you sending money to?</p>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              {["s1", "s2"].map((k) => (
                <div key={k} className="h-16 rounded-xl bg-secondary/30 animate-pulse" />
              ))}
            </div>
          ) : recipients.length === 0 ? (
            <div className="text-center py-8 space-y-2">
              <p className="text-muted-foreground text-sm">No saved recipients yet</p>
              <p className="text-muted-foreground text-xs">Add your first recipient below</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-0.5">
              {recipients.map((r) => {
                const isSelected = selected?.accountNumber === r.accountNumber && selected?.name === r.name;
                return (
                  <button
                    key={`${r.name}-${r.accountNumber}`}
                    type="button"
                    onClick={() => onSelect(r)}
                    className={cn(
                      "w-full flex items-center gap-3 p-4 rounded-xl transition-all duration-200 text-left",
                      isSelected
                        ? "bg-primary/20 border border-primary/50"
                        : "glass-card hover:border-primary/30 hover:bg-primary/5",
                    )}
                  >
                    <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-xl shrink-0">
                      {getCountryFlag(r.country)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-foreground text-sm">{r.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {r.bankName} · ••••{r.accountNumber.slice(-4)}
                      </p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}

          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="w-full flex items-center gap-3 p-4 rounded-xl border border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all duration-200 text-muted-foreground hover:text-foreground"
          >
            <div className="w-10 h-10 rounded-full bg-secondary/50 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <span className="text-sm font-medium">Add New Recipient</span>
            <ChevronRight className="w-4 h-4 ml-auto" />
          </button>

          <Button
            onClick={onNext}
            disabled={!selected}
            className="w-full bg-primary text-primary-foreground font-semibold h-11 btn-primary-glow rounded-xl"
          >
            Continue
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </>
      ) : (
        <form onSubmit={handleAddRecipient} className="space-y-4 animate-fade-up">
          <div className="flex items-center gap-3 mb-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="font-bold text-foreground text-base">New Recipient</h2>
          </div>

          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Full Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="John Doe"
                className="bg-secondary/50 border-border focus:border-primary text-foreground text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Country</Label>
              <Select value={form.country} onValueChange={(v) => setForm((p) => ({ ...p, country: v }))} required>
                <SelectTrigger className="bg-secondary/50 border-border text-foreground text-sm">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border">
                  {COUNTRIES.map((c) => (
                    <SelectItem key={c.code} value={c.code} className="text-foreground">
                      {c.flag} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Bank Name</Label>
              <Input
                value={form.bankName}
                onChange={(e) => setForm((p) => ({ ...p, bankName: e.target.value }))}
                placeholder="e.g. Chase Bank"
                className="bg-secondary/50 border-border focus:border-primary text-foreground text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Account Number</Label>
              <Input
                value={form.accountNumber}
                onChange={(e) => setForm((p) => ({ ...p, accountNumber: e.target.value }))}
                placeholder="Account or IBAN number"
                className="bg-secondary/50 border-border focus:border-primary text-foreground text-sm font-mono"
                required
              />
            </div>
          </div>

          <Button
            type="submit"
            disabled={addRecipient.isPending}
            className="w-full bg-primary text-primary-foreground font-semibold h-11 btn-primary-glow rounded-xl"
          >
            {addRecipient.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</>
            ) : (
              "Add & Continue"
            )}
          </Button>
        </form>
      )}
    </div>
  );
}

// ─── Step 2: Transfer Details ─────────────────────────────────────────────

interface Step2Props {
  recipient: Recipient;
  amount: string;
  sourceCurrency: string;
  destCurrency: string;
  onAmountChange: (v: string) => void;
  onSourceCurrencyChange: (v: string) => void;
  onDestCurrencyChange: (v: string) => void;
  onNext: () => void;
}

function Step2TransferDetails({
  recipient,
  amount,
  sourceCurrency,
  destCurrency,
  onAmountChange,
  onSourceCurrencyChange,
  onDestCurrencyChange,
  onNext,
}: Step2Props) {
  const { data: exchangeRates } = useGetExchangeRates();

  const numAmount = parseFloat(amount) || 0;
  const fee = calculateFee(numAmount);
  const total = calculateTotal(numAmount);

  const getConvertedAmount = () => {
    if (!exchangeRates || numAmount <= 0) return 0;
    const srcRate = exchangeRates.get(sourceCurrency) ?? 1;
    const dstRate = exchangeRates.get(destCurrency) ?? 1;
    const usdAmount = numAmount / srcRate;
    return usdAmount * dstRate;
  };

  const getExchangeRate = () => {
    if (!exchangeRates) return 0;
    const srcRate = exchangeRates.get(sourceCurrency) ?? 1;
    const dstRate = exchangeRates.get(destCurrency) ?? 1;
    return dstRate / srcRate;
  };

  const convertedAmount = getConvertedAmount();
  const rate = getExchangeRate();

  const srcCurrency = getCurrencyInfo(sourceCurrency);
  const dstCurrency = getCurrencyInfo(destCurrency);

  return (
    <div className="space-y-4 animate-fade-up">
      <div>
        <h2 className="font-bold text-foreground text-lg">Transfer Details</h2>
        <p className="text-muted-foreground text-xs mt-0.5">
          Sending to <span className="text-foreground font-medium">{recipient.name}</span>
        </p>
      </div>

      {/* Amount input */}
      <div className="glass-card rounded-xl p-4 space-y-3">
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">You Send</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => onAmountChange(e.target.value)}
                placeholder="0.00"
                className="bg-secondary/50 border-border focus:border-primary text-foreground text-xl font-bold font-mono h-12 pr-16"
              />
            </div>
            <Select value={sourceCurrency} onValueChange={onSourceCurrencyChange}>
              <SelectTrigger className="w-28 bg-secondary/50 border-border text-foreground font-medium text-sm shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code} className="text-foreground text-sm">
                    {c.flag} {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Divider with rate */}
        <div className="flex items-center gap-2">
          <div className="flex-1 h-px bg-border" />
          <div className="text-xs text-muted-foreground px-2 py-1 bg-secondary/50 rounded-full">
            {rate > 0 ? `1 ${sourceCurrency} = ${rate.toFixed(4)} ${destCurrency}` : "Loading rate..."}
          </div>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Destination */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Recipient Gets</Label>
          <div className="flex gap-2">
            <div className="relative flex-1 h-12 bg-secondary/30 border border-border rounded-md flex items-center px-3">
              <span className="text-xl font-bold text-accent font-mono">
                {convertedAmount > 0 ? convertedAmount.toFixed(destCurrency === "JPY" ? 0 : 2) : "—"}
              </span>
            </div>
            <Select value={destCurrency} onValueChange={onDestCurrencyChange}>
              <SelectTrigger className="w-28 bg-secondary/50 border-border text-foreground font-medium text-sm shrink-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {CURRENCIES.map((c) => (
                  <SelectItem key={c.code} value={c.code} className="text-foreground text-sm">
                    {c.flag} {c.code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Fee breakdown */}
      {numAmount > 0 && (
        <div className="glass-card rounded-xl p-4 space-y-2.5 animate-fade-up">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fee Breakdown</p>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Amount</span>
              <span className="text-foreground font-mono">{formatCurrency(numAmount, sourceCurrency)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Flat fee</span>
              <span className="text-foreground font-mono">{formatCurrency(2, "USD")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Transfer fee (1%)</span>
              <span className="text-foreground font-mono">{formatCurrency(numAmount * 0.01, sourceCurrency)}</span>
            </div>
            <div className="h-px bg-border" />
            <div className="flex justify-between text-sm font-semibold">
              <span className="text-foreground">Total Deducted</span>
              <span className="text-primary font-mono">{formatCurrency(total, sourceCurrency)}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Sparkles className="w-3 h-3 text-accent" />
              Estimated arrival: 1-3 business days
            </div>
          </div>
        </div>
      )}

      <Button
        onClick={onNext}
        disabled={!amount || numAmount <= 0}
        className="w-full bg-primary text-primary-foreground font-semibold h-11 btn-primary-glow rounded-xl"
      >
        Review Transfer
        <ChevronRight className="w-4 h-4 ml-1" />
      </Button>

      <div className="text-center">
        <p className="text-xs text-muted-foreground">
          {srcCurrency.flag} {srcCurrency.name} → {dstCurrency.flag} {dstCurrency.name}
        </p>
      </div>
    </div>
  );
}

// ─── Step 3: Review & Confirm ─────────────────────────────────────────────

interface Step3Props {
  recipient: Recipient;
  amount: string;
  sourceCurrency: string;
  destCurrency: string;
  onConfirm: () => void;
  isLoading: boolean;
}

function Step3ReviewConfirm({
  recipient,
  amount,
  sourceCurrency,
  destCurrency,
  onConfirm,
  isLoading,
}: Step3Props) {
  const { data: exchangeRates } = useGetExchangeRates();

  const numAmount = parseFloat(amount) || 0;
  const fee = calculateFee(numAmount);
  const total = calculateTotal(numAmount);

  const getConvertedAmount = () => {
    if (!exchangeRates || numAmount <= 0) return 0;
    const srcRate = exchangeRates.get(sourceCurrency) ?? 1;
    const dstRate = exchangeRates.get(destCurrency) ?? 1;
    return (numAmount / srcRate) * dstRate;
  };

  const convertedAmount = getConvertedAmount();

  const rows = [
    { label: "To", value: recipient.name },
    { label: "Country", value: `${getCountryFlag(recipient.country)} ${recipient.country}` },
    { label: "Bank", value: recipient.bankName },
    { label: "Account", value: `••••${recipient.accountNumber.slice(-4)}` },
    { label: "You send", value: formatCurrency(numAmount, sourceCurrency), highlight: true },
    { label: "They receive", value: `≈ ${formatCurrency(convertedAmount, destCurrency)}`, accent: true },
    { label: "Fees", value: formatCurrency(fee, sourceCurrency) },
    { label: "Total deducted", value: formatCurrency(total, sourceCurrency), bold: true },
  ];

  return (
    <div className="space-y-4 animate-fade-up">
      <div>
        <h2 className="font-bold text-foreground text-lg">Review Transfer</h2>
        <p className="text-muted-foreground text-xs mt-0.5">Please confirm the details below</p>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        {rows.map(({ label, value, highlight, accent, bold }) => (
          <div
            key={label}
            className="flex items-center justify-between px-4 py-3 border-b border-border last:border-0"
          >
            <span className="text-muted-foreground text-sm">{label}</span>
            <span
              className={cn(
                "text-sm font-mono",
                highlight ? "text-primary font-semibold" : "",
                accent ? "text-accent font-semibold" : "",
                bold ? "text-foreground font-bold" : "text-foreground",
              )}
              style={accent ? { color: "oklch(0.72 0.17 162)" } : undefined}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      <div className="rounded-xl bg-primary/10 border border-primary/20 p-3 flex items-start gap-2">
        <Sparkles className="w-4 h-4 text-primary shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground">
          Estimated arrival: <span className="text-foreground font-medium">1-3 business days</span>. Exchange rates are locked at time of confirmation.
        </p>
      </div>

      <Button
        onClick={onConfirm}
        disabled={isLoading}
        className="w-full bg-primary text-primary-foreground font-semibold h-12 btn-primary-glow rounded-xl text-base"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Send className="w-4 h-4 mr-2" />
            Confirm & Send
          </>
        )}
      </Button>
    </div>
  );
}

// ─── Step 4: Success ──────────────────────────────────────────────────────

function SuccessScreen({
  transferId,
  recipient,
  amount,
  currency,
  onDone,
}: {
  transferId: bigint;
  recipient: Recipient;
  amount: string;
  currency: string;
  onDone: () => void;
}) {
  return (
    <div className="text-center space-y-6 animate-scale-in py-4">
      {/* Celebration icon */}
      <div className="relative mx-auto w-24 h-24">
        <div className="absolute inset-0 rounded-full animate-pulse-glow"
          style={{ background: "oklch(0.72 0.17 162 / 0.2)" }} />
        <div className="w-24 h-24 rounded-full flex items-center justify-center relative z-10"
          style={{ background: "oklch(0.72 0.17 162 / 0.15)", border: "2px solid oklch(0.72 0.17 162 / 0.4)" }}>
          <Check className="w-10 h-10" style={{ color: "oklch(0.72 0.17 162)" }} />
        </div>
      </div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Transfer Sent!</h2>
        <p className="text-muted-foreground text-sm">
          {formatCurrency(parseFloat(amount), currency)} to{" "}
          <span className="text-foreground font-medium">{recipient.name}</span>
        </p>
      </div>

      <div className="glass-card rounded-xl p-4 text-left space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Transfer ID</span>
          <span className="text-foreground font-mono text-xs">#{transferId.toString()}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Recipient</span>
          <span className="text-foreground">{recipient.name}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Status</span>
          <span className="font-semibold text-sm" style={{ color: "oklch(0.72 0.17 162)" }}>
            Processing ✓
          </span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Estimated arrival</span>
          <span className="text-foreground">1-3 business days</span>
        </div>
      </div>

      <Button
        onClick={onDone}
        className="w-full bg-primary text-primary-foreground font-semibold h-11 btn-primary-glow rounded-xl"
      >
        Back to Dashboard
      </Button>
    </div>
  );
}

// ─── Main SendMoneyPage ────────────────────────────────────────────────────

export function SendMoneyPage({ onBack }: SendMoneyPageProps) {
  const [step, setStep] = useState<Step>(1);
  const [selectedRecipient, setSelectedRecipient] = useState<Recipient | null>(null);
  const [amount, setAmount] = useState("");
  const [sourceCurrency, setSourceCurrency] = useState("USD");
  const [destCurrency, setDestCurrency] = useState("EUR");
  const [transferId, setTransferId] = useState<bigint | null>(null);

  const transferMoney = useTransferMoney();

  const handleConfirm = async () => {
    if (!selectedRecipient) return;

    try {
      const id = await transferMoney.mutateAsync({
        recipient: selectedRecipient,
        amount: parseFloat(amount),
        sourceCurrency,
        destCurrency,
      });
      setTransferId(id);
      setStep(4);
    } catch {
      toast.error("Transfer failed. Please try again.");
    }
  };

  const handleBack = () => {
    if (step === 1) {
      onBack();
    } else if (step < 4) {
      setStep((prev) => (prev - 1) as Step);
    }
  };

  if (step === 4 && transferId !== null && selectedRecipient) {
    return (
      <div className="pb-6 animate-fade-up">
        <SuccessScreen
          transferId={transferId}
          recipient={selectedRecipient}
          amount={amount}
          currency={sourceCurrency}
          onDone={onBack}
        />
      </div>
    );
  }

  return (
    <div className="pb-6 space-y-4 animate-fade-up">
      {/* Header */}
      <div className="flex items-center gap-3 pt-1">
        <button
          type="button"
          onClick={handleBack}
          className="w-9 h-9 rounded-xl bg-secondary/50 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h1 className="font-bold text-foreground text-lg">Send Money</h1>
      </div>

      <StepIndicator currentStep={step} />

      {step === 1 && (
        <Step1SelectRecipient
          selected={selectedRecipient}
          onSelect={setSelectedRecipient}
          onNext={() => setStep(2)}
        />
      )}

      {step === 2 && selectedRecipient && (
        <Step2TransferDetails
          recipient={selectedRecipient}
          amount={amount}
          sourceCurrency={sourceCurrency}
          destCurrency={destCurrency}
          onAmountChange={setAmount}
          onSourceCurrencyChange={setSourceCurrency}
          onDestCurrencyChange={setDestCurrency}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && selectedRecipient && (
        <Step3ReviewConfirm
          recipient={selectedRecipient}
          amount={amount}
          sourceCurrency={sourceCurrency}
          destCurrency={destCurrency}
          onConfirm={handleConfirm}
          isLoading={transferMoney.isPending}
        />
      )}
    </div>
  );
}
