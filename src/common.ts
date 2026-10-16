import * as vscode from "vscode";

/**
 * Keep the {@link languages} in sync with {@link file://./../package.json} > activationEvents
 */
const languages = ["xaml", "AXAML", "xml", "axaml"]; 

const xamlPattern = "**/*.{xaml,axaml,axml}";

export const documentSelector: vscode.DocumentFilter[] = languages.map(
  (language) => ({
    language,
    scheme: "file",
    pattern: xamlPattern,
  })
);

export const outputChannel =
  vscode.window.createOutputChannel("xfmt");

export const extensionId = "ali50m.xfmt";

export const extensionPath =
  vscode.extensions.getExtension(extensionId)?.extensionPath;
