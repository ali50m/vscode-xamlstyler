# markupfmt

A personal markup formatter for VS Code, maintained by ali50m.

## Features

- Format `.xaml`, `.axaml`, and `.axml` files.
- Use workspace formatting settings or a `Settings.XamlStyler` configuration file.
- Include a formatting engine with the preserved-whitespace comment fix.

## Usage

Select **markupfmt** with **Format Document With...**. To use it by default:

```json
"[xml]": {
  "editor.defaultFormatter": "ali50m.markupfmt"
}
```

For files recognized as `xaml` or `axaml`, configure the matching language section.
Existing `xamlstyler.*` settings remain supported.
The bundled tool requires .NET 8 or a later runtime.

## Attribution

This extension is derived from [vscode-xamlstyler](https://github.com/dabbinavo/vscode-xamlstyler), originally authored by Christian Fischerauer and distributed under the MIT license.
The bundled engine is derived from [Xavalon/XamlStyler](https://github.com/Xavalon/XamlStyler); its license and notices are retained with the tool.
