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

    /** @override */
    _onUpdateTokenActor(data, options, userId) {
        super._onUpdateTokenActor(data, options, userId);

        // Update combat locked in status
        const c = this.combatant;
        if (c && foundry.utils.hasProperty(data.data || {}, 'locked-in-maneuver')) {
            c.updateLockedInStatus();
            ui.combat.render();
        }
    }
}