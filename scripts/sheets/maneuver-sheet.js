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

    activateListeners(html) {
        super.activateListeners(html);

        let me = this;

        html.find(".add-attack").click((ev) => {
            const field = $(ev.currentTarget).data("field");
            const newKey = (+new Date).toString(36);
            const name = `data.${field}.${newKey}`;

            me.object.update({[name]: {die: 4, vs: 'defense', damage: {body: 1}}});
        });
        html.find(".add-defense").click((ev) => {
            const field = $(ev.currentTarget).data("field");
            const newKey = (+new Date).toString(36);
            const name = `data.${field}.${newKey}`;

            me.object.update({[name]: 4});
        });
        html.find(".remove-attack, .remove-defense").click((ev) => {
            const field = $(ev.currentTarget).data("field");
            const key = $(ev.currentTarget).data("key");
            const name = `data.${field}.-=${key}`;

            me.object.update({[name]: null});
        });
    }
}
