import { SpellboundKingdomsItemSheet } from "./item-sheet.js";

export class SpellboundKingdomsObjectSheet extends SpellboundKingdomsItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["spellbound-kingdoms", "sheet", "item", "object"],
      width: 500,
      tabs: [],
    });
  }

	get template() {
		return "systems/spellbound-kingdoms/templates/items/object.hbs";
	}
}
