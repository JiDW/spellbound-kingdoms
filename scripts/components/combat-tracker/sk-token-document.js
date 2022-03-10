export class SkTokenDocument extends TokenDocument {

    /** @override */
    _onUpdateBaseActor(update = {}, options) {
        super._onUpdateBaseActor(update, options);

        // Update combat locked in status
        const c = this.combatant;
        if (c && foundry.utils.hasProperty(update.data || {}, 'locked-in-maneuver')) {
            c.updateLockedInStatus();
            ui.combat.render();
        }
    }
}