# IdleLoops-UITweaks

The IdleLoops UITweaks is a userscript addon to modify the UI of [IdleLoops](http://stopsign.github.io/idleLoops/) and the [Idle Loops Predictor](https://github.com/MakroCZ/IdleLoops-Predictor). The tweaks to the UI includes an addition to track the gains/losses of soulstones and talents since the tracker is started, an addition to the predictor to state the amount of actions per minute you get for the last active action in the list, and a way to track the amount of actions needed to reach a target point in explorations.

## Installation

You will need a userscript manager like [Tampermonkey for Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) or [Greasemonkey for Firefox](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/) installed on your browser before using this script. The script is installed via one of these tools.

To install the script, click the `idleloops-predictor.user.js` in GitHub and then click the **`Raw`** button. Your userscript manager should automatically give you the option to install the script. Alternatively, you can just follow the link below:

**[»» Install IdleLoops UI Tweaks ««](https://raw.githubusercontent.com/Quiaaaa/IdleLoops-UITweaks/main/IdleLoopsUITweaks.js)**

## UI changes


![Talent and Soulstone tracking](https://i.imgur.com/lMeiql7.png)

The first change to the UI is the addition of tracking the stats. When talents or soulstones are gained or lost, the corresponding stat will be updated to show how the amount has changed since tracking has been started. To fit these additions, the design of the stats section has been changed to include the stat level, talent and soulstones on a separate row as shown.

![Action per minute](https://i.imgur.com/OaXhWAE.png)

The next change to the UI is an addition to the predictor for the game. It adds an extra statistic showing the number of actions per minute you get for the last active action in your action list. This can be used to tell which setup for your actions gives the highest action per minute.

![Progress to exploration](https://i.imgur.com/OfYGS2S.png)

The third UI addition is a way to track the amount of actions needed to reach the target set in the input box for the given exploration, updating as actions for it are completed.

## Limitations

### Predictor Requirement

For the Actions per minute to work, it requires the predictor for Lloyd's version of the game to be installed and up to date, as it uses its time prediction to calculate the actions completed per minute for the loop.

### Exploration Target

For actions such as hermit or apprenticeship, which use a different base rate for completing the exploration, the tweaks still assume the base rate of exploration so the numbers given will not be equivalent to the actual number required but still show the relative amount.

## License

IdleLoops UITweaks is licensed under the MIT License. Refer to the [LICENSE](https://github.com/Quiaaaa/IdleLoops-UITweaks/blob/master/LICENSE) file.
