export class SpellboundKingdomsActor extends Actor {

    /** @inheritdoc */
    _onCreateEmbeddedDocuments(type, documents, result, options, userId) {
        super._onCreateEmbeddedDocuments(type, documents, result, options, userId);

        let slot;
        for (let [, item] of Object.entries(documents)) {
            if (!SpellboundKingdomsItem.purchasableItems.includes(item.type)) continue;

            if (item.data.data['wealth-level'].value <= this.data.data.wealth.level.value) {
                slot = item.data.data['wealth-level'].value;
            } else {
                slot = 0; // gold
            }

            if (slot !== item.data.data['wealth-level'].slot) {
                item.update({ 'data.wealth-level.slot': slot });
            }
        }
    }
}
  
export class SpellboundKingdomsItem extends Item {

    static get purchasableItems() {
        return [
            'gear',
            'vehicle',
            'building',
        ];
    }

    async sendToChat() {
      // let templateMap = {
      //   gear: 'systems/spellbound-kingdoms/templates/chat/item.hbs',
      //   weapon: 'systems/spellbound-kingdoms/templates/chat/weapon.hbs',
      //   skill: 'systems/spellbound-kingdoms/templates/chat/skill.hbs',
      //   ability: 'systems/spellbound-kingdoms/templates/chat/ability.hbs',
      //   cargo: 'systems/spellbound-kingdoms/templates/chat/cargo.hbs',
      // };
      // if (templateMap[this.type] === undefined) return;

      // let chatCard = await renderTemplate(
      //   templateMap[this.type], 
      //   {item: this.data}
      // );
      // let chatData = {
      //   speaker:  this.actor 
      //     ? {actor: this.actor.id} 
      //     : {actor: game.user._id, alias: game.user.name},
      //   content: chatCard,
      // };
      // ChatMessage.create(chatData, {});
    }
}
  