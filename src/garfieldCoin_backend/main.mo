import Principal "mo:base/Principal";
import Trie "mo:base/Trie";
import Array "mo:base/Array";
import Buffer "mo:base/Buffer";
import Int "mo:base/Int";
import Time "mo:base/Time";
import Timer "mo:core/Timer";

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
    date: Time.Time;
  }; 

  // Use arrays for stable storage (persistent actor requirement)
  var users : Trie.Trie<Principal, User> = Trie.empty();
  var leaderboard : [ScoreEntry] = [];
  var weeklyWinners : [User] = [];

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
          date = Time.now();
        };

        // Convert to Buffer for efficient operations
        let leaderboardBuffer = Buffer.fromArray<ScoreEntry>(leaderboard);
        leaderboardBuffer.add(newEntry);
        
        // Convert to array, sort, and keep top 20
        let sortedArray = Array.sort<ScoreEntry>(
          Buffer.toArray(leaderboardBuffer),
          func(a: ScoreEntry, b: ScoreEntry) {
            Int.compare(b.score, a.score)
          }
        );
        
        if (sortedArray.size() > 20) {
          leaderboard := Array.subArray(sortedArray, 0, 20);
        } else {
          leaderboard := sortedArray;
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
          wallet = walletAdress
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

  public query func usernameExists(username: Text) : async Bool {
    let usersIter = Trie.iter(users);
    for ((_, user) in usersIter) {
      if (user.username == username) {
        return true;
      };
    };
    false;
  };

  public query func getWeeklyWinners() : async [User] {
    Array.reverse(weeklyWinners);
  };

  public query func getWeeklyWinnersWallets() : async [Text] {
    Array.map<User, Text>(weeklyWinners, func(user) {
      user.wallet
    })
  };

  private func emptyLeaderboardAndAddWeeklyWinner() : async () {
    if (leaderboard.size() > 0) {
      let winner = leaderboard[0];
      
      let winnerKey = { hash = Principal.hash(winner.principal); key = winner.principal };
      switch (Trie.find(users, winnerKey, Principal.equal)) {
        case (?user) {
          let winnersBuffer = Buffer.fromArray<User>(weeklyWinners);
          winnersBuffer.add(user);
          weeklyWinners := Buffer.toArray(winnersBuffer);
        };
        case (null) {
          // Winner not found in users
        };
      };
    };
    leaderboard := [];
  };

  let sevenDays = 7 * 24 * 60 * 60;
  ignore Timer.recurringTimer<system>(#seconds sevenDays, emptyLeaderboardAndAddWeeklyWinner);

  public shared(msg) func manualWeeklyReset() : async Text {
    await emptyLeaderboardAndAddWeeklyWinner();
    return "Weekly reset completed";
  };

  public shared(msg) func manualLeaderboardReset() : async Text {
    leaderboard := [];
    return "Leaderboard reset completed";
  };

  public shared(msg) func manualWeeklyWinnerTableReset() : async Text {
    weeklyWinners := [];
    return "Weekly winner table reset completed";
  };

};