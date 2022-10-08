(function() {
    const vscode = acquireVsCodeApi();

    const targetType = document.getElementById("target-type");

    targetType.addEventListener('change', (event) => {
        if (targetType.value === "boolean") {
            document.querySelectorAll(".target-num-props").forEach(el => {
                el.style.display = "none";
            });
        } else {
            document.querySelectorAll(".target-num-props").forEach(el => {
                el.style.display = "block";
            });
        }
    });

    document.querySelector(".create-button").addEventListener('click', () => {
        const type = document.getElementById("target-type").value;
        let unit;
        let start;
        let end;
        if (type === "boolean") {
            unit = "";
            start = 0;
            end = 1;
        } else {
            unit = document.getElementById("target-unit").value;
            start = document.getElementById("target-start").value;
            end = document.getElementById("target-end").value;
        }
        vscode.postMessage({
            command: 'create',
            name: document.getElementById("target-name").value,
            desc: document.getElementById("target-description").value,
            targetType: type,
            unit: unit,
            start: start,
            end: end
        });
    });
}());
