import * as vscode from 'vscode';
import * as hash from './hash-functions';

export function activate(context: vscode.ExtensionContext) {

	const commandList = [
		vscode.commands.registerCommand('inlineHasher.joaat', joaatCallback),
		vscode.commands.registerCommand('inlineHasher.joaatLowerCase', joaatLowerCaseCallback),
		vscode.commands.registerCommand('inlineHasher.joaatUpperCase', joaatUpperCaseCallback),
		vscode.commands.registerCommand('inlineHasher.elf', elfCallback),
		vscode.commands.registerCommand('inlineHasher.elfLowerCase', elfLowerCaseCallback),
		vscode.commands.registerCommand('inlineHasher.elfUpperCase', elfUpperCaseCallback),
	];

	commandList.forEach(d => context.subscriptions.push(d));
}

export function deactivate() { }


const joaatCallback = () => hashCallback(hash.joaat);
const joaatLowerCaseCallback = () => hashCallback(hash.joaat, StringTransform.ToLowerCase);
const joaatUpperCaseCallback = () => hashCallback(hash.joaat, StringTransform.ToUpperCase);
const elfCallback = () => hashCallback(hash.elf);
const elfLowerCaseCallback = () => hashCallback(hash.elf, StringTransform.ToLowerCase);
const elfUpperCaseCallback = () => hashCallback(hash.elf, StringTransform.ToUpperCase);

enum StringTransform {
	None = 0,
	ToLowerCase = 1,
	ToUpperCase = 2,
}

function transform(str: string, t: StringTransform): string {
	switch (t) {
		case StringTransform.ToLowerCase: return str.toLowerCase();
		case StringTransform.ToUpperCase: return str.toUpperCase();
		default: return str;
	}
}

type HashFunction = (str: string) => number;
function hashCallback(hashFunc: HashFunction, strTransform: StringTransform = StringTransform.None) {
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
		if (inputStr === undefined) {
			return;
		}

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
				const hash = hashFunc(transform(selText, strTransform));
				const hashStr = hash.toString(16).toUpperCase();
				const newText = (inputStr.length !== 0 ? inputStr : defaultInputStr)
					.replace(new RegExp("%1", "g"), selText)
					.replace(new RegExp("%2", "g"), "0x" + hashStr);
				editBuilder.replace(sel, newText);
			}
		});
	});
}