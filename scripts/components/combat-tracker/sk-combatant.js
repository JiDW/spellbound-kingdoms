export class SkCombatant extends Combatant {

    /** @override */
    prepareDerivedData() {
        super.prepareDerivedData();

        if (!this.parent.data) return;

        this.updateLockedInStatus();
    }

    updateLockedInStatus() {
        this.data.isLockedIn = !!this.actor.data.data['locked-in-maneuver'].id;
        this.data.lockedInManeuver = this.getManeuver(this.actor.data.data['locked-in-maneuver'].id);
    }

    getManeuver(id) {
        if (id.includes('|||')) {
            let parts = id.split('|||');
            let style = this.actor.data.items.get(parts[0]);
            if (!style.data.data.maneuvers) {
                return {name: parts[1]};
            }
            return style.data.data.maneuvers.basic.find(m => m.name === parts[1]);
        }

        return this.actor.data.items.get(id);
    }
}