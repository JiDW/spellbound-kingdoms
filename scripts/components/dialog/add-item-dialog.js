export class AddItemDialog extends Dialog {

    constructor(data, options) {
        super(data, options);

        const me = this;
        let onAddItemsCallback = this.data.buttons[this.data.default].callback;
        this.data.buttons[this.data.default].callback = async function (dialogHtml) {
            let items = await me.getSelectedItems(dialogHtml);
            onAddItemsCallback(items);
        }

        this.data.items = this.buildItemList();
    }

    /** @override */
    static get defaultOptions() {
        return mergeObject(super.defaultOptions, {
            template: "systems/spellbound-kingdoms/templates/components/dialog/item-picker.hbs",
            classes: ["dialog", "spellbound-kingdoms", 'item-picker-dialog'],
            width: 600,
            height: 600,
            buttons: {
                add: {
                    icon: '<i class="fas fa-check"></i>',
                    label: "Add",
                },
                cancel: {
                    icon: '<i class="fas fa-times"></i>',
                    label: "Cancel",
                },
            },
            default: "add",
            jQuery: true,
        });
    }

    /** @inheritdoc */
    getData(options) {
        let data = super.getData(options);
        data.items = this.data.items
        return data;
    }

    /**
     * Show dialog that allows to add items to a character
     * 
     */
    static async show(title, existingItems = {}, type, onAdd) {
        onAdd = onAdd || function () { };

        let d = new AddItemDialog({
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

    /**
     * @param  {Array} existingItems Array with items that character already has
     */
    buildItemList() {
        let items = game.items.filter(i => i.type === this.data.itemType);
        for (let item of items) {
            if (this.data.existingItems[item.name] !== undefined) continue;

            item.data.data.descriptionHtml = item.data.data.description.replaceAll("\n", '<br/>')
        }

        return items;
    }
}