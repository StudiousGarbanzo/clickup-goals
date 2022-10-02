import * as vscode from 'vscode';
import { ClickUpGoalView as ClickUpGoalViewProvider } from './ClickUpGoalViewProvider';

export function activate(context: vscode.ExtensionContext) {
	const view = new ClickUpGoalViewProvider(context.extensionUri);

	context.subscriptions.push(vscode.window.registerWebviewViewProvider(ClickUpGoalViewProvider.viewType, view));
}

export function deactivate() {}
