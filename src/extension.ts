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

    const provider = vscode.languages.registerCompletionItemProvider(
        "hpdialog",
        {
            provideCompletionItems(document, position) {

                const line = document.lineAt(position).text;
                const textBeforeCursor = line.substring(0, position.character);

                const equalsIndex = textBeforeCursor.indexOf("=");
                if (equalsIndex === -1) {
                    return [];
                }

                const afterEquals = textBeforeCursor.substring(equalsIndex + 1);

                const openBracket = afterEquals.lastIndexOf("[");
                const closeBracket = afterEquals.lastIndexOf("]");

                const insideEmotion =
                    openBracket !== -1 &&
                    openBracket > closeBracket;

                if (!insideEmotion) {
                    return [];
                }

                return EMOTES.map(emote => {
                    const item = new vscode.CompletionItem(
                        emote,
                        vscode.CompletionItemKind.Value
                    );

                    item.insertText = emote;

                    item.filterText = emote;
                    item.preselect = true;

                    return item;
                });
            }
        },
        "[", "="
    );

    context.subscriptions.push(provider);
}