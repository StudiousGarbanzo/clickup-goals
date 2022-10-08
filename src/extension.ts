import * as vscode from 'vscode';
import { createGoal, getTeams, getUserId, Goal, isTokenValid } from './lib/api';
import { ClickUpGoalViewProvider } from './view';


export let createGoalView: () => void = () => { };
export let createTargetView: (goalId: string, goalName: string) => void = (goal) => { };

export function activate(context: vscode.ExtensionContext) {
    const view = new ClickUpGoalViewProvider(context.extensionUri, context);
    const globalStateKeys: string[] = ["clickup.pat"];

    let currentGoalPanel: vscode.WebviewPanel | undefined = undefined;
    context.subscriptions.push(vscode.window.registerWebviewViewProvider(ClickUpGoalViewProvider.viewType, view));
    context.globalState.setKeysForSync(globalStateKeys);

    createTargetView = (goalId: string, goalName: string) => {
        const columnToShowIn = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
        const currentTargetPanel = vscode.window.createWebviewPanel('createTarget', `${goalName}: Create New Target`, columnToShowIn!, {
            enableScripts: true
        });
        const styleVSCodeUri = currentTargetPanel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'vscode.css'));
        const scriptVSCodeUri = currentTargetPanel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'target.js'));
        function reload() {
            currentTargetPanel.webview.html = `
                <!DOCTYPE html>
                <html lang="en">
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0">
                        <link href="${styleVSCodeUri}" rel="stylesheet">
                    </head>
                    <body>
                        <br><br>
                        <h1>${goalName}: Create New Target</h1>
                        <br>
                        <div style="width:95%">
                            <br>
                            <input type="text" id="target-name" value="Name" placeholder="Name">
                            <br>
                            <textarea placeholder="Description" id="target-description">Description</textarea>
                            <br>
                            <label for="target-type">Type</label>
                            <select name="target-type" class="goal-team" id="target-type">
                                <option value="number">Number</option>
                                <option value="boolean">Boolean</option>
                                <option value="currency">Currency</option>
                            </select>
                            <br>
                            <div class="target-num-props">
                                <label for="target-unit">Unit</label>
                                <input type="text" id="target-unit">
                                <br>
                            </div>
                            <div class="target-num-props">
                                <label for="target-start">Starting Value</label>
                                <input type="number" id="target-start" min="0">
                                <br>
                            </div>
                            <div class="target-num-props">
                                <label for="target-end">End Target</label>
                                <input type="number" id="target-end" min="0">
                                <br>
                            </div>
                            <input type="text" id="target-name" value="Unit" placeholder="Name">
                            <br>
                            <button class="create-button" style="width:97.25%">Create</button>
                        </div>
                        <br>
                        <script src="${scriptVSCodeUri}"></script>
                    </body>
                </html>`;
        }
        reload();
    };

    createGoalView = () => {
        const columnToShowIn = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;
        if (currentGoalPanel) {
            currentGoalPanel.reveal(columnToShowIn);
        } else {
            currentGoalPanel = vscode.window.createWebviewPanel('createGoal', 'ClickUp: Create New Goal', columnToShowIn!, {
                enableScripts: true
            });

            const styleVSCodeUri = currentGoalPanel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'vscode.css'));
            const scriptVSCodeUri = currentGoalPanel.webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, 'media', 'create.js'));

            function reload() {
                isTokenValid(context.globalState.get("clickup.pat")).then(valid => {
                    if (!currentGoalPanel) {
                        return;
                    }
                    if (!valid) {
                        currentGoalPanel.webview.html = `
                        <!DOCTYPE html>
                        <html lang="en">
                            <head>
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                                <link href="${styleVSCodeUri}" rel="stylesheet">
                            </head>
                            <body>
                                <br><br>
                                <h1>Please authorize before adding a Goal</h1>
                            </body>
                        </html>
                        `;
                    } else {
                        getTeams(context.globalState.get("clickup.pat")).then((teams) => {
                            if (!currentGoalPanel) {
                                return;
                            }
                            let teamOptionsHtml = "";
                            teamOptionsHtml += `<select name="goal-team" class="goal-team" id="goal-team">\n`;
                            for (const team of teams) {
                                teamOptionsHtml += `<option value="${team.id}">${team.name}</option>\n`;
                            }
                            teamOptionsHtml += `</select>\n`;
                            currentGoalPanel.webview.html = `
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
                                <br>
                                <label for="goal-team"><b>Team</b></label>
                                ${teamOptionsHtml}
                                <br>
                                <input type="text" id="goal-name" value="Name" placeholder="Name">
                                <br>
                                <textarea placeholder="Description" id="goal-description">Description</textarea>
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
                            <script src="${scriptVSCodeUri}"></script>
                        </body>
                    </html>`;
                        });
                    }
                });
            }
            reload();

            currentGoalPanel.webview.onDidReceiveMessage(message => {
                const token = context.globalState.get("clickup.pat");
                switch (message.command) {
                    case "create":
                        getUserId(token).then(userId => {
                            createGoal(
                                token,
                                message.teamId,
                                message.name,
                                message.date,
                                message.desc,
                                userId,
                                message.color
                            ).then(() => {
                                view.reloadAll();
                                currentGoalPanel!.webview.html = `
                                <!DOCTYPE html>
                    <html lang="en">
                        <head>
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <link href="${styleVSCodeUri}" rel="stylesheet">
                        </head>
                        <body>
                            <br><br>
                            <h1>Success</h1>
                        </body>
                    </html>`;
                            });
                        });
                        return;
                }
            });

            currentGoalPanel.onDidDispose(
                () => {
                    currentGoalPanel = undefined;
                },
                null,
                context.subscriptions
            );
        }
    };
    context.subscriptions.push(vscode.commands.registerCommand("clickup-goals.newGoal", createGoalView));
}

export function deactivate() { }
