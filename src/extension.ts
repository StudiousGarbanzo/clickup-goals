import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
	console.log('Congratulations, your extension "clickup-goals" is now active!');

	let disposable = vscode.commands.registerCommand('clickup-goals.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from ClickUp™ Goals!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
