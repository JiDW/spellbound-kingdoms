
// import { CharacterPickerDialog } from "../dialog/character-picker-dialog.js";
import { SKRollHandler } from "../components/roll-engine/engine.js";

export class SpellboundKingdomsActorSheet extends ActorSheet {

  static setupSocketListeners() {
    game.socket.on("system.spellbound-kingdoms", SpellboundKingdomsActorSheet.doItemTransfer);
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Rolls
		html.find(".roll-stat").click((ev) => {
			const statName = $(ev.currentTarget).data("stat");
			return this.rollStat(statName);
		});

    // Items
    html.find(".item-edit").click((ev) => {
      const div = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(div.data("entity-id"));
      item.sheet.render(true);
    });
    html.find(".item-delete").click(this.handleItemDelete.bind(this));
    html.find(".item-post").click((ev) => {
      const div = $(ev.currentTarget).parents(".item");
      const item = this.actor.items.get(div.data("entity-id"));
      item.sendToChat();
    });
    html.find(".item-create").click(this.handleItemCreate.bind(this));
    html.find(".item-transfer").click(this.handleItemTransfer.bind(this));

    html.find(".embedded-update").blur(this.handleEmbeddedUpdate.bind(this));
  }

  getData() {
    const data = super.getData();
    data.data.itemsByType = this.categorizeItems();
    return data;
  }
  
  // ********** PREPARE DATA *************

  categorizeItems() {
    let itemsByType = {
      weapons: {}, 
      armors: {}, 
      fashion: {}, 
      vehicles: {},
      'fighting-styles': {},
      maneuvers: {},
      talents: {},
      scars: {},
      spells: {},
      inspirations: {},
      histories: {},
      reputations: {},
      abilities: {},
    };
    let type, subtype;

    this.actor.items.forEach((item) => {
      type = item.data.type;
      subtype = item.data.data.type;
      if (itemsByType[type] !== undefined) {
        itemsByType[type][item.id] = item;
      } else if (itemsByType[subtype] !== undefined) {
        itemsByType[subtype][item.id] = item;
      }
    });

    itemsByType.weapons = this._sortItems(
      itemsByType.weapons, 
      (itemId1, itemId2) => itemsByType.weapons[itemId1].name.localeCompare(itemsByType.weapons[itemId2].name)
    );
    itemsByType.armors = this._sortItems(
      itemsByType.armors, 
      (itemId1, itemId2) => itemsByType.armors[itemId1].name.localeCompare(itemsByType.armors[itemId2].name)
    );
    itemsByType.fashion = this._sortItems(
      itemsByType.fashion, 
      (itemId1, itemId2) => itemsByType.fashion[itemId1].name.localeCompare(itemsByType.fashion[itemId2].name)
    );
    itemsByType.talents = this._sortItems(
      itemsByType.talents,
      (itemId1, itemId2) => itemsByType.talents[itemId1].name.localeCompare(itemsByType.talents[itemId2].name)
    );
    itemsByType.spells = this._sortItems(
      itemsByType.spells,
      (itemId1, itemId2) => itemsByType.spells[itemId1].name.localeCompare(itemsByType.spells[itemId2].name)
    );
    itemsByType.abilities = this._sortItems(
      itemsByType.abilities,
      (itemId1, itemId2) => itemsByType.abilities[itemId1].name.localeCompare(itemsByType.abilities[itemId2].name)
    );

    return itemsByType;
  }
  
  // ********** HANDLERS *************

  rollStat(statIdentifier) {
		const data = {
			title: this.actor.data.data.stats[statIdentifier].label,
			stat: this.getStat(statIdentifier),
		};
		// const options = {
		// 	...this.getRollOptions(statIdentifier),
		// };
		return SKRollHandler.createRoll(data, {}/*options*/);
	}

  handleItemDelete(event) {
    const div = $(event.currentTarget).parents(".item");
    this.actor.deleteEmbeddedDocuments("Item", [div.data("entity-id")]);
    div.slideUp(200, () => this.render(false));
  }

  handleItemCreate(event) {
    event.preventDefault();
    let header = event.currentTarget;
    let data = duplicate(header.dataset);
    data["name"] = `New ${data.type.capitalize()}`;
    this.actor.createEmbeddedDocuments("Item", [data], { renderSheet: true });
  }

  handleItemTransfer(event) {
    event.preventDefault();
    const div = $(event.currentTarget).parents(".item");
    const item = this.actor.items.get(div.data("entity-id"));
    const that = this;

    if (item === null) return;
    
    CharacterPickerDialog.show(
      game.i18n.format('SK.TRANSFER_DIALOG', {item: item.name}), 
      this._getPlayerActors(item), 
      function (containerId) {
        let data = { 
          operation: 'transferItem', 
          sourceId: that.actor.id, 
          destinationId: containerId, 
          item: item
        };
        if (game.user.isGM) {
          SpellboundKingdomsActorSheet.doItemTransfer(data);
        } else {
          game.socket.emit('system.spellbound-kingdoms', data);
        }
      }
    );
  }

  handleEmbeddedUpdate(event) {
    event.preventDefault();
    const el = event.currentTarget;
    const data = duplicate(el.dataset);

    const item = this.actor.items.get(data.entityId);
    const updateKey = data.name;
    item.update({[updateKey]: el.value});
  }
  
  // ********** HELPERS *************

  getStat(identifier) {
		const statName = identifier;
		const stat = this.actor.data.data.stats[statName];
		if (!stat) return {};
		return {
			name: statName,
			...stat,
		};
	}

  _getPlayerActors(item) {
    return game.actors.filter(a => a.hasPlayerOwner && a.id !== this.actor.id);
  }

  _sortItems(items, comparator) {
    return Object.keys(items).sort(comparator).reduce(
      (obj, key) => { 
        obj[key] = items[key]; 
        return obj;
      }, 
      {}
    );
  }

  static doItemTransfer(data) {
    if (!game.user.isGM || data.operation !== 'transferItem') return;
    
    let {sourceId, destinationId, item} = data;
    const source = game.actors.get(sourceId);
    const destination = game.actors.get(destinationId);

    console.log(`Transfering ${item.name} from ${source.name} to ${destination.name}`);
    destination.createEmbeddedDocuments("Item", [item.data]);
    source.deleteEmbeddedDocuments("Item", [item.id]);
  };
}
