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

    document.querySelector(".add-goal-button").addEventListener("click", () => {
        vscode.postMessage({
            command: 'newgoal'
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

    const keyResultSaveButtons = document.querySelectorAll(".save-buttons-kr");
    for (let keyResultSaveButton of keyResultSaveButtons) {
        const keyResultId = keyResultSaveButton.id.substring(4);
        keyResultSaveButton.addEventListener('click', () => {
            let newVal = 0;
            if (keyResultSaveButton.classList.contains("boolean")) {
                newVal = (document.getElementById(`CHECKKR-${keyResultId}`).checked) ? 1 : 0;
            } else if (keyResultSaveButton.classList.contains("currency") || keyResultSaveButton.classList.contains("number")) {
                newVal = document.getElementById(`NUMKR-${keyResultId}`).value;
            }
            vscode.postMessage({
                command: 'keyResultUpdate',
                keyResultId: keyResultId,
                currentSteps: newVal
            });
        });
    }

    const keyResultCreateButtons = document.querySelectorAll(".target-create-buttons");
    for (let keyResultCreateButton of keyResultCreateButtons) {
        keyResultCreateButton.addEventListener('click', () => {
            const goalId = keyResultCreateButton.id.substring(7);
            const goalName = document.getElementById(`NAME-${goalId}`).value;
            vscode.postMessage({
                command: 'newtarget',
                goalName: goalName,
                goalId: goalId
            });
        })
    }
}());
