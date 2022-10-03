import * as vscode from 'vscode';
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
        this.reloadHtml();
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
                    this.reloadHtml();
                    return;
              }
            },
            undefined,
            this.context.subscriptions
          );
    }

    public reloadHtml(): void {
        this._view!.webview.html = this._getHtmlForWebview(this._view!.webview);
    }

    private authorize(token: string) {
        isTokenValid(token).then(valid => {
            if (!valid) {
                vscode.window.showErrorMessage("Invalid Personal Access Token");
                return;
            } else {
                this.context.globalState.update("clickup.pat", token);
                vscode.window.showInformationMessage("Logged in to ClickUp");
            }
            // this.reloadHtml();
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview): string {
        const nonce = getNonce();
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'main.js'));
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));

        return `
            <!DOCTYPE html>
            <html lang="en">
                <head>
				    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${webview.cspSource}; script-src 'nonce-${nonce}';">
                    <link href="${styleVSCodeUri}" rel="stylesheet">
                </head>
                <body>
                    <h2>Authorization</h2>
                    <p>ClickUp Goals is not authorized to access your ClickUp account. Please enter a Personal Access Token to gain access.</p><br>
                    <input type="text" id="pat-input" class="text-input" placeholder="Personal Access Token">
                    <button class="authorize-button">Authorize</button>
                    <script nonce="${nonce}" src="${scriptUri}"></script>
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
