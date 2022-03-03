import { SpellboundKingdomsItemSheet } from "./item-sheet.js";

export class SpellboundKingdomsSpellSheet extends SpellboundKingdomsItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["spellbound-kingdoms", "sheet", "item", "spell"],
      tabs: [],
    });
  }

	get template() {
		return "systems/spellbound-kingdoms/templates/items/spell.hbs";
	}
}
