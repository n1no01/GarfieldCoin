import Principal "mo:base/Principal";
import Trie "mo:base/Trie";
import Array "mo:base/Array";
import Int "mo:base/Int";
import Timer "mo:base/Timer";
import Time "mo:base/Time";

persistent actor {

  public type User = {
    principal: Principal;
    username: Text;
    wallet: Text;
  };

  public type ScoreEntry = {
    principal: Principal;
    username: Text;
    score: Nat;
  };

  public type WeeklyWinner = {
    principal: Principal;
    username: Text;
    score: Nat;
    weekEndDate: Int; // Timestamp when they won
  };

  var weeklyWinners : [WeeklyWinner] = [];

  var users : Trie.Trie<Principal, User> = Trie.empty();
  var leaderboard : [ScoreEntry] = [];

  public shared(msg) func submitScore(score: Nat) : async Text {
    let caller = msg.caller;
    let userKey = { hash = Principal.hash(caller); key = caller };
    
    switch (Trie.find(users, userKey, Principal.equal)) {
      case (null) {
        return "User not registered.";
      };
      case (?user) {
        let newEntry: ScoreEntry = {
          principal = caller;
          username = user.username;
          score = score;
        };

        leaderboard := Array.sort<ScoreEntry>(
          Array.append<ScoreEntry>(leaderboard, [newEntry]),
          func(a: ScoreEntry, b: ScoreEntry) {
            Int.compare(b.score, a.score);
          }
        );

        if (leaderboard.size() > 20) {
          leaderboard := Array.subArray(leaderboard, 0, 20);
        };

        return "Score submitted!";
      };
    };
  };

  public query func getLeaderboard() : async [ScoreEntry] {
    leaderboard;
  };

  public query func getLeaderboardPrincipals() : async [Text] {
    Array.map<ScoreEntry, Text>(leaderboard, func(entry) {
      Principal.toText(entry.principal)
    })
  };

  public shared(msg) func registerUser(userName: Text, walletAdress: Text) : async Text {
    let caller = msg.caller;
    
    if (Principal.isAnonymous(caller)) {
      return "Anonymous principal not allowed";
    };
    
    if (userName == "" or walletAdress == "") {
      return "Username and wallet address cannot be empty";
    };
    
    let userKey = { hash = Principal.hash(caller); key = caller };
    
    switch (Trie.find(users, userKey, Principal.equal)) {
      case (null) {
        let newUser: User = {
          principal = caller;
          username = userName;
          wallet = walletAdress;
        };
        let (newUsers, _) = Trie.put(users, userKey, Principal.equal, newUser);
        users := newUsers;
        return "User registered successfully!";
      };
      case (_) {
        return "User already registered.";
      };
    };
  };

  public query func getUser(principal: Text) : async ?User {
    let principalObj = Principal.fromText(principal);
    let userKey = { hash = Principal.hash(principalObj); key = principalObj };
    Trie.find(users, userKey, Principal.equal);
  };

  public query func userExists(principal: Text) : async Bool {
    let principalObj = Principal.fromText(principal);
    let userKey = { hash = Principal.hash(principalObj); key = principalObj };
    switch (Trie.find(users, userKey, Principal.equal)) {
      case (null) { false };
      case (_) { true };
    };
  };
};