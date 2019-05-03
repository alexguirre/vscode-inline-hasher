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
		vscode.commands.registerCommand('inlineHasher.fnv1', fnv1Callback),
		vscode.commands.registerCommand('inlineHasher.fnv1LowerCase', fnv1LowerCaseCallback),
		vscode.commands.registerCommand('inlineHasher.fnv1UpperCase', fnv1UpperCaseCallback),
		vscode.commands.registerCommand('inlineHasher.fnv1a', fnv1aCallback),
		vscode.commands.registerCommand('inlineHasher.fnv1aLowerCase', fnv1aLowerCaseCallback),
		vscode.commands.registerCommand('inlineHasher.fnv1aUpperCase', fnv1aUpperCaseCallback),
		vscode.commands.registerCommand('inlineHasher.multiple', multipleCallback),
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
const fnv1Callback = () => hashCallback(hash.fnv1);
const fnv1LowerCaseCallback = () => hashCallback(hash.fnv1, StringTransform.ToLowerCase);
const fnv1UpperCaseCallback = () => hashCallback(hash.fnv1, StringTransform.ToUpperCase);
const fnv1aCallback = () => hashCallback(hash.fnv1a);
const fnv1aLowerCaseCallback = () => hashCallback(hash.fnv1a, StringTransform.ToLowerCase);
const fnv1aUpperCaseCallback = () => hashCallback(hash.fnv1a, StringTransform.ToUpperCase);

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

type HashFunction = (str: string) => string;

const hashFunctions: Map<string, HashFunction> = new Map([
	hash.joaat,
	hash.elf,
	hash.fnv1a,
	hash.fnv1,
].map(f => [f.name, f]));

const hashFunctionsCommaSeparated: string = (() => {
	let tmp: string = "";
	hashFunctions.forEach((_v, k) => {
		if (tmp.length !== 0) {
			tmp += ", ";
		}
		tmp += k;
	});
	return tmp;
})();

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
			const newText = (format.length !== 0 ? format : Settings.defaultFormat)
				.replace(new RegExp("%2", "g"), hash)
				.replace(new RegExp("%1", "g"), selText);
			editBuilder.replace(sel, newText);
		}
	});
}

const multipleDefaultFormat: string = "%1 (joaat: %joaat, fnv-1a: %fnv1a)";

function multipleCallback() {
	const inputOptions: vscode.InputBoxOptions = {
		placeHolder: "default: " + multipleDefaultFormat,
		prompt: "Insert format. `%1` is replaced with the original string and `%<hash-function>` with the hash. Available hash functions: " + hashFunctionsCommaSeparated + "."
	};
	const input = vscode.window.showInputBox(inputOptions);

	if (!input) {
		return;
	}

	input.then((inputStr) => selectionsToMultipleHashes(inputStr));
}

function selectionsToMultipleHashes(format: string | undefined) {
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

			let newText: string = (format.length !== 0 ? format : multipleDefaultFormat);
			for (const hashFunc of hashFunctions) {
				let hashCalculated: boolean = false;
				let hash: string;

				newText = newText.replace(new RegExp("%" + hashFunc[0], "g"), (_) => {
					if (!hashCalculated) {
						// calculate the hash lazily so it is not calculated if the
						// hash specifier is not found
						hash = hashFunc[1](transform(selText, StringTransform.None));
						hashCalculated = true;
					}
					return hash;
				});
			}
			newText = newText.replace(new RegExp("%1", "g"), selText);

			editBuilder.replace(sel, newText);
		}
	});
}