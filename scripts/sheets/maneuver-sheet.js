import { SpellboundKingdomsItemSheet } from "./item-sheet.js";

export class SpellboundKingdomsManeuverSheet extends SpellboundKingdomsItemSheet {
  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["spellbound-kingdoms", "sheet", "item", "maneuver"],
      tabs: [],
    });
  }

	get template() {
		return "systems/spellbound-kingdoms/templates/items/maneuver.hbs";
	}
}
