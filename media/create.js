(function() {
    const vscode = acquireVsCodeApi();

    function stringToTimestamp(date) {
        const d = new Date(date);
        return d.getTime().toString();
    }

    document.getElementById("goal-date").valueAsDate = new Date();

    document.querySelector(".create-button").addEventListener('click', () => {
        vscode.postMessage({
            command: 'create',
            teamId: document.getElementById("goal-team").value,
            name: document.getElementById("goal-name").value,
            desc: document.getElementById("goal-description").value,
            color: document.getElementById("goal-color").value,
            date: stringToTimestamp(document.getElementById("goal-date").value)
        });
    });
}());
