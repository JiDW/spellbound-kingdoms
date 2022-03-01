import { SpellboundKingdomsActorSheet } from "./actor-sheet.js";
import { SpellboundKingdomsActor } from "../actor/spellbound-kingdoms.js";
import { AddItemDialog } from "../components/dialog/add-item-dialog.js";
import { AddTalentDialog } from "../components/dialog/add-talent-dialog.js";

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
                {
                    navSelector: ".fighting-style-tabs",
                    contentSelector: ".fighting-style-body",
                    initial: "add-fighting-style",
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
        // data.data['fighting-styles'] = CONFIG.SpellboundKingdoms['fighting-styles'];
        data.data.allFightingStyles = this.getAllFightingStyles();
        data.data.stats = this.getStatsForCharateristicsBlock(data.data.data.stats);
        data.data.data.itemsByType = this.categorizeItems();
        this.computeTalentData(data.data);
        data.data.itemsByType['fighting-style'] = this.appendDataToFightingStyles(data.data.itemsByType['fighting-style']);
        return data;
    }

    activateListeners(html) {
        super.activateListeners(html);

        html.find('.add-talent').click(this.handleAddTalent.bind(this));
        html.find('.character-abilities-fill').click(this.handleFillAbilities.bind(this));
        html.find('.fighting-style-option').click(this.handleToggleFightingStyle.bind(this));
        html.find('.fighting-style-proficiency').change(this.handleChangeFightingStyleLevel.bind(this));
        html.find('.fighting-style-maneuver').click(this.handleSelectManeuver.bind(this));


        html.find('.ability-delete').click(this.handleRemoveItem.bind(this));
        html.find('.use-item').click(this.handleUseItem.bind(this));
        html.find('.use-weapon').click(this.handleUseWeapon.bind(this));

        html.find('.skill-delete').click(this.handleRemoveItem.bind(this));
        html.find('.use-skill').click(this.handleUseSkill.bind(this));
        html.find('.use-skill-hard').click(this.handleUseSkillHard.bind(this));

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

    handleSelectManeuver(event) {        
        const el = event.currentTarget;
        const data = duplicate(el.dataset);
        if (data.entityId !== undefined) {
            this.actor.update({ 'data.selected-maneuver.id': data.entityId });
        } else {
            this.actor.update({ 'data.selected-maneuver.id': data.fightingStyleId + data.entityName });
        }
    }

    handleChangeFightingStyleLevel(event) {        
        const el = event.currentTarget;
        const data = duplicate(el.dataset);

        const item = this.actor.items.get(data.entityId);
        item.update({ 'data.level': el.value });
    }

    handleToggleFightingStyle(e) {
        const styleIdentifier = $(e.currentTarget).data('identifier');
        let style = this.actor.data.items.filter(
            i => i.type === 'fighting-style' && i.data.data.identifier === styleIdentifier
        );

        if (style.length > 0) {
            let itemIds = this.actor.data.items.filter(
                i => i.type === 'maneuver' && i.data.data['fighting-style'] === styleIdentifier
            ).map(i => i.id);
            itemIds.push(style[0].id);
            this.actor.deleteEmbeddedDocuments('Item', itemIds);
        } else {
            let styleAndManeuvers = this.getStyleData(styleIdentifier);
            this.actor.createEmbeddedDocuments('Item', styleAndManeuvers);
        }
    }

    handleCharacterCreation() {
        const app = new (CONFIG.SpellboundKingdoms.characterCreationClass)(this.actor);
        app.render(true);
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

    handleAddTalent() {
        let that = this;
        let d = AddTalentDialog.show(
            "Talent Picker",
            this.categorizeItems().talent,
            'talent',
            function (talents) {
                that.actor.createEmbeddedDocuments("Item", talents);
            }
        );
    }

    handleRemoveItem(e) {
        const div = $(e.currentTarget).parents(".item");
        const entityId = div.data("entity-id");

        this.actor.deleteEmbeddedDocuments("Item", [entityId]);
    }

    handleFillAbilities() {
        let raceAbilities = [], classAbilities = [], existingAbilities = [], allAbilities = [];
        for (const raceAbility of CONFIG.SpellboundKingdoms.races[this.actor.data.data.bio.race.value].abilities) {
            if (typeof raceAbility === 'string' || raceAbility instanceof String) {
                raceAbilities.push(raceAbility);
            } else if (Array.isArray(raceAbility)) {
                raceAbilities = raceAbilities.concat(raceAbility.filter(a => typeof a === 'string' || a instanceof String));
            }
        }

        for (const [, charClass] of Object.entries(this.actor.data.data.bio.classes)) {
            if (!charClass.class) continue;

            classAbilities = classAbilities.concat(
                CONFIG.SpellboundKingdoms.classes[charClass.class].progression[charClass.level].abilities
            );
        }

        existingAbilities = this.actor.data.items.filter(i => i.type === 'ability').map(a => a.data.data.identifier);
        allAbilities = raceAbilities.concat(classAbilities).filter(a => !existingAbilities.includes(a));

        let abilityItems = game.items.filter(i => i.type === 'ability' && allAbilities.includes(i.data.data.identifier)).map(i => i.data);
        
        this.actor.createEmbeddedDocuments("Item", abilityItems);
    }

    // ********** PREPARE DATA *************

    appendDataToFightingStyles(fightingStyles) {
        let stylesByIdentifier = Object.values(fightingStyles).reduce(
            (newObj, style) => { 
                newObj[style.data.data.identifier] = style;
                return newObj;
            }, 
            {}
        );
        let maneuvers = this.actor.data.items.filter(
            i => i.type === 'maneuver'
        );
        let maneuversByStyle = {}, toolbar = {x: 0, y: 0}, activeStyle, selectedManeuver;
        for (const [, maneuver] of Object.entries(maneuvers)) {
            maneuver.data.data.selected = maneuver.id === this.actor.data.data['selected-maneuver']?.id;
            if (maneuver.data.data.selected) {
                toolbar = JSON.parse(JSON.stringify(maneuver.data.data['grid-position']));
                activeStyle = maneuver.data.data['fighting-style'];
                selectedManeuver = maneuver;
            }

            maneuver.data.data.locked = !maneuver.data.data.learned && stylesByIdentifier[maneuver.data.data['fighting-style']].data.data.level == 1 && !maneuver.data.data.rebalancing
                || stylesByIdentifier[maneuver.data.data['fighting-style']].data.data.level < 3 && maneuver.data.data.mastery;

            if (maneuversByStyle[maneuver.data.data['fighting-style']] === undefined) {
                maneuversByStyle[maneuver.data.data['fighting-style']] = [];
            }
            maneuversByStyle[maneuver.data.data['fighting-style']].push(maneuver);
        }

        for (const [, style] of Object.entries(fightingStyles)) {
            style.data.data.grid.xSize = 680 / style.data.data.grid.width;
            // style.data.data.grid.ySize = 590 / style.data.data.grid.height;
            style.data.data.grid.ySize = 470 / style.data.data.grid.height;
            style.data.data.maneuvers = {
                basic: JSON.parse(JSON.stringify(CONFIG.SpellboundKingdoms['fighting-styles'][style.data.data.identifier].maneuvers.basic)),
                style: maneuversByStyle[style.data.data.identifier],
            }

            style.data.data.toolbar = JSON.parse(JSON.stringify(toolbar));
            style.data.data.toolbar.x = style.data.data.toolbar.x * style.data.data.grid.xSize - style.data.data.toolbar.x;
            style.data.data.toolbar.y = style.data.data.toolbar.y * style.data.data.grid.ySize - style.data.data.toolbar.y;
            style.data.data.toolbar.y += (style.data.data.toolbar.y === 0 ? style.data.data.grid.ySize : -26); // where 26 is toolbar height
            style.data.data.toolbar.visible = style.data.data.identifier === activeStyle;
            style.data.data.toolbar['entity-id'] = selectedManeuver?.id;

            for (const [, maneuver] of Object.entries(style.data.data.maneuvers.basic)) {
                maneuver.selected = (style.id + maneuver.name) === this.actor.data.data['selected-maneuver']?.id;
            }

            for (const [, arrow] of Object.entries(style.data.data['grid-arrows'])) {
                arrow.params = {
                    left: arrow.from.x * style.data.data.grid.xSize,
                    top: arrow.from.y * style.data.data.grid.ySize - 55 / 2, // where 55 is arrow div height
                    widthMultiplier: this._getApproxScale(style.data.data.grid, arrow),
                    rotation: this._getRotation(style.data.data.grid, arrow),
                };
            }
        }
        return fightingStyles;
    }

    getAllFightingStyles() {
        let styles = JSON.parse(JSON.stringify(CONFIG.SpellboundKingdoms['fighting-styles']));
        let ownedStyles = this.actor.data.items.filter(
            i => i.type === 'fighting-style'
        );
        for (const [, ownedStyle] of Object.entries(ownedStyles)) {
            styles[ownedStyle.data.data.identifier].selected = true;
        }

        return styles;
    }

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
        data.data.talentCount = Object.keys(data.data.itemsByType.talent).length;
        // data.data.allowedTalentCount = CONFIG.SpellboundKingdoms;
    }

    computeAbilityData(data) {
        data.data.abilityCount = Object.keys(data.data.itemsByType.ability).length;
        data.data.allowedAbilityCount = ReputationStats.getForReputation(data.data.bio.reputation.value ?? 1).ability;
    }

    // ********** HELPERS *************

    _getRotation(grid, vector) {
        let rad = Math.atan2(vector.to.y * grid.ySize - vector.from.y * grid.ySize, vector.to.x * grid.xSize - vector.from.x * grid.xSize);
        let deg = rad * (180 / Math.PI);

        return deg;
    }

    _getApproxScale(grid, arrow) {
        let length = Math.hypot((arrow.to.x - arrow.from.x) * grid.xSize, (arrow.to.y - arrow.from.y) * grid.ySize);

        return length / 40; // where 80 is font size * 2, dunno why
    }

    getStyleData(styleIdentifier) {
        let style = JSON.parse(JSON.stringify(CONFIG.SpellboundKingdoms['fighting-styles'][styleIdentifier]));
        let newItems = [
            {
                name: style.name,
                type: 'fighting-style',
                'data.identifier': style.identifier,
                'data.type': style.type,
                'data.level': style.level,
                'data.requirements': style.requirements,
                'data.info': style.info,
                'data.description': style.description,
                'data.grid': style.grid,
                'data.grid-arrows': style['grid-arrows'],
            }
        ];

        let maneuverData, attack;
        const me = this;
        for (const maneuver of style.maneuvers.style) {
            maneuverData = Object.keys(maneuver).reduce(
                (newObj, key) => {
                    switch (key) {
                        case 'name':
                            newObj[key] = maneuver[key];
                            break;
                        case 'attack':
                            attack = [];
                            for (const att of maneuver[key]) {
                                attack.push({...me.getManeuverAttackDefaults(), ...att});
                            }
                            newObj[`data.${key}`] = Object.assign({}, attack);
                            break;
                        default:
                            newObj[`data.${key}`] = maneuver[key];
                    }
                    return newObj;
                },
                {}
            );
            maneuverData.type = 'maneuver';
            maneuverData['data.fighting-style'] = styleIdentifier;

            newItems.push(maneuverData);
        }

        return newItems;
    }

    getManeuverAttackDefaults() {
        return {
            "die": 4,
            "vs": "defense",
            "type": "physical",
            "damage": {
              "body": 1,
              "mood": 0,
              "strength": 0,
              "quickness": 0,
              "reason": 0,
              "charisma": 0,
              "magic": 0,
              "heart": 0
            },
            "short-description": "1"
        };
    }

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
            { skillName: skillName, apSpent: apSpent }
        );
        let chatData = {
            speaker: { actor: this.actor.id },
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
            { title: game.i18n.localize(titleMap[item.type]), itemName: item.name, description: item.data.data['use-description'] }
        );
        let chatData = {
            speaker: { actor: this.actor.id },
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
            speaker: { actor: this.actor.id },
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

