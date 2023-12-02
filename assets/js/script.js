/* Variables */
let userSelected = [];
let recipe = [];
let score = 0;
let possibleScore = 0;
let questionIndex = 0;
let maxLevel = 0;
let submitted = false;

/* Wait for page to load before initializing game */
document.addEventListener("DOMContentLoaded", initializeGame());

function initializeGame() {
    /* Welcome modal */
    const welcomeModal = document.getElementById("welcome-modal");
    const welcomeCloseBtn = document.getElementById("welcome-modal-close");
    displayModal(welcomeModal, undefined, welcomeCloseBtn, true, true);

    /* Cake modal */
    const cakeModal = document.getElementById("cake-modal");
    const cakeOpenModalBtn = document.getElementById("cake-info-btn");
    const cakeCloseModalBtn = document.getElementById("cake-modal-close");
    displayModal(cakeModal, cakeOpenModalBtn, cakeCloseModalBtn, false, false);

    /* Instructions modal */
    const instructionsModal = document.getElementById("instructions-modal");
    const instructionsOpenBtn = document.getElementById("instructions-btn");
    const instructionscloseBtn = document.getElementById("instructions-modal-close");
    displayModal(instructionsModal, instructionsOpenBtn, instructionscloseBtn, false, false);

    /* Confirm quit modal */
    const confirmQuitModal = document.getElementById("confirm-quit-modal");
    const confirmQuitOpenBtn = document.getElementById("quit-button");
    const confirmQuitCancel = document.getElementById("confirm-quit-modal-close");
    const confirmQuitButton = document.getElementById("confirm-quit");
    displayModal(confirmQuitModal, confirmQuitOpenBtn, confirmQuitCancel, false, false);
    confirmQuitButton.addEventListener("click", function () {
        confirmQuitModal.style.display = "none"; //closes modal
        quitGame();
    });

    const finishButton = document.getElementById("finish-button");
    finishButton.addEventListener("click", quitGame);

    runGame();
}

async function runGame() {
    const pantryArea = document.getElementById("pantry-area");
    const nextSubmitButton = document.getElementById("next-submit-button");
    const pantryData = await pullPantryData("assets/json/pantry.json");

    if (questionIndex === 0) {
        createPantry(pantryData, pantryArea);
    }

    createQuestion(pantryData.pantry[questionIndex]);
    updateSelectionCounter();

    nextSubmitButton.addEventListener("click", nextSubmit);
    maxLevel = pantryData.pantry.length - 1;

    updateLevel();
}


/**
 * Pulls the pantry data from a JSON file given the file address. Returns object pantryData.
 * @param {string} dataAddressString 
 * @returns pantryData, an array of objects (NEEDS MORE WORK)
 */
async function pullPantryData(dataAddressString) {
    const pantryRawData = await fetch(dataAddressString);
    const pantryData = await pantryRawData.json();
    return pantryData;
}

/**
 * Creates an array of all pantry item recipe (ingredients)
 * by concatenating the recipe arrays of all pantry items and deduplicating.
 * Builds the pantry divs in HTML.
 */
function createPantry(pantryData, pantryArea) {
    let masterPantryArray = [];
    pantryArea.innerHTML = "";

    /* Fills masterPantryArray with all recipe array items, 
    by concatenating all recipes */
    for (let i = 0; i < pantryData.pantry.length; i++) {
        masterPantryArray = masterPantryArray.concat(pantryData.pantry[i].recipe);
    }

    /* Fills pantryArray with masterPantryArray excluding duplicates */
    const pantryArray = [...new Set(masterPantryArray)];

    //Randomize order in pantry array
    shuffle(pantryArray);

    /* For each item in pantryArray, create a div, add event listener and 
    classes, and append to pantryArea */
    for (item in pantryArray) {
        const pantryItem = document.createElement("div");
        pantryItem.innerHTML = pantryArray[item];
        pantryItem.addEventListener("click", pantryItemSelect);
        pantryItem.classList.add("pantry-item");
        pantryItem.classList.add("pantry-item-active");
        pantryArea.appendChild(pantryItem);
    }
}

/**
 * Builds the question and recipe 
 * Reference: https://www.w3schools.com/howto/howto_css_modals.asp
 */

/**
 * Builds the question in HTML and updates the recipe using data from the json 
 * file. Takes an integer number, the index for the json library, 
 * and uses it to set the innerHTML and attributes to the correct values 
 * in the questionArea and cake info modal.
 * @param {number} index 
 */
function createQuestion(index) {
    recipe = index.recipe;
    document.getElementById("cake-name").innerHTML = index.name;
    document.getElementById("cake-country").innerHTML = `(${index.country})`;
    document.getElementById("cake-question").innerHTML = index.question;
    document.getElementById("cake-recipe-hint").innerHTML = `This recipe contains ${recipe.length} ingredients.`;
    document.getElementById("question-image").setAttribute("src", index.image);
    document.getElementById("question-image").setAttribute("alt", index.altText);
    /* Reference: https://www.w3schools.com/howto/howto_css_modals.asp */
    document.getElementById("cake-modal-heading").innerHTML = `About ${index.name}:`;
    document.getElementById("cake-description").innerHTML = index.description;
}

/**
 * Adds a border to pantry item when clicked, and adds item to users selection, 
 * or removes the border on click if already existing, 
 * and removes item from user selection. 
 * Only selects the item if selection < recipe.
 */

/**
 * Manages the users selection of items from the pantry 
 * by reacting to clicks on the pantry items, 
 * given the user has not already submitted their selection. 
 * @param {"click"} event 
 */
function pantryItemSelect(event) {
    const clickedItem = event.target;

    if (!submitted) {
        /* if not already selected, and counter is not full, add item to selection
        and update the counter */
        if (!clickedItem.classList.contains("pantry-item-selected") && userSelected.length < recipe.length) {
            clickedItem.classList.add("pantry-item-selected");
            userSelected.push(clickedItem.innerHTML);
            updateSelectionCounter();
            /* if counter is now full, remove active class from all pantry items, 
            except those in selection */
            if (userSelected.length === recipe.length) {
                removeActive();
            }
            //if already selected, remove it from the selection    
        } else if (clickedItem.classList.contains("pantry-item-selected")) {
            clickedItem.classList.remove("pantry-item-selected");
            userSelected = userSelected.filter(item => item !== clickedItem.innerHTML);
            updateSelectionCounter();
            // add active class to all remaining items (since counter is no longer full)
            addActive();
        }
    }
}

/**
 * Iterates through the pantry items. Removes the active class 
 * from items that don't have the selected class.
 */
function removeActive() {
    let pantry = document.getElementById("pantry-area");
    let pantryArray = pantry.childNodes;

    pantryArray.forEach(function (element) {
        if (!element.classList.contains("pantry-item-selected")) {
            element.classList.remove("pantry-item-active");
        }
    })
}

/**
 * Iterates through the pantry items. Adds the active class to items 
 * if they are not in the selection nor already have the active class.
 */
function addActive() {
    let pantry = document.getElementById("pantry-area");
    let pantryArray = pantry.childNodes;

    pantryArray.forEach(function (element) {
        if (!element.classList.contains("pantry-item-selected" && !element.classList.contains("pantry-item-active"))) {
            element.classList.add("pantry-item-active");
        }
    })
}

/**
 * If the button is "Submit", runs the submitSelection function. 
 * Changes the button to "Next" or if at maxlevel, hides the next/submit button 
 * and the quit button, and unhides the "Finish" button.
 * If the button is "Next", calls nextQuestion function, and changes to "Submit"
 * @param {"click"} event 
 */
function nextSubmit(event) {
    const nextSubmitButton = event.target;
    if (nextSubmitButton.innerHTML === "Submit") {
        submitSelection();
        if (questionIndex === maxLevel) {
            nextSubmitButton.hidden = "true";
            nextSubmitButton.setAttribute("aria-hidden", "true");
            document.getElementById("quit-button").hidden = "true";
            document.getElementById("quit-button").setAttribute("aria-hidden", "true");
            document.getElementById("finish-button").removeAttribute("hidden");
            document.getElementById("finish-button").setAttribute("aria-hidden", "false");
        } else {
            nextSubmitButton.innerHTML = "Next";
        }
    } else {
        nextQuestion();
        scrollTop();
        nextSubmitButton.innerHTML = "Submit";
    }
}

/**
 * Compares the users selection to the recipe to create 3 new arrays, 
 * userCorrect, userIncorrect, and userMissed.
 */
function submitSelection() {
    submitted = true;
    //items that are in users selection and in the recipe
    userCorrect = userSelected.filter(item => recipe.includes(item));
    //items in the users selection that are not in the recipe
    userIncorrect = userSelected.filter(item => !recipe.includes(item));
    //items in the recipe that are not in the users selection
    userMissed = recipe.filter(item => !userSelected.includes(item));

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

    pantryArray.forEach(function (element) {
        let feedbackIcon = document.createElement("i");

        if (userCorrect.includes(element.innerHTML)) {
            element.classList.add("item-correct");
            feedbackIcon.className = "fa-solid fa-circle-check";
        } else if (userIncorrect.includes(element.innerHTML)) {
            element.classList.add("item-incorrect");
            feedbackIcon.className = "fa-solid fa-circle-xmark";
        } else if (userMissed.includes(element.innerHTML)) {
            element.classList.add("item-missed");
            feedbackIcon.className = "fa-solid fa-minus";
        }

        element.appendChild(feedbackIcon);
        element.classList.remove("pantry-item-selected");

        if (element.classList.contains("pantry-item-active")) {
            element.classList.remove("pantry-item-active");
        }
    })
}

function nextQuestion() {
    submitted = false;
    questionIndex++;
    userSelected = [];
    let pantry = document.getElementById("pantry-area");
    let pantryArray = pantry.childNodes;

    pantryArray.forEach(function (element) {
        if (element.innerHTML) {
            element.classList.remove("item-correct");
            element.classList.remove("item-incorrect");
            element.classList.remove("item-missed");
            if (element.querySelector("i")) {
                element.querySelector("i").remove();
            }
            element.classList.add("pantry-item-active");
        }
    })

    resetQuestionResults();
    runGame();
}

function updateSelectionCounter() {
    const selectionCounter = document.getElementById("selection-counter");
    selectionCounter.innerHTML = `${userSelected.length}/${recipe.length} selected`;

    if (userSelected.length === recipe.length) {
        selectionCounter.classList.add("counter-full");
    }

    if (userSelected.length < recipe.length && selectionCounter.classList.contains("counter-full")) {
        selectionCounter.classList.remove("counter-full");
    }
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
    const resultsArea = document.getElementById("results-area");

    if (countCorrect === recipe.length) {
        resultsArea.innerHTML = `${countCorrect}/${recipe.length}! Congrats!`;
    } else if (countCorrect === 0) {
        resultsArea.innerHTML = `Correct: ${countCorrect}&nbsp;&nbsp;&nbsp;Incorrect: ${countIncorrect}&nbsp;&nbsp;&nbsp;Missed: ${countMissed}&nbsp;&nbsp;&nbsp;Better luck next time!`;
    } else {
        resultsArea.innerHTML = `Correct: ${countCorrect}&nbsp;&nbsp;&nbsp;Incorrect: ${countIncorrect}&nbsp;&nbsp;&nbsp;Missed: ${countMissed}`;
    }
}

function resetQuestionResults() {
    document.getElementById("results-area").innerHTML = "";
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
 * Opens main modal and updates content to show final score
 */
function quitGame() {
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
    document.getElementById("finish-button").setAttribute("aria-hidden", "true");
}

/**
 * Gets the modal and "button" from HTML and 
 * Reference: https://www.w3schools.com/howto/howto_css_modals.asp
 */
function displayModal(modalParam, openModalBtn, closeModalBtn, fullScreen, defaultOpen) {
    if (defaultOpen) {
        modalParam.style.display = "block"; //opens modal
    }

    if (openModalBtn) {
        openModalBtn.onclick = function () {
            modalParam.style.display = "block"; //opens modal
        }
    }

    closeModalBtn.onclick = function () {
        modalParam.style.display = "none"; //closes modal
    }

    if (!fullScreen) {
        window.onclick = function (event) {
            if (event.target == modalParam) {
                modalParam.style.display = "none"; //closes modal
            }
        }
    }
}