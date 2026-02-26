import Map "mo:core/Map";
import List "mo:core/List";
import Array "mo:core/Array";
import Principal "mo:core/Principal";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Float "mo:core/Float";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  module ExchangeRates {
    public func getStaticRates() : [(Text, Float)] {
      [
        ("USD", 1.0),
        ("EUR", 0.9),
        ("GBP", 0.8),
        ("CAD", 1.3),
        ("AUD", 1.4),
        ("JPY", 110.0),
        ("NGN", 410.0),
        ("INR", 75.0),
        ("MXN", 20.0),
        ("PHP", 50.0),
      ];
    };

    func findRate(currency : Text) : ?Float {
      for ((curr, rate) in getStaticRates().values()) {
        if (curr == currency) { return ?rate };
      };
      null;
    };

    public func getRate(from : Text, to : Text) : Float {
      let base = switch (findRate(from)) {
        case (null) { Runtime.trap("Unsupported currency: " # from) };
        case (?rate) { rate };
      };
      let target = switch (findRate(to)) {
        case (null) { Runtime.trap("Unsupported currency: " # to) };
        case (?rate) { rate };
      };
      target / base;
    };
  };

  type Recipient = {
    name : Text;
    country : Text;
    accountNumber : Text;
    bankName : Text;
  };

  type Transfer = {
    id : Nat;
    sender : Principal;
    recipient : Recipient;
    amount : Float;
    sourceCurrency : Text;
    destinationCurrency : Text;
    fee : Float;
    exchangeRate : Float;
    status : Bool; // true = completed, false = pending
    timestamp : Int;
  };

  let balances = Map.empty<Principal, Float>();
  let recipients = Map.empty<Principal, List.List<Recipient>>();
  let transfers = Map.empty<Principal, List.List<Transfer>>();
  var nextTransferId : Nat = 1;

  // Access control setup
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
    country : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };

    userProfiles.add(caller, profile);

    switch (balances.get(caller)) {
      case (null) {
        balances.add(caller, 1000.0); // Initial balance
      };
      case (?_) { };
    };
  };

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can access profiles");
    };

    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };

    userProfiles.get(user);
  };

  public shared ({ caller }) func addRecipient(recipient : Recipient) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add recipients");
    };

    let currentRecipients = switch (recipients.get(caller)) {
      case (null) { List.empty<Recipient>() };
      case (?recps) { recps };
    };

    let updatedRecipients = currentRecipients;
    updatedRecipients.put(0, recipient);
    recipients.add(caller, updatedRecipients);
  };

  public query ({ caller }) func getRecipients() : async [Recipient] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view recipients");
    };

    switch (recipients.get(caller)) {
      case (null) { [] };
      case (?recps) { recps.toArray() };
    };
  };

  public shared ({ caller }) func transferMoney(to : Recipient, amount : Float, sourceCurrency : Text, destCurrency : Text) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can transfer money");
    };

    let currentBalance = switch (balances.get(caller)) {
      case (null) { Runtime.trap("Balance not found. Please set up profile first.") };
      case (?bal) { bal };
    };

    let fee = 2.0 + (amount * 0.01);
    let totalAmount = amount + fee;
    let exchangeRate = ExchangeRates.getRate(sourceCurrency, "USD");
    let totalUSD = totalAmount * exchangeRate;

    if (currentBalance < totalUSD) {
      Runtime.trap("Insufficient funds. Current balance is: " # currentBalance.toText() # " USD");
    };

    let newTransfer : Transfer = {
      id = nextTransferId;
      sender = caller;
      recipient = to;
      amount;
      sourceCurrency;
      destinationCurrency = destCurrency;
      fee;
      exchangeRate;
      status = true;
      timestamp = Time.now();
    };

    let senderTransfers = switch (transfers.get(caller)) {
      case (null) { List.empty<Transfer>() };
      case (?tList) { tList };
    };
    let updatedTransfers = senderTransfers;
    updatedTransfers.put(0, newTransfer);
    transfers.add(caller, updatedTransfers);

    balances.add(caller, currentBalance - totalUSD);

    nextTransferId += 1;
    newTransfer.id;
  };

  public query ({ caller }) func getBalance() : async Float {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view balance");
    };

    switch (balances.get(caller)) {
      case (null) { Runtime.trap("Balance not found. Please set up profile first.") };
      case (?bal) { bal };
    };
  };

  public query ({ caller }) func getTransferHistory() : async [Transfer] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view transfer history");
    };

    switch (transfers.get(caller)) {
      case (null) { [] };
      case (?tList) {
        let arr = tList.toArray();
        arr.sort(func(a : Transfer, b : Transfer) : Order.Order {
          Int.compare(b.timestamp, a.timestamp);
        });
      };
    };
  };

  public query ({ caller }) func getExchangeRates() : async [(Text, Float)] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view exchange rates");
    };

    ExchangeRates.getStaticRates();
  };
};
