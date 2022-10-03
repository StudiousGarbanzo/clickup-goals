(function () {
    // @ts-ignore
    const vscode = acquireVsCodeApi();

    // @ts-ignore
    document.querySelector(".authorize-button").addEventListener("click", () => {
        authorize();
    });

    function authorize() {
        const pat = document.getElementById("pat-input").value;
        vscode.postMessage({
            command: 'authorize',
            token: pat
        });
        document.getElementById("pat-input").value = "";
    }
}());   
