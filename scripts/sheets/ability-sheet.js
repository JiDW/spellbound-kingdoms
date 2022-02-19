import { SpellboundKingdomsItemSheet } from "./item-sheet.js";

export class SpellboundKingdomsAbilitySheet extends SpellboundKingdomsItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["spellbound-kingdoms", "sheet", "item", "ability"],
      tabs: [],
    });
  }

	get template() {
		return "systems/spellbound-kingdoms/templates/items/ability.hbs";
	}
}
