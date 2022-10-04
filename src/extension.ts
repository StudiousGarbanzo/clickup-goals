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
            currentPanel = vscode.window.createWebviewPanel('createGoal', 'ClickUp: Create New Goal', columnToShowIn!, {
                enableScripts: true
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
                    <br><br>
                    <h1>Create New ClickUp Goal</h1>
                    <br>
                    <div style="width:95%">
                        <input type="text" id="goal-name" placeholder="Name">
                        <br>
                        <textarea placeholder="Description" id="goal-description"></textarea>
                        <br>
                        <label for="goal-color"><b>Color</b></label>
                        <input type="color" id="goal-color" name = "goal-color" value="#00FF00" style="width:97.5%">
                        <br>
                        <label for="goal-date"><b>Due Date</b></label>
                        <input type="date" name="goal-date" id="goal-date">
                        <br>
                        <button class="create-button" style="width:97.25%">Create</button>
                    </div>
                    <br>
                <script>
                    (function() {
                        const vscode = acquireVsCodeApi();
                        document.getElementById("goal-date").valueAsDate = new Date();
                    }());
                </script>
                </body>
            </html>
            `;

            currentPanel.webview.onDidReceiveMessage(message => {
                switch (message.command) {
                    case "reloadMain":
                        view.reloadAll();
                        return;
                }
            });

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
