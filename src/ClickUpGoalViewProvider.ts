import * as vscode from 'vscode';

export class ClickUpGoalView implements vscode.WebviewViewProvider {
    public static readonly viewType = 'clickup-goals-view';

	private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) { }

    resolveWebviewView(webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext<unknown>, token: vscode.CancellationToken): void | Thenable<void> {
        this._view = webviewView;
        webviewView.webview.options = {
			enableScripts: true,

			localResourceRoots: [
				this._extensionUri
			]
		};
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(data => {
			switch (data.type) {
				// TODO
			}
		});
    } 

    private _getHtmlForWebview(webview: vscode.Webview): string {
        const styleVSCodeUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'media', 'vscode.css'));

        return `
            <!DOCTYPE html>
            <html lang="en">
                <head>
                    <link href="${styleVSCodeUri}" rel="stylesheet">
                </head>
                <body>
                    <h2>Authorization</h2>
                    <p>ClickUp Goals is not authorized to access your ClickUp account. Please enter a Personal Access Token to gain access.</p><br>
                    <input type="text" class="text-input" placeholder="Personal Access Token">
                    <button>Authorize</button>
                </body>
            </html>
        `;
    }
}
