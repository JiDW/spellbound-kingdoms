export class SkCombat extends Combat {

    async postManeuvers() {
        let templateData = {maneuvers: {}};
        for ( let [i, combatant] of this.turns.entries() ) {
            if ( !combatant.visible ) continue;

            templateData.maneuvers[combatant.data.tokenId] = {
                combatant: combatant,
                maneuver: combatant.data.lockedInManeuver || null,
            };
        }
        console.log(templateData.maneuvers);

        let template = 'systems/spellbound-kingdoms/templates/chat/locked-in-maneuvers.hbs';
        let chatCard = await renderTemplate(
            template,
            templateData
        );
        let chatData = {
            speaker: { actor: game.user._id, alias: game.user.name },
            content: chatCard,
        };
        ChatMessage.create(chatData, {});
    }
}