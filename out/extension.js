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
    const provider = vscode.languages.registerCompletionItemProvider("hpdialog", {
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
            const insideEmotion = openBracket !== -1 &&
                openBracket > closeBracket;
            if (!insideEmotion) {
                return [];
            }
            return EMOTES.map(emote => {
                const item = new vscode.CompletionItem(emote, vscode.CompletionItemKind.Value);
                item.insertText = emote;
                item.filterText = emote;
                item.preselect = true;
                return item;
            });
        }
    }, "[", "=");
    context.subscriptions.push(provider);
}
