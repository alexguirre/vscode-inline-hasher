import * as vscode from 'vscode';

export class Settings {
    private static _defaultFormat: string = "%1 = %2";
    private static _showFormatInputBox: boolean = true;
    private static _multipleDefaultFormat: string;

    public static get defaultFormat(): string {
        return Settings._defaultFormat;
    }
    
    public static get showFormatInputBox(): boolean {
        return Settings._showFormatInputBox;
    }

    public static get multipleDefaultFormat(): string {
        return Settings._multipleDefaultFormat;
    }

    public static update() {
        const settings = vscode.workspace.getConfiguration("inlineHasher");

        Settings._defaultFormat = settings.get<string>("defaultFormat", Settings._defaultFormat);
        Settings._showFormatInputBox = settings.get<boolean>("showFormatInputBox", Settings._showFormatInputBox);
        Settings._multipleDefaultFormat = settings.get<string>("multipleDefaultFormat", Settings._multipleDefaultFormat);
    }
}