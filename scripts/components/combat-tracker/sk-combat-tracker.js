export class SkCombatTracker extends CombatTracker {
    get template() {
        return "systems/spellbound-kingdoms/templates/components/combat-tracker/combat-tracker.hbs";
    }

    async getData(options) {
        let data = await super.getData(options);

        const combat = this.viewed;
        const hasCombat = combat !== null;
        if (!hasCombat) return data;

        let combatant;
        for (let [i, combatantData] of data.turns.entries()) {
            combatant = combat.combatants.get(combatantData.id);
            combatantData.isLockedIn = combatant.data.isLockedIn;
            combatantData.lockedInManeuver = combatant.data.lockedInManeuver;
        }

        return data;
    }

    async postManeuvers() {
        const combat = this.viewed;
        const hasCombat = combat !== null;
        if (!hasCombat) return;

        let templateData = {maneuvers: {}};
        for ( let [i, combatant] of combat.turns.entries() ) {
            if ( !combatant.visible ) continue;

            templateData.maneuvers[combatant.id] = combatant.data.lockedInManeuver;
        }
        console.log(templateData.maneuvers);
    }
}