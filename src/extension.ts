import * as vscode from 'vscode';
import { ClickUpGoalViewProvider } from './view';

export function activate(context: vscode.ExtensionContext) {
	const view = new ClickUpGoalViewProvider(context.extensionUri, context);
	const globalStateKeys: string[] = ["clickup.pat"];

	context.subscriptions.push(vscode.window.registerWebviewViewProvider(ClickUpGoalViewProvider.viewType, view));
	context.globalState.setKeysForSync(globalStateKeys);
}

export function deactivate() {}
