import { AddItemDialog } from "./add-item-dialog.js";

export class AddTalentDialog extends AddItemDialog {

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/spellbound-kingdoms/templates/components/dialog/talent-picker.hbs",
            tabs: [
              {
                navSelector: ".tabs",
                contentSelector: ".tab-body",
                initial: "social",
              },
            ],
        });
    }

    /** @inheritdoc */
    getData(options) {
        let data = super.getData(options);
        data.itemsByCategory = this.data.items
        return data;
    }

    /**
     * @param  {string} html Dialog content
     */
    activateListeners(html) {
        super.activateListeners(html);
    }

    async getSelectedItems(dialogHtml) {
        let items = [];
        let item;
        let elems = dialogHtml.find('input[type="checkbox"]:checked');
        for (let elem of elems) {
            item = await game.items.get(elem.getAttribute('id'));
            items.push(item.data);
        }

        return items;
    }

    buildItemList() {
        let items = game.items.filter(i => i.type === this.data.itemType);
        let itemsByCategory = {};

        for (let item of items) {
            if (this.data.existingItems[item.name] !== undefined) continue;

            item.data.data.descriptionHtml = item.data.data.description.replaceAll("\n", '<br/>');

            if (itemsByCategory[item.data.data.type] === undefined) {
                itemsByCategory[item.data.data.type] = [];
            }
            itemsByCategory[item.data.data.type].push(item);
        }

        return itemsByCategory;
    }

    /**
     * Show dialog that allows to add items to a character
     */
    static async show(title, existingItems = {}, type, onAdd) {
        onAdd = onAdd || function () { };

        let d = new AddTalentDialog({
            title: title,
            //   content: this.buildDivHtmlDialog(itemList),
            existingItems: existingItems,
            itemType: type,
            width: 600,
            buttons: {
                add: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Add",
                    callback: onAdd,
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                },
            },
            default: "add",
        });
        d.render(true);
    }
}