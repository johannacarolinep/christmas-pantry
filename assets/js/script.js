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
        pantryItem.classList.add("pantry-item");
        pantryDiv.appendChild(pantryItem);
    }
}

/**
 * Builds the question and recipe 
 * Reference: https://www.w3schools.com/howto/howto_css_modals.asp
 */
function createQuestion(level, questionDiv) {
    console.log("Create question function");
    recipe = level.recipe;
    questionDiv.innerHTML = `
    <h2>${level.name}</h2>
    <p>${level.country}</p>
    <div id="cake-info-btn">Info</div>
    <div id="cake-modal" class="cake-modal-background">
        <div class="cake-modal-content">
            <span class="cake-modal-close">X</span>
            <h3>More info about ${level.name}</h3>
            <p>${level.description}</p>
        </div>
    </div>
    <br>
    <p>${level.question}</p>
    `
    displayCakeInfoModal();
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
    if (!clickedItem.classList.contains("pantry-item-selected") && userSelected.length < recipe.length) {
        clickedItem.classList.add("pantry-item-selected");
        userSelected.push(clickedItem.innerHTML);
        console.log("User selected: ", userSelected);
    } else {
        clickedItem.classList.remove("pantry-item-selected");
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
        if (questionIndex === maxLevel) {
            nextSubmitButton.hidden = "true";
            nextSubmitButton.setAttribute('aria-hidden', 'true');
        } else {
            nextSubmitButton.innerHTML = "Next";
        }
    } else {
        nextQuestion();
        nextSubmitButton.innerHTML = "Submit";
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
            pantryArray[items].classList.add("item-correct");
            pantryArray[items].classList.remove("pantry-item-selected");
        } else if (userIncorrect.includes(pantryArray[items].innerHTML)) {
            pantryArray[items].classList.add("item-incorrect");
            pantryArray[items].classList.remove("pantry-item-selected");
        } else if (userMissed.includes(pantryArray[items].innerHTML)) {
            pantryArray[items].classList.add("item-missed");
            pantryArray[items].classList.remove("pantry-item-selected");
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
            pantryArray[items].classList.remove("item-correct");
            pantryArray[items].classList.remove("item-incorrect");
            pantryArray[items].classList.remove("item-missed");
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

/**
 * Gets the modal and "button" from HTML and 
 * Reference: https://www.w3schools.com/howto/howto_css_modals.asp
 */
function displayCakeInfoModal() {
    let modal = document.getElementById("cake-modal");
    let cakeInfoModal = document.getElementById("cake-info-btn");
    let span = document.getElementsByClassName("cake-modal-close")[0];

    cakeInfoModal.onclick = function () {
        modal.style.display = "block"; //opens modal
    }

    span.onclick = function () {
        modal.style.display = "none"; //closes modal
    }

    window.onclick = function (event) {
        if (event.target == modal) {
            modal.style.display = "none"; //closes modal
        }
    }
}