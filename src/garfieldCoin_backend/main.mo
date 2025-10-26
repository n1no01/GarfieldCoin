import Nat "mo:base/Nat";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";

persistent actor {

  public type User = {
    principal: Principal;
    username: Text;
    wallet: Text;
  };

  // Map of users by principal
  transient var users = HashMap.HashMap<Principal, User>(0, Principal.equal, Principal.hash);
  

  public shared(msg) func registerUser(userName: Text, walletAdress: Text) : async Text {
    let caller = msg.caller;

    switch (users.get(caller)) {
      case (null) {
        let newUser: User = {
          principal = caller;
          username = userName;
          wallet = walletAdress;
        };
        users.put(caller, newUser);
        return "User registered successfully!";
      };
      case (_) {
        return "User already registered.";
      };
    };
  };
};
