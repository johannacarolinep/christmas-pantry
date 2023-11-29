var userSelected = [];
var recipe = [];
var score = 0;
var possibleScore = 0;
var questionIndex = 0;
var maxLevel = 0;

document.addEventListener("DOMContentLoaded", runGame);

async function runGame() {
    const pantryArea = document.getElementById("pantry-area");
    const quitButton = document.getElementById("quit-button");
    const nextSubmitButton = document.getElementById("next-submit-button");
    const finishButton = document.getElementById("finish-button");
    const pantryData = await pullPantryData();
    console.log("Pantrydata:", pantryData);

    if (questionIndex === 0) {
        createPantry(pantryData, pantryArea);
    }

    createQuestion(pantryData.pantry[questionIndex]);
    updateSelectionCounter();

    nextSubmitButton.addEventListener("click", nextSubmit);
    quitButton.addEventListener("click", confirmQuit);
    finishButton.addEventListener("click", quitGame);
    maxLevel = pantryData.pantry.length - 1;

    updateLevel();
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
    pantryDiv.innerHTML = "";
    console.log(pantryData);

    for (let i = 0; i < pantryData.pantry.length; i++) {
        masterPantryArray = masterPantryArray.concat(pantryData.pantry[i].recipe);
        console.log(pantryData.pantry[i].recipe);
    }
    console.log("Master pantry array:", masterPantryArray);
    const pantryArray = [...new Set(masterPantryArray)];
    console.log("pantryArray:", pantryArray);

    //Randomize order in pantry array
    shuffle(pantryArray);

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
function createQuestion(level) {
    console.log("Create question function");
    recipe = level.recipe;
    document.getElementById("cake-name").innerHTML = level.name;
    document.getElementById("cake-country").innerHTML = `(${level.country})`;
    document.getElementById("cake-question").innerHTML = level.question;
    document.getElementById("question-image").setAttribute("src", level.image);
    document.getElementById("question-image").setAttribute("alt", level.name);
    document.getElementById("cake-modal-heading").innerHTML = `About ${level.name}:`;
    document.getElementById("cake-description").innerHTML = level.description;
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
            document.getElementById("quit-button").hidden = "true";
            document.getElementById("quit-button").setAttribute('aria-hidden', 'true');
            document.getElementById("finish-button").removeAttribute("hidden");
            document.getElementById("finish-button").setAttribute('aria-hidden', 'false');
        } else {
            nextSubmitButton.innerHTML = "Next";
        }
    } else {
        nextQuestion();
        scrollTop();
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

    updateQuestionResults(countCorrect, countIncorrect, countMissed);
    displayPantryFeedback(userCorrect, userIncorrect, userMissed);
    updateScore(countCorrect, countIncorrect);
}

/**
 * Takes 3 arrays of strings. Creates another array based on the children of an HTML element.
 * Compares the created array to the parameter arrays and adds/removes classes to the HTML elements
 * based on whether they are found in the parameter arrays.
 * @param {String[]} userCorrect 
 * @param {String[]} userIncorrect 
 * @param {String[]} userMissed 
 */
function displayPantryFeedback(userCorrect, userIncorrect, userMissed) {
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
    if (score < 0) {
        score = 0;
    }
    document.getElementById("score-area").innerHTML = `Score: ${score} / ${possibleScore}`;
}

/**
 * Takes three numbers and inserts them in a string which 
 * is added to the innerHTML of a HTML element.
 * @param {Number} countCorrect 
 * @param {Number} countIncorrect 
 * @param {Number} countMissed 
 */
function updateQuestionResults(countCorrect, countIncorrect, countMissed) {
    document.getElementById("results-area").innerHTML = `You got ${countCorrect} right! ${countIncorrect} were wrong, and you missed ${countMissed}`;
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

function updateLevel() {
    let level = questionIndex + 1;
    let finalLevel = maxLevel + 1;
    document.getElementById("level-area").innerHTML = `Level: ${level} / ${finalLevel}`;
}

/**
 * Will randomize the item order in a given array
 * Fisher-Yates Shuffle, credit: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 * @param {Array} shuffleArray 
 * @returns {Array}, with randomized order
 */
function shuffle(shuffleArray) {
    let currentIndex = shuffleArray.length
    let randomIndex;

    while (currentIndex > 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [shuffleArray[currentIndex], shuffleArray[randomIndex]] = [
            shuffleArray[randomIndex], shuffleArray[currentIndex]
        ];
    }
    return shuffleArray;
}

/**
 * Scrolls to the top of the page.
 * Credit: https://www.w3schools.com/howto/howto_js_scroll_to_top.asp
 */
function scrollTop() {
    document.body.scrollTop = 0; // For Safari
    document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
}

/**
 * Opens confirmation modal when quit button is clicked. 
 * Calls quitGame function if confirmed.
 */
function confirmQuit(event) {

    let modal = document.getElementById("confirm-quit-modal");
    let cancelButton = document.getElementById("confirm-quit-modal-close");
    let confirmQuitButton = document.getElementById("confirm-quit");

    modal.style.display = "block"; //opens modal

    cancelButton.addEventListener("click", function () {
        modal.style.display = "none"; //closes modal
    })

    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = "none"; //closes modal
        }
    }

    confirmQuitButton.addEventListener("click", function () {
        modal.style.display = "none"; //closes modal
        quitGame();
    });
}
/**
 * Opens main modal and updates content to show final score
 */
function quitGame() {
    console.log("Quitting game");
    let quitModal = document.getElementById("quit-modal");
    let startGameButton = document.getElementById("restart-game-button");

    quitModal.style.display = "block"; //opens modal
    document.getElementById("final-score-display").innerHTML = `Final score: ${score}`;
    document.getElementById("score-context").innerHTML = `You got ${score} points out of ${possibleScore} possible points.`;

    startGameButton.addEventListener("click", function () {
        quitModal.style.display = "none";
        startGame();
    })
}

function startGame() {
    console.log("Restarting game");
    userSelected = [];
    recipe = [];
    score = 0;
    possibleScore = 0;
    questionIndex = 0;
    maxLevel = 0;
    runGame();
    resetControls();
}

function resetControls() {
    document.getElementById("next-submit-button").removeAttribute("hidden");
    document.getElementById("next-submit-button").removeAttribute("aria-hidden");
    document.getElementById("quit-button").removeAttribute("hidden");
    document.getElementById("quit-button").removeAttribute("aria-hidden");
    document.getElementById("finish-button").hidden = "true";
    document.getElementById("finish-button").setAttribute('aria-hidden', 'true');
}