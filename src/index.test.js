import { expect, test } from "vitest";
import { createLexer } from "./index.js";

const tokenDefs = [
  {
    type: "Operation",
    pattern: /\+/,
  },
  {
    type: "Operation",
    pattern: /-/,
  },
  {
    type: "Identifier",
    pattern: /[a-z]\w+/,
  },
  {
    type: "NumberLiteral",
    pattern: /\d+/,
  },
  {
    type: "Space",
    pattern: /\s+/,
  },
];

test("example", () => {
  const lexer = createLexer(tokenDefs);

  const array = lexer.toArray("foo  + bar2-34");
  expect(array).toEqual([
    {
      type: "Identifier",
      value: "foo",
    },
    {
      type: "Space",
      value: "  ",
    },
    {
      type: "Operation",
      value: "+",
    },
    {
      type: "Space",
      value: " ",
    },
    {
      type: "Identifier",
      value: "bar2",
    },
    {
      type: "Operation",
      value: "-",
    },
    {
      type: "NumberLiteral",
      value: "34",
    },
  ]);
});

test("reject spaces", () => {
  const lexer = createLexer(tokenDefs, {
    reject: ["Space"],
  });

  const array = lexer.toArray("foo  + bar2-34");
  expect(array).toEqual([
    {
      type: "Identifier",
      value: "foo",
    },
    {
      type: "Operation",
      value: "+",
    },
    {
      type: "Identifier",
      value: "bar2",
    },
    {
      type: "Operation",
      value: "-",
    },
    {
      type: "NumberLiteral",
      value: "34",
    },
  ]);
});

test("with empty rest", () => {
  const lexer = createLexer(tokenDefs, { withRest: true });

  const array = lexer.toArray("2+3");
  expect(array).toEqual([
    {
      type: "NumberLiteral",
      value: "2",
    },
    {
      type: "Operation",
      value: "+",
    },
    {
      type: "NumberLiteral",
      value: "3",
    },
    {
      type: null,
      value: "",
    },
  ]);
});

test("with non-empty rest", () => {
  const lexer = createLexer(tokenDefs, { withRest: true });

  const array = lexer.toArray("2+3.");
  expect(array).toEqual([
    {
      type: "NumberLiteral",
      value: "2",
    },
    {
      type: "Operation",
      value: "+",
    },
    {
      type: "NumberLiteral",
      value: "3",
    },
    {
      type: null,
      value: ".",
    },
  ]);
});

test("with no token definitions", () => {
  const lexer = createLexer([], { withRest: true });

  const array = lexer.toArray("2+3.");
  expect(array).toEqual([
    {
      type: null,
      value: "2+3.",
    },
  ]);
});

test("with empty source", () => {
  const lexer = createLexer(tokenDefs, { withRest: true });

  const array = lexer.toArray("");
  expect(array).toEqual([
    {
      type: null,
      value: "",
    },
  ]);
});

test("iterable + reduce", () => {
  const lexer = createLexer(tokenDefs, { reject: ["Space"] });

  const result = lexer.toIterable("2 + 3 -4").reduce(
    (result, { type, value }) => {
      if (type === "NumberLiteral") {
        const number = parseInt(value, 10);
        return result(number);
      } else if (type === "Operation") {
        if (value === "+") {
          return (number) => result + number;
        }
        return (number) => result - number;
      }
    },
    (number) => number,
  );
  expect(result).toBe(1);
});
