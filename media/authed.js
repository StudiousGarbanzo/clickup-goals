(function () {
    const vscode = acquireVsCodeApi();

    function stringToTimestamp(date) {
        const d = new Date(date);
        return d.getTime().toString();
    }

    document.querySelector(".refresh-button").addEventListener("click", () => {
        vscode.postMessage({
            command: 'reload'
        });
    });

    document.querySelector(".logout-button").addEventListener("click", () => {
        vscode.postMessage({
            command: 'logout'
        });
    });

    const goalSaveButtons = document.querySelectorAll(".save-buttons");
    for (let button of goalSaveButtons) {
        button.addEventListener('click', () => {
            const goalId = button.id.substring(4);
            const name = document.getElementById(`NAME-${goalId}`).value;
            const desc = document.getElementById(`DESC-${goalId}`).value;
            const color = document.getElementById(`COLOR-${goalId}`).value;
            const date = parseInt(stringToTimestamp(document.getElementById(`DATE-${goalId}`).value));
            vscode.postMessage({
                command: 'goalUpdate',
                goalId: goalId,
                name: name,
                desc: desc,
                color: color,
                date: date,
            });
        });
    }
}());   
