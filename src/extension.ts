import * as vscode from 'vscode';
import * as hash from './hash-functions';

export function activate(context: vscode.ExtensionContext) {

	const commandList = [
		vscode.commands.registerCommand('inlineHash.joaat', joaatCallback),
		vscode.commands.registerCommand('inlineHash.joaatLowerCase', joaatLowerCaseCallback),
		vscode.commands.registerCommand('inlineHash.joaatUpperCase', joaatUpperCaseCallback),
	];

	commandList.forEach(d => context.subscriptions.push(d));
}

export function deactivate() { }


const joaatCallback = () => hashCallback(hash.joaat);
const joaatLowerCaseCallback = () => hashCallback(hash.joaatLowerCase);
const joaatUpperCaseCallback = () => hashCallback(hash.joaatUpperCase);

type HashFunction = (str: string) => number;
function hashCallback(hashFunc: HashFunction) {
	const defaultInputStr = "%1 = %2";

	const inputOptions: vscode.InputBoxOptions = {
		placeHolder: "default: " + defaultInputStr,
		prompt: "Insert format. `%1` is replaced with the original string and `%2` with the hash."
	};
	const input = vscode.window.showInputBox(inputOptions);

	if (!input) {
		return;
	}

	input.then((inputStr) => {
		const textEditor = vscode.window.activeTextEditor;
		if (!textEditor) {
			return;
		}

		const selections = textEditor.selections;
		textEditor.edit(editBuilder => {
			for (const sel of selections) {
				if (sel.isEmpty) {
					continue;
				}

				const selText = textEditor.document.getText(sel);
				const newText = (inputStr ? inputStr : defaultInputStr)
									.replace(new RegExp("%1", "g"), selText)
									.replace(new RegExp("%2", "g"), "0x" + hashFunc(selText).toString(16).toUpperCase());
				editBuilder.replace(sel, newText);
			}
		});
	});
}