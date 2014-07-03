var expect = require('expect.js');
var deepEqual = require("deep-equal");
var multisort = require("./multisort");

var assertObjectEquals = function assertObjectEquals(actual, expected){
  if (!deepEqual(actual, expected)){
    console.log("\n\nActual:");
    console.log(JSON.stringify(actual, null, 2));
    console.log("\n\nExpected:");
    console.log(JSON.stringify(expected, null, 2));
    console.log("\n\n");
    expect().fail();
    return false;
  }
  return true;
};

describe("Multisort Tests -", function() {

  var gameShowHosts;

  // For easy assertions when sorting "game show hosts"
  var hostIds = function() {
    return gameShowHosts.map(function(e) {return e.id;});
  };

  beforeEach(function() {
    gameShowHosts = [
      {
        id: 1,
        name: {
          first: "Bob",
          last: "Barker"
        },
        retired: true,
        fame: 2,
        show: "The Price is Right",
        say: {
          name: function() {
            return "Bob Barker";
          },
          catchphrase: function(exclaimations) {
            if (!exclaimations) throw "No arguments passed" // To test that sorting function passes arguments in.
            var catchphrase = "Come on down";
            for (var i = 0; i < exclaimations; i++) {
              catchphrase = catchphrase + "!";
            }
            return catchphrase;
          }
        }
      },
      {
        id: 2,
        name: {
          first: "Regis",
          last: "Philbin"
        },
        retired: true,
        fame: 3,
        show: "Who Wants to be a Millionaire",
        say: {
          name: function() {
            return "Regis Philbin";
          },
          catchphrase: function(questionMarks) {
            if (!questionMarks) throw "No arguments passed"
            var catchphrase = "Is that your final answer";
            for (var i = 0; i < questionMarks; i++) {
              catchphrase = catchphrase + "?";
            }
            return catchphrase;
          }
        }
      },
      {
        id: 3,
        name: {
          first: "Alex",
          last: "Trebek"
        },
        fame: 3,
        show: "Jeopardy",
        say: {
          name: function() {
            return "Alex Trebek";
          },
          catchphrase: function(exclaimations) {
            if (!exclaimations) throw "No arguments passed"
            var catchphrase = "This is Jeopardy";
            for (var i = 0; i < exclaimations; i++) {
              catchphrase = catchphrase + "!";
            }
            return catchphrase;
          }
        }
      },
      {
        id: 4,
        name: {
          first: "Ben",
          last: "Bailey"
        },
        show: "Cash Cab",
        fame: 1,
        retired: true,
        say: {
          name: function() {
            return "Ben Bailey";
          },
          catchphrase: function(exclaimations) {
            if (!exclaimations) throw "No arguments passed"
            var catchphrase = "You're in The Cash Cab";
            for (var i = 0; i < exclaimations; i++) {
              catchphrase = catchphrase + "!";
            }
            return catchphrase;
          }
        }
      },
      {
        id: 5,
        name: {
          first: "Pat",
          last: "Sajak"
        },
        fame: 2,
        show: "Wheel of Fortune",
        say: {
          name: function() {
            return "Pat Sajak";
          },
          catchphrase: function(exclaimations) {
            if (!exclaimations) throw "No arguments passed"
            var catchphrase = "Give the wheel a spin";
            for (var i = 0; i < exclaimations; i++) {
              catchphrase = catchphrase + "!";
            }
            return catchphrase;
          }
        }
      }
    ];
  });

  describe("numerical criterion -", function() {
    it("sorts ascending if number is non-negative", function() {
      var input = [3, 4, 2, 5, 1];
      multisort(input, 1);
      assertObjectEquals(input, [1, 2, 3, 4, 5]);
    });

    it("sorts descending if number is negative", function() {
      var input = [3, 4, 2, 5, 1];
      multisort(input, -1);
      assertObjectEquals(input, [5, 4, 3, 2, 1]);
    });
  });

  describe("one function criterion -", function() {
    it("identity function", function() {
      var input = [1, 3, 2, 5, 4];
      multisort(input, function(a) {return a;});
      assertObjectEquals(input, [1, 2, 3, 4, 5]);
    });

    it("mathematical function", function() {
      var input = [1, 3, 2, 5, 4];
      multisort(input, function(a) {return Math.abs(2.1 - a);});
      assertObjectEquals(input, [2, 3, 1, 4, 5]);
    });

    it("typecasting function", function() {
      var input = [null, undefined, 1, "asdf"];
      multisort(input, function(a) {return String(a)});
      // issues with deepEqual and undefined values...
      expect(input[0]).to.be(1);
      expect(input[1]).to.be("asdf");
      expect(input[2]).to.be(null);
      expect(input[3]).to.be(undefined);
    });
  });

  describe("one string criterion -", function() {
    it("empty string gives default sort", function() {
      var input = ["a", "b", "ab", "ba"];
      multisort(input, '');
      assertObjectEquals(input, ["a", "ab", "b", "ba"]);
    });

    it("length property", function() {
      var input = ["hello", [1], [1, 2], []];
      multisort(input, 'length');
      assertObjectEquals(input, [[], [1], [1, 2], "hello"]);
    });

    it("reversed length property", function() {
      var input = ["hello", [1], [1, 2], []];
      multisort(input, '~length');
      assertObjectEquals(input, ["hello", [1, 2], [1], []]);
    });

    it("length property which is undefined on some members", function() {
      var input = ["hello", [1], [1, 2], [], 1];
      multisort(input, '~length');
      assertObjectEquals(input, ["hello", [1, 2], [1], [], 1]);
    });

    it("root-level object property", function() {
      multisort(gameShowHosts, "show");
      assertObjectEquals(hostIds(), [4, 3, 1, 5, 2]);
    });

    it("explicit nested object property", function() {
      multisort(gameShowHosts, "!name.last");
      assertObjectEquals(hostIds(), [3, 5, 2, 1, 4]);
    });

    it("implicit nested object property", function() {
      multisort(gameShowHosts, "name.first.length");
      assertObjectEquals(hostIds(), [1, 4, 5, 3, 2]);
    });

    it("functional property (without arguments)", function() {
      multisort(gameShowHosts, "say.name()");
      assertObjectEquals(hostIds(), [3, 4, 1, 5, 2]);
    });

    it("functional property (with arguments)", function() {
      multisort(gameShowHosts, "~say.catchphrase(3)");
      assertObjectEquals(hostIds(), [4, 3, 2, 5, 1]);
    });
  });


  describe("multiple criteria", function() {
    it("three mathematical functions", function() {
      var input = [8, 7, 6, 5, 4, 3, 2, 1];
      multisort(input, [
        function(a) {return a % 2},
        function(a) {return a % 3},
        function(a) {return a}
      ]);
      assertObjectEquals(input, [6, 4, 2, 8, 3, 1, 7, 5]);
    });

    it("several nested properties", function() {
      multisort(gameShowHosts, [
        "~fame",
        "retired",
        "name.last"
      ]);
      assertObjectEquals(hostIds(), [3, 2, 5, 1, 4])
    });

  });
});
