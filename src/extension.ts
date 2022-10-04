import * as vscode from 'vscode';
import { ClickUpGoalViewProvider } from './view';

export function activate(context: vscode.ExtensionContext) {
	const view = new ClickUpGoalViewProvider(context.extensionUri, context);
	const globalStateKeys: string[] = ["clickup.pat"];

	let currentPanel: vscode.WebviewPanel | undefined = undefined;
	context.subscriptions.push(vscode.window.registerWebviewViewProvider(ClickUpGoalViewProvider.viewType, view));
	context.globalState.setKeysForSync(globalStateKeys);
	context.subscriptions.push(vscode.commands.registerCommand("clickup-goals.newGoal", () => {
		const columnToShowIn = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
		if (currentPanel) {
        	currentPanel.reveal(columnToShowIn);
      	} else {
			currentPanel = vscode.window.createWebviewPanel('createGoal', 'Create New Goal', columnToShowIn!, {
			});

			const styleVSCodeUri = currentPanel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'vscode.css'));

			currentPanel.webview.html = `
			<!DOCTYPE html>
            <html lang="en">
                <head>
				    <meta name="viewport" content="width=device-width, initial-scale=1.0">
					<link href="${styleVSCodeUri}" rel="stylesheet">
                </head>
                <body>
                    <h2>Create New ClickUp Goal</h2>
                    <br>
                    <button class="create-button">Create</button>
                    <br>
                    <br>
                </body>
            </html>
			`;

			currentPanel.onDidDispose(
				() => {
				  currentPanel = undefined;
				},
				null,
				context.subscriptions
			  );
		}
	}));
}

export function deactivate() {}
