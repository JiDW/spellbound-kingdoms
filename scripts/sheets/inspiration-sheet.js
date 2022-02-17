import { SpellboundKingdomsItemSheet } from "./item-sheet.js";

export class SpellboundKingdomsInspirationSheet extends SpellboundKingdomsItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["spellbound-kingdoms", "sheet", "item", "inspiration"],
      tabs: [],
    });
  }

	get template() {
		return "systems/spellbound-kingdoms/templates/items/inspiration.hbs";
	}
}
