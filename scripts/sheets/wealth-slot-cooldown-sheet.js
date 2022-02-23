import { SpellboundKingdomsItemSheet } from "./item-sheet.js";

export class SpellboundKingdomsWealthSlotCooldownSheet extends SpellboundKingdomsItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["spellbound-kingdoms", "sheet", "item", "wealth-slot-cooldown"],
      tabs: [],
    });
  }

	get template() {
		return "systems/spellbound-kingdoms/templates/items/wealth-slot-cooldown.hbs";
	}
}
