import { SpellboundKingdomsItemSheet } from "./item-sheet.js";

export class SpellboundKingdomsScarSheet extends SpellboundKingdomsItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["spellbound-kingdoms", "sheet", "item", "scar"],
      tabs: [],
    });
  }

	get template() {
		return "systems/spellbound-kingdoms/templates/items/scar.hbs";
	}
}
