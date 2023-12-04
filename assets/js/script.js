/* jshint esversion:8 */
/* Variables */
let userSelected = [];
let recipe = [];
let score = 0;
let possibleScore = 0;
let questionIndex = 0;
let maxIndex = 0;
let submitted = false;
let pantryArray = [];

/* Wait for page to load before initializing game */
document.addEventListener("DOMContentLoaded", initializeGame());

/**
 * Reads the modals from HTML, calls function to manage how modals are displayed.
 * Adds event listener to the nextSubmitButton.
 * Calls the runGame function.
 */
function initializeGame() {
    // Welcome modal
    const welcomeModal = document.getElementById("welcome-modal");
    const welcomeCloseBtn = document.getElementById("welcome-modal-close");
    displayModal(welcomeModal, undefined, welcomeCloseBtn, true, true);

    // Cake modal
    const cakeModal = document.getElementById("cake-modal");
    const cakeOpenModalBtn = document.getElementById("cake-info-btn");
    const cakeCloseModalBtn = document.getElementById("cake-modal-close");
    displayModal(cakeModal, cakeOpenModalBtn, cakeCloseModalBtn, false, false);

    // Instructions modal
    const instructionsModal = document.getElementById("instructions-modal");
    const instructionsOpenBtn = document.getElementById("instructions-btn");
    const instructionscloseBtn = document.getElementById("instructions-modal-close");
    displayModal(instructionsModal, instructionsOpenBtn, instructionscloseBtn, false, false);

    // Confirm quit modal
    const confirmQuitModal = document.getElementById("confirm-quit-modal");
    const confirmQuitOpenBtn = document.getElementById("quit-button");
    const confirmQuitCancel = document.getElementById("confirm-quit-modal-close");
    const confirmQuitButton = document.getElementById("confirm-quit");
    displayModal(confirmQuitModal, confirmQuitOpenBtn, confirmQuitCancel, false, false);

    /* Quit modal - when confirmQuitButton in confirm quit modal is clicked, 
    or when finishButton is clicked, calls function quitGame */
    confirmQuitButton.addEventListener("click", function () {
        confirmQuitModal.style.display = "none"; //closes confirm quit modal
        quitGame();
    });

    const finishButton = document.getElementById("finish-button");
    finishButton.addEventListener("click", quitGame);

    const nextSubmitButton = document.getElementById("next-submit-button");
    nextSubmitButton.addEventListener("click", nextSubmit);

    runGame();
}

/**
 * If at start of game, calls createPantry. Otherwise, calls createQuestion, updateSelectionCounter, 
 * sets the value of maxIndex. Calls updateLevel.
 */
async function runGame() {
    const pantryArea = document.getElementById("pantry-area");
    const pantryData = await pullPantryData("assets/json/pantry.json");

    if (questionIndex === 0) {
        createPantry(pantryData, pantryArea);
    }

    createQuestion(pantryData.pantry[questionIndex]);
    updateSelectionCounter();
    maxIndex = pantryData.pantry.length - 1;
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

    /* Fills pantryStringArray with masterPantryArray excluding duplicates */
    const pantryStringArray = [...new Set(masterPantryArray)];

    //Randomize order in pantry array
    shuffle(pantryStringArray);

    /* For each item in pantryStringArray, create a div, add event listener and 
    classes, and append to pantryArea */
    for (let item in pantryStringArray) {
        const pantryItem = document.createElement("div");
        pantryItem.innerHTML = pantryStringArray[item];
        pantryItem.addEventListener("click", pantryItemSelect);
        pantryItem.classList.add("pantry-item");
        pantryItem.classList.add("pantry-item-active");
        pantryArea.appendChild(pantryItem);
    }

    pantryArray = pantryArea.childNodes;
}

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
 * Manages the users selection of items from the pantry 
 * by reacting to clicks on the pantry items, 
 * given the user has not already submitted their selection. 
 * @param {Event} event 
 */
function pantryItemSelect(event) {
    const clickedItem = event.target;

    if (!submitted) {
        /* if not selected, and counter is not full, add item to selection
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

    pantryArray.forEach(function (element) {
        if (!element.classList.contains("pantry-item-selected")) {
            element.classList.remove("pantry-item-active");
        }
    });
}

/**
 * Iterates through the pantry items. Adds the active class to items 
 * if they are not in the selection nor already have the active class.
 */
function addActive() {

    pantryArray.forEach(function (element) {
        if (!element.classList.contains("pantry-item-selected" && !element.classList.contains("pantry-item-active"))) {
            element.classList.add("pantry-item-active");
        }
    });
}

/**
 * If the button is "Submit", runs the submitSelection function. 
 * Changes the button to "Next" or if at maxlevel, hides the next/submit button 
 * and the quit button, and unhides the "Finish" button.
 * If the button is "Next", calls nextQuestion function, and changes to "Submit"
 * @param {Event} event 
 */
function nextSubmit(event) {
    const nextSubmitButton = event.target;
    if (nextSubmitButton.innerHTML === "Submit") {
        submitSelection();
        if (questionIndex === maxIndex) {
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
 * Takes 3 arrays of strings. 
 * Iterates the pantryArray items, checking if the innerHTML of the item 
 * matches an item in one of the 3 arrays. If matching, adds an icon and classes.
 * Removes the selected class and the active class.
 * @param {String[]} userCorrect
 * @param {String[]} userIncorrect 
 * @param {String[]} userMissed 
 */
function displayPantryFeedback(userCorrect, userIncorrect, userMissed) {

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
    });
}

/**
 * Moves the game to the next question. Changes state away from "submitted", 
 * increases question index. Resets user selection, and calls functions to reset 
 * pantry (activate pantry items) and question results. Calls runGame.
 */
function nextQuestion() {
    submitted = false;
    questionIndex++;
    userSelected = [];
    resetPantry();
    resetQuestionResults();
    runGame();
}

/**
 * Resets the pantry. Iterates the child nodes of the pantry area, 
 * removes classes and icons, adds the pantry-item-active class 
 */
function resetPantry() {

    pantryArray.forEach(function (element) {
        element.classList.remove("item-correct");
        element.classList.remove("item-incorrect");
        element.classList.remove("item-missed");
        if (element.querySelector("i")) {
            element.querySelector("i").remove();
        }
        element.classList.add("pantry-item-active");
    });
}

/**
 * Updates the selection counter (element) inner html, 
 * using the length of the user selection and the recipe.
 * Adds/removes a class based on if the counter is full.
 */
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

/**
 * Adds the current levels recipe length to the possible score, 
 * and updates the users score. Displays the new values in the score area.
 * @param {number} countCorrect, the number of ingredients the user got right
 * @param {number} countIncorrect, the number of ingredients the user got wrong
 */
function updateScore(countCorrect, countIncorrect) {
    possibleScore += (recipe.length);
    //Adds 1 point for each correct, removes 1 point for each incorrect
    score += (countCorrect - countIncorrect);
    //if score is negative, sets the score to 0
    if (score <= 0) {
        score = 0;
    }
    document.getElementById("score-area").innerHTML = `Score: ${score} / ${possibleScore}`;
}

/**
 * Displays the question results. Takes three numbers and inserts them in a 
 * string which is added to the results area. Adds different messages based on 
 * the results.
 * @param {Number} countCorrect 
 * @param {Number} countIncorrect 
 * @param {Number} countMissed 
 */
function updateQuestionResults(countCorrect, countIncorrect, countMissed) {
    const resultsArea = document.getElementById("results-area");

    // if user got all items correct
    if (countCorrect === recipe.length) {
        resultsArea.innerHTML = `${countCorrect}/${recipe.length}! Congrats!`;
        //  if user got no items correct
    } else if (countCorrect === 0) {
        resultsArea.innerHTML = `Correct: ${countCorrect}&nbsp;&nbsp;&nbsp;Incorrect: ${countIncorrect}&nbsp;&nbsp;&nbsp;Missed: ${countMissed}&nbsp;&nbsp;&nbsp;Better luck next time!`;
    } else {
        resultsArea.innerHTML = `Correct: ${countCorrect}&nbsp;&nbsp;&nbsp;Incorrect: ${countIncorrect}&nbsp;&nbsp;&nbsp;Missed: ${countMissed}`;
    }
}

/**
 * Resets the question results area, removing the inner html.
 */
function resetQuestionResults() {
    document.getElementById("results-area").innerHTML = "";
}

/**
 * Calculates and inserts the level in the level area.
 */
function updateLevel() {
    let level = questionIndex + 1;
    let finalLevel = maxIndex + 1;
    document.getElementById("level-area").innerHTML = `Level: ${level} / ${finalLevel}`;
}

/**
 * Will randomize the item order in a given array
 * Fisher-Yates Shuffle, credit: https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
 * @param {Array} shuffleArray 
 * @returns {Array}, with randomized order
 */
function shuffle(shuffleArray) {
    let currentIndex = shuffleArray.length;
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
 * Displays the quit modal and updates its content to show the final score. 
 * Calls function to restart game if user clicks the restart game button.
 */
function quitGame() {
    let quitModal = document.getElementById("quit-modal");
    let startGameButton = document.getElementById("restart-game-button");

    quitModal.style.display = "block"; //opens modal
    document.getElementById("final-score-display").innerHTML = `Final score: ${score}`;
    document.getElementById("score-context").innerHTML = `You got ${score} points out of ${possibleScore} possible points.`;

    // Closes the modal and calls functon to restart game
    startGameButton.addEventListener("click", function () {
        quitModal.style.display = "none";
        restartGame();
    });
}

/**
 * Resets the game variables, 
 * calls functions to reset the game and run the game.
 */
function restartGame() {
    submitted = false;
    userSelected = [];
    recipe = [];
    score = 0;
    possibleScore = 0;
    questionIndex = 0;
    maxLevel = 0;
    resetQuestionResults();
    document.getElementById("score-area").innerHTML = `Score: ${score}`;
    resetControls();
    resetPantry();
    runGame();
}

/**
 * Resets the "controls area", hides the finish button 
 * and unhides the next/submit button and quit button. 
 */
function resetControls() {
    const nextSubmitBtn = document.getElementById("next-submit-button");
    const quitBtn = document.getElementById("quit-button");
    const finishBtn = document.getElementById("finish-button");

    nextSubmitBtn.innerHTML = "Submit";
    nextSubmitBtn.removeAttribute("hidden");
    nextSubmitBtn.removeAttribute("aria-hidden");
    quitBtn.removeAttribute("hidden");
    quitBtn.removeAttribute("aria-hidden");
    finishBtn.hidden = "true";
    finishBtn.setAttribute("aria-hidden", "true");
}

/**
 * Manages displaying of modals. Takes 5 parameters.
 * Reference: https://www.w3schools.com/howto/howto_css_modals.asp
 * @param {Element} modalParam, the modal 
 * @param {Element} openModalBtn, the element used to "open" or display the modal 
 * @param {Element} closeModalBtn, the element used to "close" or hide the modal
 * @param {Boolean} fullScreen, if set to true, the modal can not be hidden by 
 * clicking in the window, outside of the modal content 
 * @param {Boolean} defaultOpen, if true, the modal is displayed by default, 
 * if false, the modal is hidden by default
 */
function displayModal(modalParam, openModalBtn, closeModalBtn, fullScreen, defaultOpen) {
    // if true, modal displayed by default
    if (defaultOpen) {
        modalParam.style.display = "block";
    }

    // if there is an openModalBtn, modal displayed when clicking
    if (openModalBtn) {
        openModalBtn.onclick = function () {
            modalParam.style.display = "block"; //opens modal
        };
    }

    // modal hidden when clicking the closeModalBtn
    closeModalBtn.onclick = function () {
        modalParam.style.display = "none"; //closes modal
    };

    // if fullScreen is false, hides when clicking outside the modal content
    if (!fullScreen) {
        window.onclick = function (event) {
            if (event.target == modalParam) {
                modalParam.style.display = "none"; //closes modal
            }
        };
    }
}