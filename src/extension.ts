import * as vscode from 'vscode';
import * as hash from './hash-functions';

export function activate(context: vscode.ExtensionContext) {

	const commandList = [
		vscode.commands.registerCommand('inlineHash.joaat', joaatCallback),
		vscode.commands.registerCommand('inlineHash.joaatLowerCase', joaatLowerCaseCallback),
		vscode.commands.registerCommand('inlineHash.joaatUpperCase', joaatUpperCaseCallback),
	]

	commandList.forEach(d => context.subscriptions.push(d));
}

export function deactivate() { }


const joaatCallback = () => hashCallback(hash.joaat);
const joaatLowerCaseCallback = () => hashCallback(hash.joaatLowerCase);
const joaatUpperCaseCallback = () => hashCallback(hash.joaatUpperCase);

type HashFunction = (str: string) => number;
function hashCallback(hashFunc: HashFunction) {
	const textEditor = vscode.window.activeTextEditor;
	if (!textEditor) {
		return;
	}
	
	const selection = textEditor.selection;
	if (selection.isEmpty) {
		return;
	}

	const lineStart = selection.start.line;
	const lineEnd = selection.end.line;
	const newLines: string[] = []
	for (let i = lineStart; i <= lineEnd; i++) {
		const line = textEditor.document.lineAt(i).text;

		const newLine = line + " = 0x" + hashFunc(line).toString(16).toUpperCase();
		newLines.push(newLine);
	}

	textEditor.edit(editBuilder => {
		const range = new vscode.Range(lineStart, 0, lineEnd, textEditor.document.lineAt(lineEnd).text.length);
		editBuilder.replace(range, newLines.join('\n'));
	});
}