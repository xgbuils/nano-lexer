const parseTokenDef = ({ pattern, type }) => ({
  type,
  pattern: new RegExp(pattern.source, "my"),
});

const createLexerIterator = (
  tokenDefs,
  source,
  { withRest = false, reject = [] } = {},
) => {
  const parsedTokenDefs = tokenDefs.map(parseTokenDef);
  let lastIndex = 0;
  let sourceRest = null;

  const findToken = (tokenDefs) => {
    for (const tokenDef of tokenDefs) {
      const { pattern, type } = tokenDef;
      pattern.lastIndex = lastIndex;
      const match = pattern.exec(source) ?? [];
      if (match[0]) {
        lastIndex = pattern.lastIndex;
        return {
          type,
          value: match[0],
        };
      }
    }
    return null;
  };

  const findValidToken = (tokenDefs) => {
    let token;
    do {
      token = findToken(tokenDefs);
    } while (token && reject.includes(token.type));
    return token;
  };

  return {
    next: () => {
      if (sourceRest !== null) {
        return {
          done: true,
          value: {
            type: null,
            value: sourceRest,
          },
        };
      }
      const token = findValidToken(parsedTokenDefs);
      if (!token) {
        const value = source.slice(lastIndex);
        const result = {
          done: !withRest,
          value: {
            type: null,
            value,
          },
        };
        sourceRest = value;
        return result;
      }
      return {
        value: token,
      };
    },
  };
};

export const createLexer = (tokenDefs, options) => ({
  toIterable(source) {
    return {
      [Symbol.iterator]: () => createLexerIterator(tokenDefs, source, options),
      reduce(reducer, init) {
        let acc = init;
        for (const token of this) {
          acc = reducer(acc, token);
        }
        return acc;
      },
    };
  },
  toArray(source) {
    return Array.from(this.toIterable(source));
  },
});
