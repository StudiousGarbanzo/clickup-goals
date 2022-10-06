import * as vscode from 'vscode';
import * as path from 'path';
import { isTokenValid, getTeams, Team, getGoals, Goal, updateGoal } from './lib/api';
import { timestampToString } from './lib/date';
import { createGoalView } from './extension';

export class ClickUpGoalViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'clickup-goals-view';

	private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri, private readonly context: vscode.ExtensionContext) { }

    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<unknown>, token: vscode.CancellationToken): void | Thenable<void> {
        this._view = webviewView;
        webviewView.webview.options = {
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};
        this.reloadAll();
        webviewView.webview.onDidReceiveMessage(
            message => {
              switch (message.command) {
                case 'info':
                    vscode.window.showInformationMessage(message.text);
                    return;
                case 'authorize':
                    this.authorize(message.token);
                    return;
                case 'reload':
                    this.reloadAll();
                    return;
                case 'goalUpdate':
                    updateGoal(
                        this.context.globalState.get("clickup.pat")!,
                        message.goalId,
                        message.name,
                        message.desc,
                        message.color,
                        message.date
                    ).then((thing) => {
                        // vscode.window.showInformationMessage(thing); // DEBUG
                        this.reloadAll();
                    });
                    return;
                case 'logout':
                    this.context.globalState.update("clickup.pat", "");
                    this.reloadAll();
                    return;
                case 'newgoal':
                    createGoalView();
                    return;
              }
            },
            undefined,
            this.context.subscriptions
          );
    }

    public reloadAll(): void {
        if (!this._view) {
            return;
        }
        const webview = this._view.webview;
        const nonce = getNonce();
        const authScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
        const authedScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'authed.js'));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
        let pat: string | null | undefined = this.context.globalState.get("clickup.pat");
        isTokenValid(pat).then(valid => {
            if (valid) {
                this._getAuthedHtml(webview, nonce, pat!, styleVSCodeUri, authedScriptUri).then(str => {
                    webview.html = str;
                });
            } else {
                webview.html = this._getAuthHtml(webview, nonce, styleVSCodeUri, authScriptUri);
            }
        });
    }

    private authorize(token: string) {
        isTokenValid(token).then(valid => {
            if (!valid) {
                vscode.window.showErrorMessage("Invalid Personal Access Token");
                return;
            } else {
                this.context.globalState.update("clickup.pat", token);
                vscode.window.showInformationMessage("Logged in to ClickUp");
                this.reloadAll();
            }
        });
    }

    private async _getAuthedHtml(webview: vscode.Webview, nonce: string, pat: string, css: vscode.Uri, js: vscode.Uri): Promise<string> {
        const fileUri = (fp: string) => {
            const fragments = fp.split('/');
    
            return vscode.Uri.file(
                path.join(this.context.extensionPath, ...fragments)
            );
        };
        const assetUri = (fp: string) => {
			return webview.asWebviewUri(fileUri(fp));
		};
        const teams: Team[] = await getTeams(pat);
        let teamGoalsHtml: string = "";
        for (const t of teams) {
            const goals: Goal[] = await getGoals(pat, t.id);
            let goalsHtml: string = `                
            `;
            if (goals.length === 0) {
                goalsHtml += "\n";
                goalsHtml += `
                <p>No goals yet</p>
                `;
            } else {
                for (const goal of goals) {
                    let keyResultsHtml = "";
                    if (goal.keyResults.length === 0) {
                        keyResultsHtml += "<h3>No Targets</h3>";
                    } else {
                        keyResultsHtml += `<h3>Targets</h3>`;
                        for (const keyResult of goal.keyResults) {
                            let specificKeyResultHtml = ``;
                            switch (keyResult.type) { // TODO: more interactive
                                case "boolean":
                                    specificKeyResultHtml += `
                                    Complete:
                                    <label class="aswitch">
                                        <input type="checkbox" id="CHECKKR-${keyResult.id}" name="CHECKKR-${keyResult.id}">
                                        <span class="aslider around"></span>
                                    </label><br>
                                    `;
                                    break;
                                case "number":
                                case "currency":
                                    const unit: string = keyResult.unit ? keyResult.unit : "";
                                    specificKeyResultHtml += `<p>Start: ${keyResult.startSteps} ${unit}</p>`;
                                    specificKeyResultHtml += `<p>Target: ${keyResult.endSteps} ${unit}</p>`;
                                    specificKeyResultHtml += `
                                    <p>Current: <input type="number" min="${keyResult.startSteps}" max="${keyResult.endSteps}" style="display: block-inline; width: 50%" value="${keyResult.startSteps}" id="NUMKR-${keyResult.id}"></p>
                                    `;
                                    break;
                            }
                            keyResultsHtml +=`
                        <vscode-collapsible title="${keyResult.name}" class="collapsible">
                            <div slot="body" style="width:95%;float:right">
                                ${specificKeyResultHtml}
                                <br>
                                <button id="BTN-${keyResult.id}" class="save-buttons-kr ${keyResult.type}" style="width:95%">Save Target Changes</button><br><br>
                            </div>
                        </vscode-collapsible>
                            `;
                        }
                    }
                    goalsHtml += `
                    <vscode-collapsible title="${goal.name}" class="collapsible">
                        <div slot="body" style="width:95%;float:right">
                            <span>Name: <input type="text" style="width:90%" id="NAME-${goal.id}" value="${goal.name}" </span><br>
                            <span>Date of Completion:</span>
                            <input type="date" id="DATE-${goal.id}" value="${timestampToString(goal.dueDate)}">
                            <br>
                            <span>Percentage Completed: ${goal.percentCompleted}%</span>
                            <br>
                            ${keyResultsHtml}
                            <br>
                            <span>Description:</span>
                            <textarea id="DESC-${goal.id}" style="width:90%" name="w3review">${goal.description}</textarea><br>
                            <span>Color:</span>
                            <input type="color" id="COLOR-${goal.id}" class="color-pickers" value="${goal.color}" style="width:90%"><br>
                            <button id="BTN-${goal.id}" class="save-buttons" style="width:95%">Save Goal Changes</button>
                            <br><br>
                        </div>
                    </vscode-collapsible>
                    `;
                    goalsHtml += "\n";
                }
            }
            teamGoalsHtml += `
            <vscode-collapsible title="${t.name}" class="subcollapse">
                <div slot="body" style="width:95%;float:right">
                    ${goalsHtml}
                </div>
            </vscode-collapsible>
            `;
            teamGoalsHtml += "\n";
        }
        
        return `
            <!DOCTYPE html>
            <html lang="en">
                <head>
				    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <!-- <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';"> -->
                    <link href="${css}" rel="stylesheet">
                    <link rel="stylesheet" href="${assetUri('node_modules/vscode-codicons/dist/codicon.css')}" id="vscode-codicon-stylesheet">
                </head>
                <body>
                    <h2>ClickUp</h2>
                    <p>Note: If a goal does not appear, please press Refresh</p>
                    <br>
                    <button class="refresh-button">Refresh</button>
                    <br>
                    <br>
                    <vscode-collapsible title="Goals" open class="collapsible">
                        <div slot="body" style="width:95%;float:right">
                        <button class="add-goal-button" style="margin:3px;width:95%">Create New Goal</button>
                        ${teamGoalsHtml}
                        </div>
                    </vscode-collapsible>
                    <br>
                    <br>
                    <button class="logout-button">Logout</button>
                    <script src="${js}"></script>
                    <script src="${assetUri('node_modules/@bendera/vscode-webview-elements/dist/bundled.js')}" type="module"></script>
                </body>
            </html>
        `;
    }

    private _getAuthHtml(webview: vscode.Webview, nonce: string, css: vscode.Uri, js: vscode.Uri): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
                <head>
				    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                    <link href="${css}" rel="stylesheet">
                </head>
                <body>
                    <h2>Authorization</h2>
                    <p>ClickUp Goals is not authorized to access your ClickUp account. Please enter a Personal Access Token to gain access.</p><br>
                    <input type="text" id="pat-input" class="text-input" placeholder="Personal Access Token">
                    <button class="authorize-button">Authorize</button>
                    <script nonce="${nonce}" src="${js}"></script>
                </body>
            </html>
        `;
    }
}

function getNonce() {
	let text = '';
	const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
	for (let i = 0; i < 32; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}
	return text;
}
