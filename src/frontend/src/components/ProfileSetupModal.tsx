import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Globe, Loader2, User } from "lucide-react";
import { useSaveCallerUserProfile } from "../hooks/useQueries";
import { COUNTRIES } from "../utils/constants";
import { toast } from "sonner";

interface ProfileSetupModalProps {
  open: boolean;
}

export function ProfileSetupModal({ open }: ProfileSetupModalProps) {
  const [name, setName] = useState("");
  const [country, setCountry] = useState("");
  const saveProfile = useSaveCallerUserProfile();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !country) return;

    try {
      await saveProfile.mutateAsync({ name: name.trim(), country });
      toast.success("Profile saved! Welcome to GlobalSend.");
    } catch {
      toast.error("Failed to save profile. Please try again.");
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="glass-card border-border max-w-md animate-scale-in"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center">
            <Globe className="w-7 h-7 text-primary" />
          </div>
          <DialogTitle className="text-2xl font-bold gradient-text">
            Welcome to GlobalSend
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-sm">
            Let's set up your profile to get started with international transfers.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-foreground font-medium flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              Full Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="bg-secondary/50 border-border focus:border-primary focus:ring-primary/30 text-foreground placeholder:text-muted-foreground"
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground font-medium flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              Country of Residence
            </Label>
            <Select value={country} onValueChange={setCountry} required>
              <SelectTrigger className="bg-secondary/50 border-border focus:border-primary text-foreground">
                <SelectValue placeholder="Select your country" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code} className="text-foreground hover:bg-muted">
                    <span className="flex items-center gap-2">
                      <span>{c.flag}</span>
                      <span>{c.name}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button
            type="submit"
            disabled={!name.trim() || !country || saveProfile.isPending}
            className="w-full bg-primary text-primary-foreground font-semibold h-11 btn-primary-glow"
          >
            {saveProfile.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Get Started"
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
