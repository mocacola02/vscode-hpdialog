import * as vscode from "vscode";

const EMOTES = [
    "Normal",
    "Happy",
    "Whisper",
    "Sarcastic",
    "Sad",
    "Mad"
];

export function activate(context: vscode.ExtensionContext) {

    console.log("HPDialog extension activated");

    const diagnostics = vscode.languages.createDiagnosticCollection("hpdialog");
    context.subscriptions.push(diagnostics);

    function validate(document: vscode.TextDocument) {
        if (document.languageId !== "hpdialog") return;

        const keyMap = new Map<string, vscode.Range[]>();
        const diags: vscode.Diagnostic[] = [];

        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i).text;

            const match = line.match(/^(\w+)=/);
            if (!match) continue;

            const key = match[1];

            const range = new vscode.Range(
                new vscode.Position(i, 0),
                new vscode.Position(i, key.length)
            );

            if (!keyMap.has(key)) {
                keyMap.set(key, []);
            }

            keyMap.get(key)!.push(range);
        }

        for (const [, ranges] of keyMap) {
            if (ranges.length > 1) {
                for (const r of ranges) {
                    diags.push(
                        new vscode.Diagnostic(
                            r,
                            "Duplicate key is not allowed",
                            vscode.DiagnosticSeverity.Error
                        )
                    );
                }
            }
        }

        diagnostics.set(document.uri, diags);
    }

    context.subscriptions.push(
        vscode.workspace.onDidOpenTextDocument(validate),
        vscode.workspace.onDidChangeTextDocument(e => validate(e.document))
    );

    if (vscode.window.activeTextEditor) {
        validate(vscode.window.activeTextEditor.document);
    }

    const provider = vscode.languages.registerCompletionItemProvider(
        "hpdialog",
        {
            provideCompletionItems(document, position) {

                const line = document.lineAt(position.line).text;
                const before = line.slice(0, position.character);

                const equalsIndex = before.lastIndexOf("=");
                const openIndex = before.lastIndexOf("[");

                const insideEmote =
                    equalsIndex !== -1 &&
                    openIndex > equalsIndex &&
                    !before.slice(openIndex).includes("]");

                if (!insideEmote) return undefined;

                return EMOTES.map(emote => {
                    const item = new vscode.CompletionItem(
                        emote,
                        vscode.CompletionItemKind.Value
                    );

                    item.insertText = emote;
                    item.commitCharacters = ["]"];

                    return item;
                });
            }
        },
        "=",
        "["
    );

    context.subscriptions.push(provider);
}

export function deactivate() {}