var userSelected = [];
var recipe = [];

document.addEventListener("DOMContentLoaded", async function () {
    const scoreArea = document.getElementById("score-area");
    const questionArea = document.getElementById("question-area");
    const pantryArea = document.getElementById("pantry-area");
    const quitButton = document.getElementById("quit-button");
    const nextSubmitButton = document.getElementById("next-submit-button");

    const pantryData = await pullPantryData();
    console.log("Pantrydata:", pantryData);
    createPantry(pantryData, pantryArea);
    createQuestion(pantryData, questionArea);
    updateSelectionCounter();

    nextSubmitButton.addEventListener("click", nextSubmit);
})

/**
 * Pulls the pantry data from JSON
 * Returns object pantryData
 */
async function pullPantryData() {
    const pantryRawData = await fetch("assets/json/pantry.json");
    const pantryData = await pantryRawData.json();
    return pantryData;
}

/**
 * Creates an array of all pantry item recipe (ingredients)
 * by concatenating the recipe arrays of all pantry items and deduplicating.
 * Builds the pantry divs in HTML.
 */
function createPantry(pantryData, pantryDiv) {
    let masterPantryArray = [];

    console.log(pantryData);

    for (let i = 0; i < pantryData.pantry.length; i++) {
        masterPantryArray = masterPantryArray.concat(pantryData.pantry[i].recipe);
        console.log(pantryData.pantry[i].recipe);
    }
    console.log("Master pantry array:", masterPantryArray);
    const pantryArray = [...new Set(masterPantryArray)];
    console.log("pantryArray:", pantryArray);

    for (item in pantryArray) {
        const pantryItem = document.createElement("div");
        pantryItem.innerHTML = pantryArray[item];
        pantryItem.addEventListener("click", pantryItemSelect);
        pantryDiv.appendChild(pantryItem);
    }
}

/**
 * Creates the components of the question area 
 * for the first object in the pantryData 
 */
function createQuestion(pantryData, questionDiv) {
    console.log("Create question function");
    const firstQuestion = pantryData.pantry[0].question;
    const firstName = pantryData.pantry[0].name;
    const firstCountry = pantryData.pantry[0].country;
    const firstDescription = pantryData.pantry[0].description;
    recipe = pantryData.pantry[0].recipe;
    questionDiv.innerHTML = firstQuestion + " " + firstName + " " + " " + firstCountry + " " + firstDescription + " Recipe is: " + recipe;
}

/**
 * Adds a border to pantry item when clicked, and adds item to users selection, 
 * or removes the border on click if already existing, 
 * and removes item from user selection. 
 * Only selects the item if selection < recipe.
 */
function pantryItemSelect(event) {
    const clickedItem = event.target;
    console.log("I have been clicked", clickedItem);
    if (clickedItem.style.border === "" && userSelected.length < recipe.length) {
        clickedItem.style.border = "2px solid gray";
        userSelected.push(clickedItem.innerHTML);
        console.log("User selected: ", userSelected);
    } else {
        clickedItem.style.border = "";
        userSelected = userSelected.filter(item => item !== clickedItem.innerHTML);
        console.log("User selected: ", userSelected);
    }
    updateSelectionCounter();
}

/**
 * Checks if button is Submit, then runs the submit function
 * and updates button to "Next". If button iis "Next", runs next function
 * and updates button to submit. 
 */
function nextSubmit(event) {
    const nextSubmitButton = event.target;
    if (nextSubmitButton.innerHTML === "Submit") {
        submitSelection();
        nextSubmitButton.innerHTML = "Next";
    } else {
        nextQuestion();
        nextSubmitButton.innerHTML = "Submit";
    }
}

//Recreate userSelected array. Check against recipe array. 
function submitSelection() {
    console.log("Submitting selection:");

}

function nextQuestion() {
    console.log("Moving to next question");
}

function updateSelectionCounter() {
    document.getElementById("selection-counter").innerHTML = userSelected.length + "/" + recipe.length + " selected."
}