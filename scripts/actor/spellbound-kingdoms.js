export class SpellboundKingdomsActor extends Actor {
    _preCreateEmbeddedDocuments(embeddedName, result, options, userId) {
        const purchasableItems = [
            'gear',
            'vehicle',
            'building',
        ];

        for (let [,item] of Object.entries(result)) {
            if (!purchasableItems.includes(item.type)) continue;

            if (item.data['wealth-level'].value <= this.data.data.wealth.level.value) {
                item.data['wealth-level'].slot = item.data['wealth-level'].value;
            } else {
                item.data['wealth-level'].slot = 0; // gold
            }
        }
    }
}
  
export class SpellboundKingdomsItem extends Item {
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
  