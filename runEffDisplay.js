window.displayManaEff = (sortBy="order") => {
	// Console display of the mana/time efficiencies of all used mana/gold gain actions.
	// Sort by options: "order" "mana" "eff" "time"
	let manaPerGold = Math.floor(50 * getSkillBonus("Mercantilism"));
	let previous = Koviko.cache.cache[0].data[0].resources;
	let totals = {"Total Gold": 0, "Gold to Mana": 0, "Raw Mana": 0, "Bought Mana": 0};
	let actions = {
		"Sell Potions": {time: 0, mana: 0, gold: 0, order: 0, eff: 0}, 
		"Sell Artifact": {time: 0, mana: 0, gold: 0, order: 0, eff: 0},
		"Adventure Guild": {time: 0, mana: 0, gold: 0, order: 0, eff: 0},
		"Mana Geyser": {time: 0, mana: 0, gold: 0, order: 0, eff: 0},
		"Collect Taxes": {time: 0, mana: 0, gold: 0, order: 0, eff: 0},
	};	
	for (pred of Koviko.cache.cache) {
		if (pred.key[2]) continue; // disabled actions
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
			case "Build Housing":
				actions["Collect Taxes"].time += current.actionTicks;
		}
		
		for (resource of ["mana", "gold"]) {
			delta = current[resource] - previous[resource];
			if (resource === "gold") { 
				if (delta > 0) {
					totals["Total Gold"] += delta;
				}
				delta *= manaPerGold; 
			} 
			else if (delta > 0) { 
				// adjust for the mana cost of the action itself
				delta += current.actionTicks/100 * getSpeedMult(current.town) * 50; 
				if (name?.includes("Buy Mana")) {
					totals["Bought Mana"] += delta;
					totals["Gold to Mana"] += previous.gold;
					break; // ignore buy mana actions in summary
				}
				else {
					totals["Raw Mana"] += delta;
				}
			}
			if (actions[name]?.gold > 0) { 
				// adjust for prior gold cost of action (aka pickaxe)
				delta += actions[name].gold * manaPerGold; 
			}

			
			if (delta > 0) {
				if (!(name in actions)) { actions[name] = {time: 0, mana: 0, gold: 0, order: 0, eff: 0}; }
				actions[name].time += current.actionTicks;
				actions[name].mana += delta;
				actions[name].order = current.totalTicks;
				actions[name].eff   = actions[name].mana / (actions[name].time/50)
			}
		}
		previous = current;
	}
	
	// Sort and display in console
	let outStr = "Mana\tSec \tMana/s\tAction\n"
	let sorted = Object.entries(actions).sort((a, b) => a[1][sortBy] - b[1][sortBy]);
	for (const [name, data] of sorted) {
		if (data.time <= 0 || data.mana <= 0) continue;
		let seconds = data.time/50
		outStr += `${intToString(data.mana,1)} \t${intToString(seconds,2)} \t${intToString(data.eff,1)}\t${name}\n`
	}
	outStr += "\n" + Object.entries(totals).map((total) => total[0] + "\t" + intToString(total[1],1)).join("\n");
	console.log(outStr)
}

displayManaEff() 