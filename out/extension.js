"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(require("vscode"));
const EMOTES = [
    "Normal",
    "Happy",
    "Whisper",
    "Sarcastic",
    "Sad",
    "Mad"
];
function activate(context) {
    console.log("HPDialog extension activated");
    const diagnostics = vscode.languages.createDiagnosticCollection("hpdialog");
    context.subscriptions.push(diagnostics);
    function validate(document) {
        if (document.languageId !== "hpdialog")
            return;
        const keyMap = new Map();
        const diags = [];
        for (let i = 0; i < document.lineCount; i++) {
            const line = document.lineAt(i).text;
            const match = line.match(/^(\w+)=/);
            if (!match)
                continue;
            const key = match[1];
            const range = new vscode.Range(new vscode.Position(i, 0), new vscode.Position(i, key.length));
            if (!keyMap.has(key)) {
                keyMap.set(key, []);
            }
            keyMap.get(key).push(range);
        }
        for (const [, ranges] of keyMap) {
            if (ranges.length > 1) {
                for (const r of ranges) {
                    diags.push(new vscode.Diagnostic(r, "Duplicate key is not allowed", vscode.DiagnosticSeverity.Error));
                }
            }
        }
        diagnostics.set(document.uri, diags);
    }
    context.subscriptions.push(vscode.workspace.onDidOpenTextDocument(validate), vscode.workspace.onDidChangeTextDocument(e => validate(e.document)));
    if (vscode.window.activeTextEditor) {
        validate(vscode.window.activeTextEditor.document);
    }
    const provider = vscode.languages.registerCompletionItemProvider("hpdialog", {
        provideCompletionItems(document, position) {
            const line = document.lineAt(position.line).text;
            const before = line.slice(0, position.character);
            const equalsIndex = before.lastIndexOf("=");
            const openIndex = before.lastIndexOf("[");
            const insideEmote = equalsIndex !== -1 &&
                openIndex > equalsIndex &&
                !before.slice(openIndex).includes("]");
            if (!insideEmote)
                return undefined;
            return EMOTES.map(emote => {
                const item = new vscode.CompletionItem(emote, vscode.CompletionItemKind.Value);
                item.insertText = emote;
                item.commitCharacters = ["]"];
                return item;
            });
        }
    }, "=", "[");
    context.subscriptions.push(provider);
}
function deactivate() { }
