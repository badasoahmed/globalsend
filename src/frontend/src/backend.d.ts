import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Transfer {
    id: bigint;
    fee: number;
    status: boolean;
    sourceCurrency: string;
    recipient: Recipient;
    sender: Principal;
    exchangeRate: number;
    destinationCurrency: string;
    timestamp: bigint;
    amount: number;
}
export interface Recipient {
    country: string;
    name: string;
    bankName: string;
    accountNumber: string;
}
export interface UserProfile {
    country: string;
    name: string;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addRecipient(recipient: Recipient): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    getBalance(): Promise<number>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getExchangeRates(): Promise<Array<[string, number]>>;
    getRecipients(): Promise<Array<Recipient>>;
    getTransferHistory(): Promise<Array<Transfer>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    transferMoney(to: Recipient, amount: number, sourceCurrency: string, destCurrency: string): Promise<bigint>;
}
