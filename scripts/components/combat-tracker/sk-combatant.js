export class SkCombatant extends Combatant {

    /** @override */
    prepareDerivedData() {
        super.prepareDerivedData();

        if (!this.parent.data) return;

        this.updateLockedInStatus();
    }

    updateLockedInStatus() {
        this.data.isLockedIn = !!this.actor.data.data['locked-in-maneuver'].id;
        this.data.lockedInManeuver =  this.actor.data.items.get(this.actor.data.data['locked-in-maneuver'].id);
    }
}