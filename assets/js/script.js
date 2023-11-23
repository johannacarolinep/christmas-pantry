var userSelected = [];
var recipe = [];
var score = 0;
var possibleScore = 0;
var questionIndex = 0;
var maxLevel = 0;

document.addEventListener("DOMContentLoaded", runGame);

async function runGame() {
    const scoreArea = document.getElementById("score-area");
    const questionArea = document.getElementById("question-area");
    const pantryArea = document.getElementById("pantry-area");
    const quitButton = document.getElementById("quit-button");
    const nextSubmitButton = document.getElementById("next-submit-button");

    const pantryData = await pullPantryData();
    console.log("Pantrydata:", pantryData);
    if (questionIndex === 0) {
        createPantry(pantryData, pantryArea);
    }
    createQuestion(pantryData.pantry[questionIndex], questionArea);
    updateSelectionCounter();

    nextSubmitButton.addEventListener("click", nextSubmit);

    maxLevel = pantryData.pantry.length - 1;
}

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
function createQuestion(level, questionDiv) {
    console.log("Create question function");
    const question = level.question;
    const name = level.name;
    const country = level.country;
    const description = level.description;
    recipe = level.recipe;
    questionDiv.innerHTML = question + " " + name + " " + " " + country + " " + description + " Recipe is: " + recipe;
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
    if (questionIndex === maxLevel) {
        nextSubmitButton.innerHTML = "";
    } else {
        if (nextSubmitButton.innerHTML === "Submit") {
            submitSelection();
            nextSubmitButton.innerHTML = "Next";
        } else {
            nextQuestion();
            nextSubmitButton.innerHTML = "Submit";
        }
    }

}

//Check userSelected against recipe array. 
function submitSelection() {
    console.log("Submitting selection:");
    userCorrect = userSelected.filter(item => recipe.includes(item));
    console.log("userCorrect:" + userCorrect);
    userIncorrect = userSelected.filter(item => !recipe.includes(item));
    console.log("userIncorrect:" + userIncorrect);
    userMissed = recipe.filter(item => !userSelected.includes(item));
    console.log("userMissed:" + userMissed);

    let countCorrect = userCorrect.length;
    let countIncorrect = userIncorrect.length;
    let countMissed = userMissed.length;

    document.getElementById("results-area").innerHTML = `You got ${countCorrect} right! ${countIncorrect} were wrong, and you missed ${countMissed}`;

    let pantry = document.getElementById("pantry-area");
    let pantryArray = pantry.childNodes;
    for (let items in pantryArray) {
        console.log("pantryArray:", pantryArray[items].innerHTML);
        if (userCorrect.includes(pantryArray[items].innerHTML)) {
            pantryArray[items].style.backgroundColor = "green";
            pantryArray[items].style.border = "";
        } else if (userIncorrect.includes(pantryArray[items].innerHTML)) {
            pantryArray[items].style.backgroundColor = "red";
            pantryArray[items].style.border = "";
        } else if (userMissed.includes(pantryArray[items].innerHTML)) {
            pantryArray[items].style.backgroundColor = "yellow";
            pantryArray[items].style.border = "";
        }
    }
    updateScore(countCorrect, countIncorrect);
}

function nextQuestion() {
    console.log("Moving to next question");
    questionIndex++;
    console.log("Index is: ", questionIndex);
    userSelected = [];
    let pantry = document.getElementById("pantry-area");
    let pantryArray = pantry.childNodes;
    for (let items in pantryArray) {
        if (pantryArray[items].innerHTML) {
            console.log("pantryArray1:", pantryArray[items]);
            pantryArray[items].style.backgroundColor = "white";
        }
    }
    runGame();
}

function updateSelectionCounter() {
    document.getElementById("selection-counter").innerHTML = userSelected.length + "/" + recipe.length + " selected."
}

function updateScore(countCorrect, countIncorrect) {
    possibleScore += (recipe.length);
    score += (countCorrect - countIncorrect);
    document.getElementById("score-area").innerHTML = `Your current score: ${score} / ${possibleScore}`;
}