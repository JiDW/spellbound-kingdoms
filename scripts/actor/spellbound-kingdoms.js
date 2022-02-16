export class SpellboundKingdomsActor extends Actor {
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
  