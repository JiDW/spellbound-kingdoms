import { SpellboundKingdomsItemSheet } from "./item-sheet.js";

export class SpellboundKingdomsHistorySheet extends SpellboundKingdomsItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["spellbound-kingdoms", "sheet", "item", "history"],
      tabs: [],
    });
  }

	get template() {
		return "systems/spellbound-kingdoms/templates/items/history.hbs";
	}
}
