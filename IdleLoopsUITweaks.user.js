// ==UserScript==
// @name         Quia's IdleLoops UI Mods
// @namespace    https://github.com/Quiaaaa/
// @version      0.4
// @description  Add some QoL UI elements for observing progress, and planning
// @downloadURL  https://raw.githubusercontent.com/Quiaaaa/IdleLoops-UITweaks/main/IdleLoopsUITweaks.user.js
// @author       Trimpscord
// @match        https://lloyd-delacroix.github.io/omsi-loops/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=github.io
// @grant        none
// @inject-into  page
// ==/UserScript==

// Quia's Growth Tracking and Remaining Actions
function startTracking() {
	statsAtStart = structuredClone(stats);
}

function resetTracking() {
	startTracking();
	statList.forEach((stat) => ["Talent", "ss"].forEach((suffix) => {
		document.querySelector(`#stat${stat}${suffix}Inc`).innerHTML = ''
	}))
}

function addUIElements() {
	//Talent and SS increases
	statList.forEach((stat) => ["Talent", "ss"].forEach((suffix) => {
		let statEl =  document.querySelector(`#stat${stat}${suffix}`)
		statEl.insertAdjacentHTML("afterend", `<div class="medium" id="stat${stat}${suffix}Inc"></div>`);
		// Observer for the given stat
		let observer = new MutationObserver(function() {updateIncreases(stat,suffix)});
		observer.observe(statEl, {attributes: true, childList: true, characterData: true});
	}))

	document.querySelector('#statContainer').childNodes.forEach((stat) => {
		let elements = document.createDocumentFragment();
		let levelDiv = document.createElement('div');
		levelDiv.style = 'width: 90%; margin-top: -4px;margin-bottom: -4px;';
		for (let i = 0; i < 3; i++) {
			levelDiv.appendChild(stat.children[0].children[1]);
		}
		levelDiv.children[0].style = 'color: #737373; width: 30%; float: right; text-align: right';
		levelDiv.children[1].style = 'width: 30%; text-align: center';
		levelDiv.children[2].style = 'width: 20%; float: left';
		elements.appendChild(stat.children[0]);
		elements.appendChild(levelDiv);

		for (let i = 0; i < 3; i++) {
			elements.appendChild(stat.children[0]);
		}
		stat.appendChild(elements);
	});

	//Progress requirements for Explore Actions
	towns.forEach((town) => town.progressVars.forEach((action) => {
		let observer = new MutationObserver(function() {updateRepeats(town,action)});
		let townEl = document.querySelector(`#expBar${action}`);
		//Observer for the town progress
		observer.observe(townEl, {attributes: true, childList: true, characterData: true});
		document.querySelector(`#prc${action}`).nextElementSibling.insertAdjacentHTML("afterbegin",
		`<div class="reqActions" id="reqActions${action}">
		Next: <span class="nextReq"></span>
		<input class="goal" value="100" style="width: 20px; top: -2px; margin-left:10px">:
		<span class="goalReq"></span>
		</div>`)
		document.querySelector(`#reqActions${action}`).childNodes[3].addEventListener('input', function() {updateRepeats(town,action)})
		// Call update once to create the text
		updateRepeats(town, action);
	}))

	//Create reset button
	let btn = document.createElement("button");
	btn.id = "trackingReset";
	btn.innerHTML = "Reset Tracking";
	btn.className = "button";
	btn.onclick = function() { resetTracking() }
	document.querySelectorAll("div#statsWindow label.localized")[1].insertAdjacentElement("afterend", btn)

	//realign Stats box to make it easier to fit them in, align action info with progress bar
	var style = document.createElement('style');
	style.innerHTML = `
	.statNum {
		width: 54px;
		margin: 5px 3px 0;
		text-align: left;
		font-size: 13px
	}
	.statNum div {
		font-size: 13px
	}
	.thinProgressBarUpper {
		position: relative;
	}
	.reqActions {
		position: absolute;
		right: 0;
		bottom: 100%;
	}
	`;
	document.head.appendChild(style);
}

function updateIncreases(stat, suffix) {
	//track changes in Talent and SS
	let change = suffix === "Talent" ? getTalent(stat) - getLevelFromTalent(statsAtStart[stat].talent)
				: stats[stat].soulstone - statsAtStart[stat].soulstone;
	let displayStr = change > 0 ? `(+${change})` : change < 0 ? `(${change})` : ``;
	document.querySelector(`#stat${stat}${suffix}Inc`).innerText = displayStr;
}

function updateRepeats(town, action) {
	//show required repeats to gain 1 level and all remaining levels
	let level = town.getLevel(action);
	if (level < 100) {
		let actionElement = document.querySelector(`#reqActions${action}`);
		let goal = Number(actionElement.querySelector(".goal").value);
		let toNext = Math.round((level+1)*(1 - town.getPrcToNext(action)/100))
		let toGoal = ((goal*(goal+1)/2) - level*(level+1)/2) - (level + 1 - toNext);

		actionElement.querySelector(`.nextReq`).innerText = toNext;
		actionElement.querySelector(`.goalReq`).innerText = toGoal;
	}
	else {
		document.querySelector(`#reqActions${action}`).style.display = "none";
	}
}

function updateTarget() {
	towns.forEach((town) => town.progressVars.forEach((action) => {
		updateRepeats(town, action);
	}))
}

// DemonKitty's Action Efficiency

function calcEff() {
    // Calculate the efficiency of the last active action

    let lastAction = findAction();
    if (lastAction >= 0) {
        let actionString = Koviko.totalDisplay.innerHTML;
        // Getting the time prediction from Predictor
        let lastBarIndex = actionString.lastIndexOf('|');
        let firstBarIndex = actionString.lastIndexOf('|',lastBarIndex-1);
        let time = actionString.substring(firstBarIndex + 2, lastBarIndex - 1).split(':');
        let seconds = (+time[0]) * 60 * 60 + (+time[1]) * 60 + (+time[2]);
        let actionInfo = document.querySelector('#nextActionContainer' + lastAction).children[0].children;
        let imageSrc = actionInfo[0].src;
        let actionName = actions.next[lastAction].name;
        let actionCount = 0;
        actions.next.forEach((listedAction,i) => {
            if (!listedAction.disabled && listedAction.name === actionName) actionCount += listedAction.loops;
        })
        if (Koviko.totalDisplay.parentNode.children.length == 4) {
            createEffText(actionCount, seconds, imageSrc);
        } else {
            updateEffText(actionCount, seconds, imageSrc);
        }
    } else {
        if (Koviko.totalDisplay.parentNode.children.length == 4) {
            let rateSpan = Koviko.totalDisplay.parentNode.children[3];
            rateSpan.children[0].innerHTML = '0.00';
        }
    }
}

function findAction() {
    //Finds the last action that is not disabled
    let lastAction = document.querySelector(`#nextActionsList`).children.length - 1;
    if (lastAction < 0) {
        return -1;
    }

    let nextAction = lastAction;
    while (nextAction >= 0) {
        // Grabs the first non-opaque action
        if (document.querySelector('#nextActionContainer' + nextAction).style.opacity !== '0.5') {
            return nextAction;
        }
        nextAction -= 1;
    }
    return -1;
}

function updateEffText(amount, seconds, imageSrc) {
    // Updates the efficiency text
    let rateSpan = Koviko.totalDisplay.parentNode.children[4];
    rateSpan.children[0].innerHTML = (" | " + ((amount / seconds)*60).toFixed(2));
    rateSpan.children[1].src = imageSrc;
}

function createEffText(amount, seconds, imageSrc) {
    // Creates the efficiency text
    let rateSpan = document.createElement("span");
    rateSpan.style = "color:#8293ff; font-weight: bold; padding-left: 0.5em";
    rateSpan.appendChild(createTextElement(" | " + ((amount / seconds)*60).toFixed(2) + " "));
    let image = document.createElement("img");
    image.src = imageSrc;
    image.className = "smallIcon";
    rateSpan.appendChild(image);
    rateSpan.appendChild(createTextElement("/min"));
    Koviko.totalDisplay.parentNode.appendChild(rateSpan);
}

function createTextElement(text) {
    // Creates the text for the efficiency (yes I know divs are probably wrong to use here)
    let textEl = document.createElement("div");
    textEl.innerHTML = text;
    return textEl;
}

function hideStatGains() {
	document.querySelector("#statContainer").childNodes.forEach(stat => {
		stat.children[1].style = "display: none";
	});
}

function showStatGains() {
	document.querySelector("#statContainer").childNodes.forEach(stat => {
		stat.children[1].style = "width: 90%";
	});
}



var statsAtStart;
setTimeout(() => {
    // Growth Tracking and Remaining Actions
    startTracking();
    addUIElements();

	document.querySelector("#radarStats").addEventListener("input", hideStatGains);
	document.querySelector("#regularStats").addEventListener("input", showStatGains);
    // Action Efficiency
	document.querySelector('#actionList').children[1].style += 'left:34px';
	let observer = new MutationObserver(calcEff);
	observer.observe(Koviko.totalDisplay.parentNode.childNodes[5], {attributes: true, childList: true, characterData: true});
	calcEff();
}, 5000)
