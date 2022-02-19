import { SpellboundKingdomsItemSheet } from "./item-sheet.js";

export class SpellboundKingdomsTalentSheet extends SpellboundKingdomsItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["spellbound-kingdoms", "sheet", "item", "talent"],
      tabs: [],
    });
  }

	get template() {
		return "systems/spellbound-kingdoms/templates/items/talent.hbs";
	}
}
