const { parseQueryToObject } = require("../src/scryfallQueryParser");

describe("parseQueryToObject()", () => {
  test("parses basic fields", () => {
    expect(parseQueryToObject("t:dragon c:r")).toEqual({
      type_line: ["dragon"],
      colors: ["r"],
    });
  });

  test("handles numeric comparison", () => {
    expect(parseQueryToObject("cmc>3")).toEqual({
      cmc: { ">": 3 },
    });
  });

  test("handles quoted strings", () => {
    expect(parseQueryToObject('o:"draw a card"')).toEqual({
      oracle_text: ["draw a card"],
    });
  });

  test("handles multiple same field tokens", () => {
    expect(parseQueryToObject("t:elf t:dragon")).toEqual({
      type_line: ["elf", "dragon"],
    });
  });

  test("handles negations", () => {
    expect(parseQueryToObject("-t:goblin")).toEqual({
      type_line: { include: [], exclude: ["goblin"] },
    });
  });

  test("handles combined query", () => {
    expect(parseQueryToObject('t:dragon c:r cmc>3 o:"fire"')).toEqual({
      type_line: ["dragon"],
      colors: ["r"],
      cmc: { ">": 3 },
      oracle_text: ["fire"],
    });
  });
});
