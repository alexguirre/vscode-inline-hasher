import * as vscode from 'vscode';

export class Settings {
    private static _singleDefaultFormat: string;
    private static _showFormatInputBox: boolean;
    private static _multipleDefaultFormat: string;

    public static get singleDefaultFormat(): string {
        return Settings._singleDefaultFormat;
    }
    
    public static get showFormatInputBox(): boolean {
        return Settings._showFormatInputBox;
    }

    public static get multipleDefaultFormat(): string {
        return Settings._multipleDefaultFormat;
    }

    public static update() {
        const settings = vscode.workspace.getConfiguration("inlineHasher");

        Settings._singleDefaultFormat = settings.get<string>("singleDefaultFormat", Settings._singleDefaultFormat);
        Settings._showFormatInputBox = settings.get<boolean>("showFormatInputBox", Settings._showFormatInputBox);
        Settings._multipleDefaultFormat = settings.get<string>("multipleDefaultFormat", Settings._multipleDefaultFormat);
    }
}