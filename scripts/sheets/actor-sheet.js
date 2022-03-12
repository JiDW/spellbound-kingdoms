
// import { CharacterPickerDialog } from "../dialog/character-picker-dialog.js";
import { SpellboundKingdomsItem } from "../actor/spellbound-kingdoms.js";
import { SKRollHandler } from "../components/roll-engine/engine.js";

export class SpellboundKingdomsActorSheet extends ActorSheet {

    static setupSocketListeners() {
        game.socket.on("system.spellbound-kingdoms", SpellboundKingdomsActorSheet.doItemTransfer);
    }

    activateListeners(html) {
        super.activateListeners(html);

        let me = this;

        // Rolls
        html.find(".roll-stat").click((ev) => {
            const statName = $(ev.currentTarget).data("stat");
            return this.rollStat(statName);
        });
        html.find(".gear-item-wealth-level select").change(this.handleWealthSlotChange.bind(this));
        html.find(".cooldown-controls .increase-cooldowns").click((ev) => {
            me.changeCooldowns(1);
        });
        html.find(".cooldown-controls .decrease-cooldowns").click((ev) => {
            me.changeCooldowns(-1);
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
        data.data.itemsByType = this.getItemsByType();
        data.data.wealthSlots = this.geWealthSlots();
        data.data.inventory = this.getInventory(data.data.itemsByType);
        return data;
    }

    // ********** PREPARE DATA *************

    getInventory(itemsByType) {
        let inventory = {
            armor: this.subcategorize(itemsByType.armor, 'subtype'),
            weapon: this.subcategorize(itemsByType.weapon, 'subtype'),
            fashion: this.subcategorize(itemsByType.fashion, 'subtype'),
            alchemy: this.subcategorize(itemsByType.alchemy, 'subtype'),
            engineering: this.subcategorize(itemsByType.engineering, 'subtype'),
            vehicle: {'': itemsByType.vehicle},
            building: this.subcategorize(itemsByType.building, 'subtype'),
            wonder: {'': itemsByType.wonder},
        };
        
        return inventory;
    }

    subcategorize(items, categoryField) {
        let split = {};
        let category;
        for (let [, item] of Object.entries(items)) {
            category = item.data.data[categoryField];
            if (split[category] === undefined) {
                split[category] = {};
            }
            split[category][item.id] = item;
        }

        return split;
    }

    geWealthSlots() {
        let wealthSlots = Array.from({length: 21}, u => ([])); // new Array(21).fill([]);
        let slotNumber;

        let itemTypes = SpellboundKingdomsItem.purchasableItems.concat(['wealth-slot-cooldown']);
        const purchasableItems = this.actor.data.items.filter(i => itemTypes.includes(i.data.type));
        for(let item of purchasableItems.values()) {
            slotNumber = parseInt(item.data.data['wealth-level'].slot);
            if (slotNumber === 0) continue;

            wealthSlots[slotNumber].push(item);
        }

        return wealthSlots;
    }

    getItemsByType() {
        let itemsByType = this.categorizeItems();
        itemsByType = this.sortCategorizedItems(itemsByType);

        itemsByType.ability = this.categorizeAbilities(itemsByType.ability);

        return itemsByType;
    }
    categorizeItems() {
        let itemsByType = {
            weapon: {},
            armor: {},
            alchemy: {},
            engineering: {},
            fashion: {},
            vehicle: {},
            building: {},
            wonder: {},
            'fighting-style': {},
            maneuver: {},
            talent: {},
            scar: {},
            spell: {},
            inspiration: {},
            history: {},
            reputation: {},
            ability: {},
        };
        let type, subtype, talentLevels = ['', 'SK.LABEL.MINOR', 'SK.LABEL.MAJOR', 'SK.LABEL.GRAND'];

        this.actor.data.items.forEach((item) => {
            type = item.data.type;
            subtype = item.data.data.type;
            if (itemsByType[subtype] !== undefined) {
                itemsByType[subtype][item.id] = item;
            } else if (itemsByType[type] !== undefined) {
                itemsByType[type][item.id] = item;
            }

            switch (type) {
                case 'gear':
                case 'vehicle':
                    item.data.data.wealthLevels = {'0': game.i18n.localize('SK.LABEL.GOLD')};
                    if (item.data.data['wealth-level'].value <= this.actor.data.data.wealth.level.value) {
                        for (let i = item.data.data['wealth-level'].value; i <= this.actor.data.data.wealth.level.value; i++) {
                            item.data.data.wealthLevels[i] = i;
                        }
                    }
                    item.data.data['requirements-met'] = true;
                    for (const [stat, value] of Object.entries(item.data.data['stat-requirement'])) {
                        if (this.actor.data.data.stats[stat].value < value) {
                            item.data.data['requirements-met'] = false;
                            break;
                        }
                    }
                    break;
                case 'talent':
                    item.data.data.levelString = talentLevels[parseInt(item.data.data.level)];
                    break;
                case 'ability':
                    this.appendAbilityDataFromDataset(item);
                    break;
            }
        });

        return itemsByType;
    }
    sortCategorizedItems(itemsByType) {
        itemsByType.weapon = this._sortItems(
            itemsByType.weapon,
            (itemId1, itemId2) => itemsByType.weapon[itemId2].data.data.quality.value - itemsByType.weapon[itemId1].data.data.quality.value
        );
        itemsByType.armor = this._sortItems(
            itemsByType.armor,
            (itemId1, itemId2) => itemsByType.armor[itemId1].name.localeCompare(itemsByType.armor[itemId2].name)
        );
        itemsByType.fashion = this._sortItems(
            itemsByType.fashion,
            (itemId1, itemId2) => itemsByType.fashion[itemId2].data.data.quality.value - itemsByType.fashion[itemId1].data.data.quality.value
        );
        itemsByType.alchemy = this._sortItems(
            itemsByType.alchemy,
            (itemId1, itemId2) => itemsByType.alchemy[itemId1].name.localeCompare(itemsByType.alchemy[itemId2].name)
        );
        itemsByType.engineering = this._sortItems(
            itemsByType.engineering,
            (itemId1, itemId2) => itemsByType.engineering[itemId1].name.localeCompare(itemsByType.engineering[itemId2].name)
        );
        itemsByType.vehicle = this._sortItems(
            itemsByType.vehicle,
            (itemId1, itemId2) => itemsByType.vehicle[itemId1].name.localeCompare(itemsByType.vehicle[itemId2].name)
        );
        itemsByType.talent = this._sortItems(
            itemsByType.talent,
            (itemId1, itemId2) => itemsByType.talent[itemId1].name.localeCompare(itemsByType.talent[itemId2].name)
        );
        itemsByType.spell = this._sortItems(
            itemsByType.spell,
            (itemId1, itemId2) => itemsByType.spell[itemId1].name.localeCompare(itemsByType.spell[itemId2].name)
        );

        return itemsByType;
    }

    categorizeAbilities(abilities) {
        let categorizedAbilities = {};
        let categoryName, type, subtype;

        for (const [, ability] of Object.entries(abilities)) {
            type = game.i18n.localize(ability.data.data.type);
            subtype = game.i18n.localize(ability.data.data.subtype);
            categoryName = `${type}: ${subtype}`;
            if (categorizedAbilities[categoryName] === undefined) {
                categorizedAbilities[categoryName] = [];
            }

            categorizedAbilities[categoryName].push(ability);
        }
        
        categorizedAbilities = this._sortItems(
            categorizedAbilities,
            (itemId1, itemId2) => categorizedAbilities[itemId1].length - categorizedAbilities[itemId2].length
        );

        for (let [i, abilities] of Object.entries(categorizedAbilities)) {
            abilities.sort((a, b) => a.data.data.sortOrder - b.data.data.sortOrder);
        }

        return categorizedAbilities;
    }

    // ********** HANDLERS *************

    rollStat(statIdentifier) {
        const data = {
            title: this.actor.data.data.stats[statIdentifier].label,
            base: this.getStat(statIdentifier),
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
        let type = (data.subtype ? data.subtype.capitalize() : data.type.capitalize());
        data["name"] = `New ${type}`;
        if (data.subtype) {
            data['data.type'] = data.subtype;
            delete data.subtype;
        }
        this.actor.createEmbeddedDocuments("Item", [data], { renderSheet: true });
    }

    handleWealthSlotChange(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const item = this.actor.items.get(div.data("entity-id"));
        
        item.update({'data.wealth-level.slot': parseInt($(event.currentTarget).val())});
    }

    handleItemTransfer(event) {
        event.preventDefault();
        const div = $(event.currentTarget).parents(".item");
        const item = this.actor.items.get(div.data("entity-id"));
        const that = this;

        if (item === null) return;

        CharacterPickerDialog.show(
            game.i18n.format('SK.TRANSFER_DIALOG', { item: item.name }),
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
        item.update({ [updateKey]: el.value });
    }

    // ********** HELPERS *************

    /**
     * Adds data to the ability to help categorizing it later.
     * 
     * 1. Find the ability in race or class dataset.
     * 2. Assign category (race or class)
     * 3. assign sort order within category (class level when ability becomes available)
     * 
     * @param {Object} ability 
     */
    appendAbilityDataFromDataset(ability) {
        let found = false;
        let abilityDataCache = {};
        if (abilityDataCache[ability.data.data.identifier] === undefined) {
            abilityDataCache[ability.data.data.identifier] = [];

            for (const [raceIdentifier, raceData] of Object.entries(CONFIG.SpellboundKingdoms.races)) {
                for (const raceAbility of raceData.abilities) {
                    if (
                        ((typeof raceAbility === 'string' || raceAbility instanceof String) && raceAbility === ability.data.data.identifier)
                        || (Array.isArray(raceAbility) && raceAbility.includes(ability.data.data.identifier))
                    ) {
                        abilityDataCache[ability.data.data.identifier].push({
                            type: 'SK.LABEL.RACE',
                            subtype: raceData.name,
                            sortOrder: 1,
                            categoryIdentifier: raceData.identifier,
                        });
                        found = true;
                        break;
                    }
                }
            }

            if (!found) {
                for (const [classIdentifier, classData] of Object.entries(CONFIG.SpellboundKingdoms.classes)) {
                    if (!classData.progression[20].abilities.includes(ability.data.data.identifier)) continue;

                    for (const classLevel of classData.progression) {
                        if (classLevel.level === 0) continue;

                        if (classLevel.abilities.includes(ability.data.data.identifier)) {
                            abilityDataCache[ability.data.data.identifier].push({
                                type: 'SK.LABEL.CLASS',
                                subtype: classData.name,
                                sortOrder: classLevel.level,
                                categoryIdentifier: classData.identifier,
                            });
                            break;
                        }
                    }
                }
            }

            if (abilityDataCache[ability.data.data.identifier].length === 0) {
                abilityDataCache[ability.data.data.identifier].push({
                    type: 'SK.LABEL.CUSTOM',
                    subtype: 'custom',
                    sortOrder: 0,
                    categoryIdentifier: 'custom',
                });
            }
        }

        let relevantData = abilityDataCache[ability.data.data.identifier][0];
        if (abilityDataCache[ability.data.data.identifier].length > 1) {
            for (const [, data] of Object.entries(abilityDataCache[ability.data.data.identifier])) {
                if (this.isRaceOrClass(data.categoryIdentifier)) {
                    relevantData = data;
                    break;
                }
            }
        }

        ability.data.data = {...ability.data.data, ...relevantData};
    }

    isRaceOrClass(identifier) {
        return identifier === this.actor.data.data.bio.classes[0].class
            || identifier === this.actor.data.data.bio.classes[1].class
            || identifier === this.actor.data.data.bio.classes[2].class
            || identifier === this.actor.data.data.bio.race.value;
    }

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

        let { sourceId, destinationId, item } = data;
        const source = game.actors.get(sourceId);
        const destination = game.actors.get(destinationId);

        console.log(`Transfering ${item.name} from ${source.name} to ${destination.name}`);
        destination.createEmbeddedDocuments("Item", [item.data]);
        source.deleteEmbeddedDocuments("Item", [item.id]);
    };

    changeCooldowns(delta) {
        let updates = [], update;
        let cds = this.actor.data.items.filter(i => i.data.type === 'wealth-slot-cooldown');
        for(let item of cds.values()) {
            updates.push({
                '_id': item.id,
                'data.cooldown': item.data.data.cooldown + delta,
            });
        }
        this.actor.updateEmbeddedDocuments('Item', updates);
    }
}
