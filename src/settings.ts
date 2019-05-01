import * as vscode from 'vscode';

export class Settings {
    private static _defaultFormat: string = "%1 = %2";

    public static get defaultFormat(): string {
        return Settings._defaultFormat;
    }

    public static update() {
        const settings = vscode.workspace.getConfiguration("inlineHasher");

        Settings._defaultFormat = settings.get<string>("defaultFormat", Settings._defaultFormat);
    }
}