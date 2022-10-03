(function () {
    // @ts-ignore
    const vscode = acquireVsCodeApi();

    vscode.postMessage({
        command: 'info',
        text: 'LOLOLOL'
    });

    // @ts-ignore
    document.querySelector(".authorize-button").addEventListener("click", () => {
        vscode.postMessage({
            command: 'info',
            text: 'LOLOLOL'
        });
        authorize();
    });

    function authorize() {
        document.getElementById("pat-input").value = "";
    }
}());   
