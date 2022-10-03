import * as vscode from 'vscode';
import * as path from 'path';
import { isTokenValid } from './lib/api';

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
              }
            },
            undefined,
            this.context.subscriptions
          );
    }

    public reloadAll(): void {
        const webview = this._view!.webview;
        const nonce = getNonce();
        const authScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
        const authedScriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'authed.js'));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));
        let pat: string | null | undefined = this.context.globalState.get("clickup.pat");
        isTokenValid(pat).then(valid => {
            if (valid) {
                webview.html = this._getAuthedHtml(webview, nonce, styleVSCodeUri, authedScriptUri);
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

    private _getAuthedHtml(webview: vscode.Webview, nonce: string, css: vscode.Uri, js: vscode.Uri) {
        const fileUri = (fp: string) => {
            const fragments = fp.split('/');
    
            return vscode.Uri.file(
                path.join(this.context.extensionPath, ...fragments)
            );
        };
        const assetUri = (fp: string) => {
			return webview.asWebviewUri(fileUri(fp));
		};
        let teamGoalsHtml: string = "";
        
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
                    <br>
                    <button class="refresh-button">Refresh</button>
                    <br>
                    <br>
                    <vscode-collapsible title="Goals" open class="collapsible">
                        <div slot="body">
                        <vscode-collapsible title="Team 1" open class="subcollapse">
                        <div slot="body">
                            hello
                        </div>
                    </vscode-collapsible>
                        </div>
                    </vscode-collapsible>
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
