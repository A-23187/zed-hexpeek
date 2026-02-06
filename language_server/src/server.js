import {
  ProposedFeatures,
  TextDocuments,
  createConnection,
} from "vscode-languageserver/node.js";
import { TextDocument } from "vscode-languageserver-textdocument";

const connection = createConnection(ProposedFeatures.all);
const documents = new TextDocuments(TextDocument);

function fromCharCode(code) {
  if (0 <= code && code <= 31) {
    return String.fromCharCode(code + 0x2400);
  } else if ((32 <= code && code <= 126) || (128 <= code && code <= 255)) {
    return String.fromCharCode(code);
  } else if (code == 127) {
    return "\u2421";
  }
}

connection.onInitialize((params) => {
  return { capabilities: { hoverProvider: true } };
});

connection.onHover((params) => {
  const doc = documents.get(params.textDocument.uri);
  if (!doc) {
    connection.console.error(`Document ${params.textDocument.uri} not found`);
    return null;
  }
  const line = doc.getText({
    start: { line: params.position.line, character: 0 },
    end: { line: params.position.line, character: Number.MAX_SAFE_INTEGER },
  });
  let wordStart = params.position.character;
  while (wordStart >= 0 && line.charAt(wordStart).match(/['\w]/)) {
    wordStart--;
  }
  wordStart++;
  let wordEnd = params.position.character;
  while (wordEnd < line.length && line.charAt(wordEnd).match(/['\w]/)) {
    wordEnd++;
  }
  connection.console.log(`wordStart: ${wordStart}, wordEnd: ${wordEnd}`);
  if (wordStart >= wordEnd) {
    return null;
  }
  let word = line.substring(wordStart, wordEnd);
  connection.console.log(`word: ${word}`);
  if (word.charAt(0) == "-") {
    word = word.substring(1);
    wordStart++;
  }
  let num = 0;
  let hexs = "";
  if (word.match(/^(0[bB]['01]*[01]|0[bB][_01]*[01])$/)) {
    connection.console.log("bin");
    for (let i = 0; i < word.length; i++) {
      let ch = word.charAt(i);
      if (ch == "b" || ch == "B" || ch == "'" || ch == "_") {
        continue;
      }
      num = num * 2 + (ch - "0");
    }
  } else if (word.match(/^(0[oO]?['0-7]*[0-7]|0[oO]?[_0-7]*[0-7])$/)) {
    connection.console.log("oct");
    for (let i = 0; i < word.length; i++) {
      let ch = word.charAt(i);
      if (ch == "o" || ch == "O" || ch == "'" || ch == "_") {
        continue;
      }
      num = num * 8 + (ch - "0");
    }
  } else if (
    word.match(
      /^(0[xX]['0-9a-fA-F]*[0-9a-fA-F]|0[xX][_0-9a-fA-F]*[0-9a-fA-F])$/,
    )
  ) {
    connection.console.log("hex");
    for (let i = 0; i < word.length; i++) {
      let ch = word.charAt(i);
      if (ch == "x" || ch == "X" || ch == "'" || ch == "_") {
        continue;
      }
      num =
        num * 16 +
        (ch >= "0" && ch <= "9"
          ? ch - "0"
          : ch >= "a" && ch <= "f"
            ? ch.charCodeAt(0) - 87
            : ch.charCodeAt(0) - 55);
    }
    hexs = word.substring(2);
  } else if (word.match(/^([0-9]|[1-9]['0-9]*[0-9]|[1-9][_0-9]*[0-9])$/)) {
    connection.console.log("dec");
    for (let i = 0; i < word.length; i++) {
      let ch = word.charAt(i);
      if (ch == "'" || ch == "_") {
        continue;
      }
      num = num * 10 + (ch - "0");
    }
  } else {
    return null;
  }
  hexs = hexs || num.toString(16);
  connection.console.log(`hex: ${hexs}`);
  let numInLE = 0;
  let ascii = "";
  for (let i = hexs.length - 2; i >= 0; i -= 2) {
    numInLE = numInLE * 256 + parseInt(hexs.substring(i, i + 2), 16);
  }
  if (hexs.length % 2 == 1) {
    const v = parseInt(hexs.substring(0, 1), 16);
    numInLE = numInLE * 256 + v;
    ascii = fromCharCode(v);
  }
  for (let i = hexs.length % 2; i < hexs.length; i += 2) {
    const v = parseInt(hexs.substring(i, i + 2), 16);
    connection.console.info(`v: ${v}`);
    ascii += fromCharCode(v);
  }
  connection.console.log(`numInLE: ${num}`);
  connection.console.log(`ascii: ${ascii}`);
  return {
    contents: {
      kind: "markdown",
      value: `[**HexPeek**](https://github.com/A-23187/zed-hexpeek) \`${word}\`
\`\`\`
Binary:      0b${num.toString(2)}
Octal:       0o${num.toString(8)}
Decimal:
  in BE:     ${num}
  in LE:     ${numInLE}
Hexadecimal: 0x${hexs}
Ascii:       ${ascii}
Time:
  in  S:     ${new Date(num * 1000).toISOString()}
  in MS:     ${new Date(num).toISOString()}
\`\`\`
`,
    },
    range: {
      start: {
        line: params.position.line,
        character: wordStart,
      },
      end: {
        line: params.position.line,
        character: wordEnd,
      },
    },
  };
});

documents.listen(connection);
connection.listen();
