import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";
import type { Recipient, UserProfile, Transfer } from "../backend.d";

// ─── Profile ────────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      await actor.saveCallerUserProfile(profile);
      return profile;
    },
    onSuccess: (profile) => {
      queryClient.setQueryData(["currentUserProfile"], profile);
    },
  });
}

// ─── Balance ─────────────────────────────────────────────────────────────────

export function useGetBalance() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<number>({
    queryKey: ["balance"],
    queryFn: async () => {
      if (!actor) return 0;
      return actor.getBalance();
    },
    enabled: !!actor && !actorFetching,
    refetchInterval: 30_000,
  });
}

// ─── Exchange Rates ───────────────────────────────────────────────────────────

export function useGetExchangeRates() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Map<string, number>>({
    queryKey: ["exchangeRates"],
    queryFn: async () => {
      if (!actor) return new Map();
      const rates = await actor.getExchangeRates();
      return new Map(rates);
    },
    enabled: !!actor && !actorFetching,
    staleTime: 60_000,
  });
}

// ─── Recipients ───────────────────────────────────────────────────────────────

export function useGetRecipients() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Recipient[]>({
    queryKey: ["recipients"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getRecipients();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddRecipient() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recipient: Recipient) => {
      if (!actor) throw new Error("Actor not available");
      await actor.addRecipient(recipient);
      return recipient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipients"] });
    },
  });
}

// ─── Transfers ────────────────────────────────────────────────────────────────

export function useGetTransferHistory() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<Transfer[]>({
    queryKey: ["transferHistory"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTransferHistory();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useTransferMoney() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recipient,
      amount,
      sourceCurrency,
      destCurrency,
    }: {
      recipient: Recipient;
      amount: number;
      sourceCurrency: string;
      destCurrency: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      const transferId = await actor.transferMoney(
        recipient,
        amount,
        sourceCurrency,
        destCurrency,
      );
      return transferId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transferHistory"] });
      queryClient.invalidateQueries({ queryKey: ["balance"] });
    },
  });
}
