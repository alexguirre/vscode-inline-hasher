import * as vscode from 'vscode';
import * as hash from './hash-functions';
import { Settings } from "./settings";

export function activate(context: vscode.ExtensionContext) {

	const subscriptions = [
		vscode.commands.registerCommand('inlineHasher.single', singleCallback),
		vscode.commands.registerCommand('inlineHasher.multiple', multipleCallback),
		vscode.workspace.onDidChangeConfiguration(Settings.update),
	];

	subscriptions.forEach(d => context.subscriptions.push(d));

	Settings.update();
}

export function deactivate() { }

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
	hash.sha1,
	hash.sha224,
	hash.sha256,
	hash.sha384,
	hash.sha512,
	hash.md5,
].map(f => [f.name, f]));

function createPickItems(): string[] {
	let arr: string[] = [];
	for (const str of hashFunctions.keys()) {
		arr.push(str);
		arr.push(str + " (lowercase)");
		arr.push(str + " (uppercase)");
	}
	return arr;
}

function singleCallback() {
	if (!vscode.window.activeTextEditor) {
		vscode.window.showInformationMessage("This command can only be used inside a text editor.");
		return;
	}

	const pickItems = createPickItems();
	const pickOptions: vscode.QuickPickOptions = {
		placeHolder: "Select hash function...",
		canPickMany: false,
	};
	const pick = vscode.window.showQuickPick(pickItems, pickOptions);

	if (!pick) {
		return;
	}

	pick.then((pickStr) => {
		if (pickStr === undefined) {
			return;
		}

		const inputOptions: vscode.InputBoxOptions = {
			placeHolder: "default: " + Settings.defaultFormat,
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

			selectionsToSingleHash(inputStr, pickStr);
		});
	});
}

function selectionsToSingleHash(format: string, hashPick: string) {
	function transformFromPick(): StringTransform {
		if (hashPick.endsWith("(lowercase)")) {
			return StringTransform.ToLowerCase;
		} else if (hashPick.endsWith("(uppercase)")) {
			return StringTransform.ToUpperCase;
		} else {
			return StringTransform.None;
		}
	}

	const hashFuncKey = hashPick.split(" ", 2)[0];
	const hashFunc = hashFunctions.get(hashFuncKey);
	const transformType = transformFromPick();	

	if (hashFunc === undefined) {
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
			const hash = hashFunc(transform(selText, transformType));
			const newText = (format.length !== 0 ? format : Settings.defaultFormat)
				.replace(new RegExp("(?<!%)%2", "g"), hash)
				.replace(new RegExp("(?<!%)%1", "g"), selText);
			editBuilder.replace(sel, newText);
		}
	});
}

function multipleCallback() {
	if (!vscode.window.activeTextEditor) {
		vscode.window.showInformationMessage("This command can only be used inside a text editor.");
		return;
	}
	
	const inputOptions: vscode.InputBoxOptions = {
		placeHolder: "default: " + Settings.multipleDefaultFormat,
		prompt: "Insert format. `%1` is replaced with the original string and `%<hash-function>[_^]` with the hash. " +
			"For more information, see the setting `inlineHasher.multipleDefaultFormat`."
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

			let newText: string = (format.length !== 0 ? format : Settings.multipleDefaultFormat);
			for (const hashFunc of hashFunctions) {
				let hash: string | undefined;
				let hashUpperCase: string | undefined;
				let hashLowerCase: string | undefined;

				newText = newText.replace(new RegExp("(?<!%)%" + hashFunc[0] + "[_^]?", "g"), (match) => {
					switch (match.charAt(match.length - 1)) {
						case "^":
							return hashUpperCase === undefined ? (hashUpperCase = hashFunc[1](transform(selText, StringTransform.ToUpperCase))) : hashUpperCase;
						case "_":
							return hashLowerCase === undefined ? (hashLowerCase = hashFunc[1](transform(selText, StringTransform.ToLowerCase))) : hashLowerCase;
						default:
							return hash === undefined ? (hash = hashFunc[1](transform(selText, StringTransform.None))) : hash;
					}
				});
			}
			newText = newText.replace(new RegExp("(?<!%)%1", "g"), selText);

			editBuilder.replace(sel, newText);
		}
	});
}