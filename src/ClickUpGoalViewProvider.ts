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
        return `
            <!DOCTYPE html>
            <html lang="en">
                <body>
                    <h2>LOL</h2><br>
                    <input type="text" placeholder="Personal Access Token">
                </body>
            </html>
        `;
    }
}
