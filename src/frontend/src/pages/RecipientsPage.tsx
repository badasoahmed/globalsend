import { useState } from "react";
import { ArrowLeft, Plus, User, X, Loader2, Users } from "lucide-react";
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
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useGetRecipients, useAddRecipient } from "../hooks/useQueries";
import type { Recipient } from "../backend.d";
import { COUNTRIES, getCountryFlag } from "../utils/constants";

interface RecipientsPageProps {
  onBack: () => void;
}

function RecipientCard({ recipient }: { recipient: Recipient }) {
  const flag = getCountryFlag(recipient.country);

  return (
    <div className="glass-card rounded-xl p-4 flex items-center gap-3 hover:border-primary/20 transition-all duration-150 animate-fade-up">
      <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-2xl shrink-0">
        {flag}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm">{recipient.name}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{recipient.bankName}</p>
        <p className="text-xs text-muted-foreground mt-0.5 font-mono">
          ••••{recipient.accountNumber.slice(-4)}
        </p>
      </div>
      <div className="shrink-0 text-right">
        <span className="text-xs text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
          {recipient.country}
        </span>
      </div>
    </div>
  );
}

function RecipientSkeleton() {
  return (
    <div className="glass-card rounded-xl p-4 flex items-center gap-3">
      <Skeleton className="w-12 h-12 rounded-2xl bg-muted shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="w-28 h-3.5 bg-muted" />
        <Skeleton className="w-20 h-3 bg-muted" />
      </div>
    </div>
  );
}

export function RecipientsPage({ onBack }: RecipientsPageProps) {
  const { data: recipients = [], isLoading } = useGetRecipients();
  const addRecipient = useAddRecipient();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<Recipient>({
    name: "",
    country: "",
    bankName: "",
    accountNumber: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.country || !form.bankName || !form.accountNumber) return;

    try {
      await addRecipient.mutateAsync(form);
      setShowForm(false);
      setForm({ name: "", country: "", bankName: "", accountNumber: "" });
      toast.success("Recipient added successfully!");
    } catch {
      toast.error("Failed to add recipient");
    }
  };

  return (
    <div className="pb-20 space-y-4 animate-fade-up">
      {/* Header */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="w-9 h-9 rounded-xl bg-secondary/50 hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="font-bold text-foreground text-lg">Recipients</h1>
            {!isLoading && (
              <p className="text-xs text-muted-foreground">
                {recipients.length} saved recipient{recipients.length !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        </div>
        <Button
          size="sm"
          onClick={() => setShowForm(true)}
          className="bg-primary text-primary-foreground font-medium rounded-lg"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add
        </Button>
      </div>

      {/* Recipient List */}
      <div className="space-y-2">
        {isLoading ? (
          (["r1", "r2", "r3"]).map((k) => <RecipientSkeleton key={k} />)
        ) : recipients.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-secondary/50 flex items-center justify-center mx-auto">
              <Users className="w-7 h-7 text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-foreground">No recipients yet</p>
              <p className="text-muted-foreground text-sm mt-1">
                Add recipients to send money quickly.
              </p>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-primary text-primary-foreground font-semibold btn-primary-glow"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Your First Recipient
            </Button>
          </div>
        ) : (
          recipients.map((r) => (
            <RecipientCard key={`${r.name}-${r.accountNumber}`} recipient={r} />
          ))
        )}
      </div>

      {/* Add Recipient Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="glass-card border-border max-w-sm animate-scale-in">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2 text-foreground font-bold">
                <User className="w-5 h-5 text-primary" />
                New Recipient
              </DialogTitle>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="w-7 h-7 rounded-lg bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4 mt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Full Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="Jane Smith"
                className="bg-secondary/50 border-border focus:border-primary text-foreground text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Country</Label>
              <Select
                value={form.country}
                onValueChange={(v) => setForm((p) => ({ ...p, country: v }))}
                required
              >
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
                placeholder="e.g. Barclays"
                className="bg-secondary/50 border-border focus:border-primary text-foreground text-sm"
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Account Number / IBAN</Label>
              <Input
                value={form.accountNumber}
                onChange={(e) => setForm((p) => ({ ...p, accountNumber: e.target.value }))}
                placeholder="GB29 NWBK 6016 1331 9268 19"
                className="bg-secondary/50 border-border focus:border-primary text-foreground text-sm font-mono"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={addRecipient.isPending}
              className="w-full bg-primary text-primary-foreground font-semibold h-11 btn-primary-glow rounded-xl"
            >
              {addRecipient.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Recipient"
              )}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
