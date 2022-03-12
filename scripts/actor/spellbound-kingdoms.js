export class SpellboundKingdomsActor extends Actor {

    /** @inheritdoc */
    _onCreateEmbeddedDocuments(type, documents, result, options, userId) {
        super._onCreateEmbeddedDocuments(type, documents, result, options, userId);

        if (type !== 'Item') return;

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

    /** @inheritdoc */
    _onUpdateEmbeddedDocuments(type, documents, result, options, userId) {
        super._onUpdateEmbeddedDocuments(type, documents, result, options, userId);

        if (type !== 'Item') return;

        let idsToDelete = [];
        documents.forEach(function (item) {
            if (item.type !== 'wealth-slot-cooldown') return;

            if (item.data.data.cooldown <= 0) {
                idsToDelete.push(item.id);
            }
        });

        if (idsToDelete.length > 0) {
            this.deleteEmbeddedDocuments('Item', idsToDelete);
        }
    }

    /** @inheritdoc */
    _preDeleteEmbeddedDocuments(embeddedName, result, options, userId) {
        super._preDeleteEmbeddedDocuments(embeddedName, result, options, userId);

        if (embeddedName !== 'Item') return;

        let item;
        for (let [, itemId] of Object.entries(result)) {
            item = this.data.items.get(itemId);
            if (!SpellboundKingdomsItem.purchasableItems.includes(item.type)) continue;
            if (item.data.data['wealth-level'].slot === 0) continue;

            let data = {
                'type': 'wealth-slot-cooldown',
                'name': 'Cooldown',
                'data.cooldown': 7,
                'data.wealth-level.slot': item.data.data['wealth-level'].slot,
                'data.wealth-level.value': item.data.data['wealth-level'].slot,
            };
            this.createEmbeddedDocuments("Item", [data], { renderSheet: false });
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
        let templateMap = {
            gear: 'systems/spellbound-kingdoms/templates/chat/gear.hbs',
            inspiration: 'systems/spellbound-kingdoms/templates/chat/narrative-item.hbs',
            history: 'systems/spellbound-kingdoms/templates/chat/narrative-item.hbs',
            talent: 'systems/spellbound-kingdoms/templates/chat/talent.hbs',
        };
        if (templateMap[this.type] === undefined) return;

        let chatCard = await renderTemplate(
            templateMap[this.type],
            { item: this.getItemData(), type: this.getDisplayType() }
        );
        let chatData = {
            speaker: this.actor
                ? { actor: this.actor.id }
                : { actor: game.user._id, alias: game.user.name },
            content: chatCard,
        };
        ChatMessage.create(chatData, {});
    }

    getDisplayType() {
        switch (this.type) {
            case 'gear':
                return "SK.DISPLAY_TYPE.ITEM";
            case 'inspiration':
                return "SK.DISPLAY_TYPE.INSPIRATION";
            case 'history':
                return "SK.DISPLAY_TYPE." + this.data.data.type.toUpperCase();
            case 'talent':
                return "SK.DISPLAY_TYPE.TALENT";
        }
    }

    getItemData() {
        const talentLevels = ['', 'SK.LABEL.MINOR', 'SK.LABEL.MAJOR', 'SK.LABEL.GRAND'];
        switch (this.type) {
            case 'talent':
                this.data.data.levelName = talentLevels[parseInt(this.data.data.level)];
        }
        return this.data;
    }
}
