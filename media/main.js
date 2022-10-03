//@ts-check

// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.
(function () {
    // @ts-ignore
    const vscode = acquireVsCodeApi();

    function authorize() {
        vscode.window.showInformationMessage("Authorized");
    }
}());
