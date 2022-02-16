import { SpellboundKingdomsActorSheet } from "./actor.js";
// import { AddItemDialog } from "../dialog/add-item-dialog.js";
// import { ReputationStats } from '../component/reputation-stats.js';
// import { ApPerSkillDialog } from "../dialog/ap-per-skill-dialog.js";
import { SpellboundKingdomsActor } from "../actor/spellbound-kingdoms.js";
// import { CharacterCreation } from "../component/character-creation.js";

export class SpellboundKingdomsCharacterSheet extends SpellboundKingdomsActorSheet {

  static get defaultOptions() {
    return mergeObject(super.defaultOptions, {
      classes: ["spellbound-kingdoms", "sheet", "actor"],
      width: 700,
      height: 780,
      resizable: false,
      scrollY: [
        ".armors .item-list .items",
        ".gears.item-list .items",
        ".skills .item-list .items",
        ".abilities .item-list .items",
        ".weapons .item-list .items",
      ],
      tabs: [
        {
          navSelector: ".sheet-tabs",
          contentSelector: ".sheet-body",
          initial: "main",
        },
      ],
    });
  }

	get template() {
		return "systems/spellbound-kingdoms/templates/character/character.hbs";
	}
  
  // ********** OVERRIDES *************

  getData() {
    const data = super.getData();
    data.data.user = game.user;
    data.data.races = CONFIG.SpellboundKingdoms.races;
    data.data.classes = CONFIG.SpellboundKingdoms.classes;
    data.data['fighting-styles'] = CONFIG.SpellboundKingdoms['fighting-styles'];
    data.data.stats = this.getStatsForCharateristicsBlock(data.data.data.stats);
    data.data.data.itemsByType = this.categorizeItems();
    this.computeTalentData(data.data);
    return data;
  }

  activateListeners(html) {
    super.activateListeners(html);

    html.find('.ability-delete').click(this.handleRemoveItem.bind(this));
    html.find('.add-ability').click(this.handleAddAbility.bind(this));
    html.find('.use-item').click(this.handleUseItem.bind(this));
    html.find('.use-weapon').click(this.handleUseWeapon.bind(this));

    html.find('.skill-delete').click(this.handleRemoveItem.bind(this));
    html.find('.add-skill').click(this.handleAddSkill.bind(this));
    html.find('.use-skill').click(this.handleUseSkill.bind(this));
    html.find('.use-skill-hard').click(this.handleUseSkillHard.bind(this));

    html.find('.recover-ap-half').click(this.handleRecoverApHalf.bind(this));
    html.find('.recover-ap-all').click(this.handleRecoverApAll.bind(this));

    html.find('.recover-uses-scene').click(this.handleRecoverUsesScene.bind(this));
    html.find('.recover-uses-day').click(this.handleRecoverUsesDay.bind(this));

    html.find('.character-creation-wizard').click(this.handleCharacterCreation.bind(this));
  }

  /**
   * Handle the final creation of dropped Item data on the Actor.
   * This method is factored out to allow downstream classes the opportunity to override item creation behavior.
   * @param {object} itemData     The item data requested for creation
   * @return {Promise<Actor>}
   * @private
   */
  async _onDropItemCreate(itemData) {
    if (itemData.type === 'skill') {
      let item;
      for (let id in this.actor.data.items) {
        item = this.actor.data.items[id];
        if (item.name === itemData.name && item.type === 'skill') {
          console.log("Actor already has skill " + item.name);
          return null;
        }
      }
    }
    return this.actor.createEmbeddedDocuments("Item", [itemData]);
  }
  
  // ********** HANDLERS *************

  handleCharacterCreation() {
    const app = new (CONFIG.SpellboundKingdoms.characterCreationClass)(this.actor);
    app.render(true);
  }

  handleRecoverApHalf(e) {
    const half = Math.ceil(this.actor.data.data.bio.ap.max / 2);
    this.actor.restoreAP(half);
  }

  handleRecoverApAll(e) {
    const max = this.actor.data.data.bio.ap.max;
    this.actor.restoreAP(max);
  }

  handleRecoverUsesScene(e) {
    this.handleRecoverUses('scene');
  }

  handleRecoverUsesDay(e) {
    this.handleRecoverUses('day');
  }

  handleRecoverUses(refresh) {
    let updateData;
    this.actor.items.forEach(function(item) {
      if (item.data.data.refresh === refresh && item.data.data.uses !== undefined) {
        updateData = {
          'data.uses.value': item.data.data.uses.max,
        };
        item.update(updateData);
      }
    });
  }

  handleUseSkillHard(e) {
    const div = $(e.currentTarget).parents(".skill");
    const entityId = div.data("entity-id");
    let skill = this.actor.items.get(entityId);
    let that = this;

    ApPerSkillDialog.show(
      game.i18n.localize('BH.HOW_MANY'),
      Math.min(game.settings.get("spellbound-kingdoms", "maxApPerSkill"), this.actor.data.data.bio.ap.value),
      function (ap) {
        that.actor.reduceAP(ap);
        that._postSkillUse(skill.name, ap);
      }
    );
  }

  handleUseSkill(e) {
    const div = $(e.currentTarget).parents(".skill");
    const entityId = div.data("entity-id");
    let skill = this.actor.items.get(entityId);
    let that = this;

    const defaultBehaviour = game.settings.get("spellbound-kingdoms", "shiftClickMoreAp");
    const doUseSkill = function (ap) {
      that.actor.reduceAP(ap);
      that._postSkillUse(skill.name, ap);
    }

    if (e.shiftKey && defaultBehaviour || !e.shiftKey && !defaultBehaviour) {
      ApPerSkillDialog.show(
        game.i18n.localize('BH.HOW_MANY'),
        Math.min(game.settings.get("spellbound-kingdoms", "maxApPerSkill"), this.actor.data.data.bio.ap.value),
        doUseSkill
      );
    } else {
      doUseSkill(1);
    }
  }

  async handleUseItem(e) {
    const div = $(e.currentTarget).parents(".item");
    const entityId = div.data("entity-id");
    let item = this.actor.items.get(entityId);
    if (parseInt(item.data.data.uses.value) === 0) return;
    
    this._reduceItemUses(item);
    this._postItemUse(item);
  }

  async handleUseWeapon(e) {
    const div = $(e.currentTarget).parents(".item");
    const entityId = div.data("entity-id");
    let item = this.actor.items.get(entityId);
    let that = this;

    const defaultBehaviour = game.settings.get("spellbound-kingdoms", "shiftClickMoreAp");
    const doUseWeapon = async function (ap) {
      const ammoHasBeenSpent = await that._spendAmmo(item);
      if (ammoHasBeenSpent) {
        that.actor.reduceAP(ap);
      }
      that._postWeaponUse(item, ammoHasBeenSpent, ap);
    }
    
    if (e.shiftKey && defaultBehaviour || !e.shiftKey && !defaultBehaviour) {
      ApPerSkillDialog.show(
        game.i18n.localize('BH.HOW_MANY'),
        Math.min(game.settings.get("spellbound-kingdoms", "maxApPerSkill"), this.actor.data.data.bio.ap.value),
        doUseWeapon
      );
      return;
    }

    await doUseWeapon(1);
  }

  handleAddSkill() {
    let that = this;
    let d = AddItemDialog.show(
      "Skill Picker",
      this.categorizeItems().skill,
      'skill',
      function (skills) {
        that.actor.createEmbeddedDocuments("Item", skills);
      }
    );
  }

  handleRemoveItem(e) {
    const div = $(e.currentTarget).parents(".item");
    const entityId = div.data("entity-id");

    this.actor.deleteEmbeddedDocuments("Item", [entityId]);
  }

  handleAddAbility() {
    let that = this;
    let d = AddItemDialog.show(
      "Ability Picker",
      this.categorizeItems().ability,
      'ability',
      function (abilities) {
        that.actor.createEmbeddedDocuments("Item", abilities);
      }
    );
  }
  
  // ********** PREPARE DATA *************

  getStatsForCharateristicsBlock(stats) {
    let filteredStats = JSON.parse(JSON.stringify(stats));
    delete filteredStats.body;
    delete filteredStats.mood;

    return filteredStats;
  }

  computeEncumbrance(data) {
    let itemsCarried = 0;
    for (let item of Object.values(data.items)) {
      itemsCarried += this._computerItemEncumbrance(item);
    }
    data.data.encumbrance = {
      value: itemsCarried,
      max: this.actor.data.carryingCapacity,
      over: itemsCarried > this.actor.data.carryingCapacity,
    };
  }

  computeTalentData(data) {
    data.data.talentCount = Object.keys(data.data.itemsByType.talents).length;
    // data.data.allowedTalentCount = CONFIG.SpellboundKingdoms;
  }

  computeAbilityData(data) {
    data.data.abilityCount = Object.keys(data.data.itemsByType.ability).length;
    data.data.allowedAbilityCount = ReputationStats.getForReputation(data.data.bio.reputation.value ?? 1).ability;
  }
  
  // ********** HELPERS *************

  _getWeaponBonusDamage(skillName) {
    let skillCode = skillName.replace(/[\W_]+/g, "");
    if (skillCode === '') skillCode = 'noSkill';

    return this.actor.data.bonusDamage[skillCode] ?? 0;
  }

  _computerItemEncumbrance(data) {
    switch (data.type) {
      case "armor":
      case "gear":
      case "weapon":
        return parseInt(data.data.encumbrance);
      default:
        return 0;
    }
  }

  async _postSkillUse(skillName, apSpent) {
    let chatCard = await renderTemplate(
      'systems/spellbound-kingdoms/templates/chat/skill-use.hbs', 
      {skillName: skillName, apSpent: apSpent}
    );
    let chatData = {
      speaker: {actor: this.actor.id},
      // @todo localize
      content: chatCard
    };
    ChatMessage.create(chatData, {});
  }

  async _postItemUse(item) {
    let titleMap = {
      ability: 'BH.CHAT.ABILITY_USE',
      gear: 'BH.CHAT.GEAR_USE',
    }
    let chatCard = await renderTemplate(
      'systems/spellbound-kingdoms/templates/chat/item-use.hbs', 
      {title: game.i18n.localize(titleMap[item.type]), itemName: item.name, description: item.data.data['use-description']}
    );
    let chatData = {
      speaker: {actor: this.actor.id},
      // @todo localize
      content: chatCard
    };
    ChatMessage.create(chatData, {});
  }

  async _postWeaponUse(weapon, success, apSpent) {
    let chatCard = await renderTemplate(
      'systems/spellbound-kingdoms/templates/chat/weapon-use.hbs', 
      {
        itemName: weapon.name, 
        description: weapon.data.data['use-description'], 
        skillName: weapon.data.data.skill || false,
        apSpent: success ? apSpent : 0,
        ammoName: weapon.data.data.ammo,
        success: success,
        damage: weapon.data.data.damage + this._getWeaponBonusDamage(weapon.data.data.skill),
        range: weapon.data.data.range,
      }
    );
    let chatData = {
      speaker: {actor: this.actor.id},
      content: chatCard,
    };
    ChatMessage.create(chatData, {});
  }

  async _reduceItemUses(item) {
    let success = true;
    const current = item.data.data.uses.value;
    if (current === 0) success = false;
    else {
      let updateData = {
        'data.uses.value': Math.max(0, current - 1),
      };
      await item.update(updateData);
    } 

    item = this.actor.items.get(item.id);
    if (parseInt(item.data.data.uses.value) === 0 && item.data.data.refresh === 'never') {
      this.actor.deleteEmbeddedDocuments("Item", [item.id]);
    }

    return success;
  }

  async _spendAmmo(weapon) {
    if (weapon.data.data.ammo === '') return true;

    let ammo = this.actor.items.getName(weapon.data.data.ammo);
    if (!ammo) return false;

    return this._reduceItemUses(ammo);
  }
}

Hooks.on('preUpdateActor', async (entity, updateData, options, userId) => {
  if (!(entity instanceof SpellboundKingdomsActor)) return true;
  
  if ( updateData.data?.bio?.reputation?.value ) {
    let stats = ReputationStats.getForReputation(updateData.data.bio.reputation.value);
    if (stats !== false && entity.data.data.bio.ap.max !== stats.ap) {
      if (updateData.data.bio.ap === undefined) updateData.data.bio.ap = {max: stats.ap};
      else updateData.data.bio.ap.max = stats.ap;
    }
  }

  return true;
});

Hooks.on('createActor', async (entity, options, userId) => {
  if (!(entity instanceof SpellboundKingdomsActor) || entity.data.type !== 'character') return true;
  
  const punchingAttack = game.items.getName("Punching Attack");
  if (!punchingAttack) return true;

  entity.createEmbeddedDocuments("Item", [punchingAttack.data]);

  return true;
});

