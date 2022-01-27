const url = chrome.runtime.getURL('data/dataset');
document.body.innerHTML += `<div id='overlay'><a id="overlaylink">Click Inside this Box To Get Wordle Hints</a><div id="content">
<div class="unique"><div class="title">Top Matches (with Unique characters)</div><div id="unique"></div></div>
<div class="top"><div class="title">Top Matches</div><div id="top"></div></div></div>
</div>`;
let jsonData;

fetch(url)
    .then((response) => response.json()) //assuming file contains json
    .then((json) => {
        jsonData = json
        //processWords();
    });




let findMatch = (words, correct, present, missing) => {
    let wordlist = []


    for (const [word, val] of Object.entries(words)) {
        let match = true;
        for (let i = 0; i < 5; i++) {
            if (missing.indexOf(word[i]) > -1) match = false;
            if (correct[i] === '?') continue;
            if (correct[i] !== word[i]) match = false;
        }

        present.forEach(ele => {
            for (let j = 0; j < 5; j++) {
                if (ele[j] === word[j]) match = false;
                if (ele[j] === '?') continue;
                if (word.indexOf(ele[j]) === -1) match = false;
            }
        });

        if (match) {
            wordlist.push({ key: word, value: val })
        }
    }

    wordlist.sort((a, b) => b.value - a.value)
    result = [];
    wordlist.slice(0, 10).forEach(ele => result.push(ele.key));

    return result.join(', ');
}

let processWords = () => {
    const gameState = JSON.parse(window.localStorage.gameState);
    const state = gameState.boardState
    const evals = gameState.evaluations;
    let paramCorrect = ['?', '?', '?', '?', '?']
    let paramsPresent = [];
    let missingChars = [];

    for (let i = 0; i < 6; i++) {
        const guess = state[i];
        const checks = evals[i];
        let paramPresent = ['?', '?', '?', '?', '?']

        if (checks === null || checks === undefined) break;
        for (let j = 0; j < 5; j++) {
            if (checks[j] === 'correct') paramCorrect[j] = guess[j];
            else if (checks[j] === 'present') paramPresent[j] = guess[j];
            else if (checks[j] === 'absent' && paramPresent.indexOf(guess[j]) === -1) {
                const testIfPresentInOptionals = paramsPresent.filter((ele => ele.indexOf(guess[j]) > -1));
                if (testIfPresentInOptionals.length === 0) missingChars.push(guess[j]);
            }
        }

        if (paramPresent.join('') !== "?????") paramsPresent.push(paramPresent);

    }

    const soln = document.getElementById("top");
    const unique = document.getElementById("unique");
    document.getElementById("content").style.display = 'block';
    let top = findMatch(jsonData.words, paramCorrect, paramsPresent, missingChars);
    let topUnique = findMatch(jsonData.unique, paramCorrect, paramsPresent, missingChars);

    soln.innerHTML = top;
    unique.innerHTML = topUnique;

    //console.log(paramCorrect, paramsPresent, missingChars)

}

let overylay = document.getElementById('overlay');
overylay.addEventListener('click', (e)=>{
    e.stopPropagation();
    processWords();
})

/* document.addEventListener('keyup', (e)=>{
    if(e.code === 'Enter'){
        processWords();
    }

}); */


