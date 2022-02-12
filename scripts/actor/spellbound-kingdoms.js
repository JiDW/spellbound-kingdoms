export class SpellboundKingdomsActor extends Actor {
}
  
export class SpellboundKingdomsItem extends Item {
    async sendToChat() {
      // let templateMap = {
      //   gear: 'systems/spellbound-kingdoms/templates/chat/item.html',
      //   weapon: 'systems/spellbound-kingdoms/templates/chat/weapon.html',
      //   skill: 'systems/spellbound-kingdoms/templates/chat/skill.html',
      //   ability: 'systems/spellbound-kingdoms/templates/chat/ability.html',
      //   cargo: 'systems/spellbound-kingdoms/templates/chat/cargo.html',
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
  