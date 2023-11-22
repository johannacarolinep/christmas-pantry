document.addEventListener("DOMContentLoaded", function () {
    const scoreArea = document.getElementById("score-area");
    const questionArea = document.getElementById("question-area");
    const pantryArea = document.getElementById("pantry-area");
    const quitButton = document.getElementById("quit-button");
    const nextSubmitButton = document.getElementById("next-submit-button");

    pullPantryData();
    console.log(pullPantryData());
})

async function pullPantryData() {
    const pantryRawData = await fetch("assets/json/pantry.json");
    const pantryData = pantryRawData.json();
    return pantryData;
}