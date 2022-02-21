import { SpellboundKingdomsItemSheet } from "./item-sheet.js";

export class SpellboundKingdomsGearSheet extends SpellboundKingdomsItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["spellbound-kingdoms", "sheet", "item", "gear"],
      width: 490,
      tabs: [],
    });
  }

	get template() {
		return "systems/spellbound-kingdoms/templates/items/gear.hbs";
	}
}
