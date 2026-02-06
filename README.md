# Zed-HexPeek
Zed-HexPeek, an extension for [Zed](https://zed.dev) editor to peek various forms of a number literal.

## Setup
1. Clone the repository
```sh
git clone https://github.com/A-23187/zed-hexpeek.git
```
2. Install this extension via Install Dev Extension in Zed
3. Enable the zed-hexpeek language server by adding the following to your `.zed/settings.json` (or `~/.config/zed/settings.json` for all workspaces)
```json
{
  "languages": {
    "C++": { // the language you want to enable the extension for
      "language_servers": ["hexpeek-language-server"]
    }
  }
}
```

## Known Issues
1. This extension provides hover capabilities through [zed-hexpeek-language-server](https://www.npmjs.com/package/zed-hexpeek-language-server), a simple language server. Since Zed's language server extension must declare the languages the language server supports.
```toml
[language_servers.hexpeek-language-server]
name = "HexPeek Language Server"
languages = ["Astro", "C", "C#", "C++", "CSS", "Clojure", "Coffeescript", "Dart", "Diff", "ERB", "Elixir", "Erlang", "F#", "GLSL", "Git Commit", "Gleam", "Go Mod", "Go Work", "Go", "Groovy", "HEEX", "HTML", "JSDoc", "JSON", "JSONC", "Java", "JavaScript", "Lua", "Makefile", "Markdown", "Markdown-Inline", "Objective-C", "Objective-C++", "PHP", "Perl", "Plain Text", "Proto", "Python", "R", "Regex", "Ruby", "Rust", "SQL", "Scala", "Shell Script", "Svelte", "Swift", "TSX", "TypeScript", "XML", "YAML", "Zed Keybind Context"]
```
And this extension supports the above languages. If you are using a language which is not one of them, please add your language name manually.

## License
Apache 2.0

