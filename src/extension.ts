import * as vscode from "vscode";

const EMOTES = ["Normal", "Happy", "Whisper", "Sarcastic", "Sad", "Mad"];

export function activate(context: vscode.ExtensionContext) {
    console.log("HPDialog extension activated");
    const provider = vscode.languages.registerCompletionItemProvider(
        "hpdialog",
        {
            provideCompletionItems(document, position) {

                const line = document.lineAt(position.line).text;
                const beforeCursor = line.substring(0, position.character);

                const lastEquals = beforeCursor.lastIndexOf("=");
                const lastOpen = beforeCursor.lastIndexOf("[");

                const insideEmote =
                    lastEquals !== -1 &&
                    lastOpen > lastEquals &&
                    !beforeCursor.slice(lastOpen).includes("]");

                if (!insideEmote) return undefined;

                return EMOTES.map(emote => {
                    const item = new vscode.CompletionItem(
                        emote,
                        vscode.CompletionItemKind.Value
                    );

                    item.commitCharacters = ["]"];
                    return item;
                });
            }
        },
        "=",
        "[",
        " "
    );

    context.subscriptions.push(provider);
}

export function deactivate() {}