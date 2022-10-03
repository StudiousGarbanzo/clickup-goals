(function () {
    const vscode = acquireVsCodeApi();

    document.querySelector(".refresh-button").addEventListener("click", () => {
        vscode.postMessage({
            command: 'reload'
        });
    });
}());   
