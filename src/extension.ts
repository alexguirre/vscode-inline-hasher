import * as vscode from 'vscode';
import * as hash from './hash-functions';
import { Settings } from "./settings";

export function activate(context: vscode.ExtensionContext) {

	const subscriptions = [
		vscode.commands.registerCommand('inlineHasher.joaat', joaatCallback),
		vscode.commands.registerCommand('inlineHasher.joaatLowerCase', joaatLowerCaseCallback),
		vscode.commands.registerCommand('inlineHasher.joaatUpperCase', joaatUpperCaseCallback),
		vscode.commands.registerCommand('inlineHasher.elf', elfCallback),
		vscode.commands.registerCommand('inlineHasher.elfLowerCase', elfLowerCaseCallback),
		vscode.commands.registerCommand('inlineHasher.elfUpperCase', elfUpperCaseCallback),
		vscode.workspace.onDidChangeConfiguration(Settings.update),
	];

	subscriptions.forEach(d => context.subscriptions.push(d));

	Settings.update();
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
	if (Settings.showFormatInputBox) {
		const inputOptions: vscode.InputBoxOptions = {
			placeHolder: "default: " + Settings.defaultFormat,
			prompt: "Insert format. `%1` is replaced with the original string and `%2` with the hash."
		};
		const input = vscode.window.showInputBox(inputOptions);

		if (!input) {
			return;
		}

		input.then((inputStr) => selectionsToHashes(inputStr, hashFunc, strTransform));
	} else {
		selectionsToHashes(Settings.defaultFormat, hashFunc, strTransform);
	}
}

function selectionsToHashes(format: string | undefined, hashFunc: HashFunction, selectionTextTransform: StringTransform) {
	if (format === undefined) {
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
			const hash = hashFunc(transform(selText, selectionTextTransform));
			const hashStr = hash.toString(16).toUpperCase();
			const newText = (format.length !== 0 ? format : Settings.defaultFormat)
				.replace(new RegExp("%1", "g"), selText)
				.replace(new RegExp("%2", "g"), "0x" + hashStr);
			editBuilder.replace(sel, newText);
		}
	});
}