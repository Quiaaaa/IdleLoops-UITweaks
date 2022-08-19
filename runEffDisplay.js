window.displayManaEff = () => {
	// Console display of the mana/time efficiencies of all used mana/gold gain actions.
	let manaPerGold = Math.floor(50 * getSkillBonus("Mercantilism"));
	let previous = Koviko.cache.cache[0].data[0].resources;
	let actions = {
		"Sell Potions": {time: 0, mana: 0, gold: 0, order: 0}, 
		"Sell Artifact": {time: 0, mana: 0, gold: 0, order: 0},
		"Adventure Guild": {time: 0, mana: 0, gold: 0, order: 0},
		"Mana Geyser": {time: 0, mana: 0, gold: 0, order: 0},
	};	
	for (pred of Koviko.cache.cache) {
		let name = pred.key[0];
		let current = pred.data[0].resources;
		
		//Include related actions into time cost
		switch (name) {
			case "Gather Herbs": // Alch Actions
			case "Brew Potions":
				actions["Sell Potions"].time += current.actionTicks;
				break;
			case "Take Artifacts":
				// TODO This is wrong if we donate any artifacts, good luck figuring that out.
				actions["Sell Artifact"].time += current.actionTicks; 
				break;
			case "Hunt": // Adventure Guild Actions
			case "Craft Armor":
				actions["Adventure Guild"].time += current.actionTicks;
				break;
			case "Buy Pickaxe":
				actions["Mana Geyser"].time += current.actionTicks;
				actions["Mana Geyser"].gold -= 200;
				break;
		}
		
		for (resource of ["mana", "gold"]) {
			delta = current[resource] - previous[resource];
			if (resource === "gold") { delta *= manaPerGold; } 
			if (actions[name]?.gold > 0) { delta += actions[name].gold * manaPerGold; }
			if (name?.includes("Buy Mana")) break;
			
			if (delta > 0) {
				if (!(name in actions)) { actions[name] = {time: 0, mana: 0}; }
				actions[name].time += current.actionTicks;
				actions[name].mana += delta;
				actions[name].order = current.totalTicks;
			}
		}
		previous = current;
	}
	
	// Sort and display in console
	let outStr = "Mana\tSec\tMana/s\tAction\n"
	let sorted = Object.entries(actions).sort((a, b) => a[1].order - b[1].order);
	for (const [name, data] of sorted) {
		if (data.time <= 0 || data.mana <= 0) continue;
		let seconds = data.time/50
		outStr += `${intToString(data.mana,1)} \t${intToString(seconds,2)} \t${intToString(data.mana/seconds,1)}\t${name}\n`
	}
	console.log(outStr)
}

displayManaEff()