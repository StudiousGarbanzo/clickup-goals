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
}());
