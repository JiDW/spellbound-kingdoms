/**
 * @extends Application
 * @description An Application that mimics Dialog, but provides more functionality in terms of data binds and handling of a roll object. Supports Forbidden Lands standard rolls and spell rolls.
 * @see Dialog
 */
 export class SKRollHandler extends Application {
	constructor(
		{
			stat = { label: "DICE.BASE", value: 0 }, // die that initiates the roll
			increase = 0, // how many times the base die is increased
			penalty = [], // array of penalty dice { label: "", value: 0 }
			bonus = [], // array of bonus dice { label: "", value: 0 }
			spell = {},
		},
		options = {}, // This object includes information that may be required to create the roll instance but not the dice rolled.
	) {
		super(options);
		this.roll = {};
		this.base = stat;
		this.bonus = bonus;
		this.penalty = penalty;
		this.damage = options.damage ?? 0;
		this.spell = spell;
	}

	/**
	 * Used to determine whether to display the damage information on the chat card.
	 */
	get isAttack() {
		return !!this.damage;
	}

	/**
	 * Calculates the total number of dice to roll on a spell roll. This is to separate the value from the Willpower spent.
	 */
	get spellDice() {
		let sum = this.base.value;
		if (this.spell.psych) ++sum;
		if (this.spell.safecast) sum -= this.spell.safecast;
		if (sum < 0) sum = 0;
		return sum;
	}

	/**
	 * Calculates the power level, once again separated from dice rolled and willpower spent.
	 */
	get powerLevel() {
		let sum;
		sum = this.spellDice;
		if (this.spell.ingredient) ++sum;
		if (this.spell.safecast) sum += this.spell.safecast;
		return sum;
	}

	/**
	 * Safecast rules are rather complex, this getter intends to avoid rolling negative dice if someone safecasts a 1 willpower roll without Psychic talent.
	 */
	get safecastMax() {
		return this.spell.psych || this.base.value > 1 ? 2 : 1;
	}

	/**
	 * Foundry override intended to customize the window render.
	 */
	static get defaultOptions() {
		return mergeObject(super.defaultOptions, {
			classes: ["spellbound-kingdoms"],
			width: "280",
			height: "auto",
			resizable: false,
		});
	}

	/**
	 * Foundry override allowing custom Roll Dialog template (used for spell rolls only atm. but intended to be extensible).
	 */
	get template() {
		return this.options.template || "systems/spellbound-kingdoms/templates/components/roll-engine/dialog.html";
	}

	/**
	 * Foundry override of window eventlisteners.
	 * @param {JQuerySerializeArrayElement} html
	 */
	activateListeners(html) {
		super.activateListeners(html);

		//We need to bind the cancel button to the FormApplication's close method.
		html.find(".dialog-button-cancel").click(() => {
			this.close();
		});
		html.find(".dialog-button-roll").click((e) => {
			this.collectRollData(e);
			this.executeRoll();
			this.close();
		});
	}

	/**
	 * Foundry override providing handlerbars template with data it needs to render.
	 * @param {Object<any>} options a native Foundry parameter.
	 * @returns {Object<any>} data object used in rendering handlebars template.
	 */
	getData(options = {}) {
		return {
			title: this.title,
			dice: {
				base: this.base,
				skill: this.skill,
				gear: this.gear,
			},
			artifact: this.artifact,
			modifier: this.modifier,
			safecastMax: this.safecastMax,
			spellDice: this.spellDice,
			powerLevel: this.powerLevel,
			spell: this.spell,
			options,
		};
	}

	/**
	 * Guesses the correct ActorData of the character making a roll.
	 * @param {Object<Actor.id<string>, Scene.id<string>, Token.id<string>>} data object containing id references to the character making a roll.
	 * @returns {ActorData}
	 */
	static getSpeaker({ actor, scene, token }) {
		if (scene && token) return game.scenes.get(scene)?.tokens.get(token)?.actor;
		else return game.actors.get(actor);
	}

	/**
	 * Foundry override. **REQUIRED by FormApplications**. This method handles the data that is derived from the FormApplication on a submit event.
	 * Not overriding this method will result in a thrown error.
	 * @description In this method we pass the formData onto the correct internal rollHandler.
	 * @param {JQueryEventConstructor} event
	 * @param {Object<String | null>} formData
	 * @returns private RollHandler
	 */
	async _updateObject(event, formData) {
		this._validateForm(event, formData);
		if (this.options.type === "spell") return this._handleRollSpell(formData);
		else return this._handleYZRoll(formData);
	}

	/**
	 * Validates whether a form is empty and contains a valid artifact string (if any).
	 * @param {JQueryEventConstructor} event
	 * @param {Object<String | null>} formData
	 * @returns true
	 */
	_validateForm(event, formData) {
		const isEmpty = Object.values(formData).every((value) => !value);
		const invalidArtifactField = !this.constructor.isValidArtifact(formData.artifact);
		if (isEmpty) {
			const warning = game.i18n.localize("WARNING.NO_DICE_INPUT");
			event.target.base.focus();
			ui.notifications.warn(warning);
			throw new Error(warning);
		}
		if (invalidArtifactField) {
			const warning = game.i18n.localize("WARNING.INVALID_ARTIFACT");
			event.target.artifact.focus();
			ui.notifications.error(warning);
			throw new Error(warning);
		}
		return;
	}

	/**
	 * Handler for Spell roll. Takes total spelldice and powerlevel and stores in constructor then calls executeRoll.
	 * @param {Object<number>} data passed from formData.
	 * @returns method initiating roll.
	 */
	async _handleRollSpell({ base, power }) {
		this.b = base;
		this.damage = power;
		const actor = SKRollHandler.getSpeaker({
			actor: this.options.actorId,
			scene: this.options.sceneId,
			token: this.options.tokenId,
		});
		const subtractValue = this.spell.willpower.max + 1 - this.spell.willpower.value;
		await SKRollHandler.modifyWillpower(actor, subtractValue, "subtract");
		return this.executeRoll();
	}

	/**
	 * Handler for standard (Year Zero) rolls. Takes total amount of dice and stores in constructor then calls executeRoll.
	 * @param {Object<number} data passed from formData.
	 * @returns method initiating roll.
	 */
	_handleYZRoll({ base, skill, gear, artifact, modifier }) {
		this.b = base;
		this.s = skill;
		this.g = gear;
		this.a = artifact;
		this.modifier = modifier;
		// Handle automatically rolling arrow dice on ranged attacks.
		this.handleRollArrows();
		return this.executeRoll();
	}

	/**
	 * Generates a roll formula based on number of dice.
	 * @param {number} number number of dice rolled.
	 * @param {string} term YZUR internal naming convention for DieTerms. E.g. "base".
	 * @param {string} flavor usually the name of the die term. E.g. "Strength".
	 * @returns {string} valid Roll formula.
	 * @see Roll
	 */
	generateTermFormula(number, term, flavor = "") {
		if (!number) return;
		flavor = game.i18n.localize(flavor);
		return `${number}d${term}${flavor ? `[${flavor}]` : ""}`;
	}

	collectRollData() {
		let selects = this.element.find('select.die-select');
		let roll = {
			base: [],
			penalty: [],
			bonus: [],
			'base-increase': [],
		};
		let elem, value, inc;
		for (const select of selects) {
			elem = $(select);
			
      for (let id in roll) {
				if (elem.data('type') === id) {
					value = elem.val();
					if (value) roll[id].push(value);
					break;
				}
			}
		}
		inc = parseInt(roll["base-increase"][0]) ?? 0;
		if (roll.base[0] === 'd20' && inc > 0) {
				roll.base.push(...(new Array(inc).fill('d20')));
		}
console.log(roll);
		this.roll = roll;
	}

	/**
	 * Generates an options object to pass on to YZUR. Useful for storing important information about the roll.
	 * @returns {Object<any>} catch-all options object. Contains all non-dice related options.
	 */
	getRollOptions() {
		const unlimitedPush = game.settings.get("spellbound-kingdoms", "allowUnlimitedPush");
		// Strictly speaking, unlimited push means 'Infinity' pushes,
		// however Infinity is finicky to serialize.
		// So we use a sufficiently large number instead.
		// eslint-disable-next-line no-nested-ternary
		const maxPush = unlimitedPush ? 10000 : this.options.actorType === "monster" ? "0" : 1;
		return {
			name: this.title,
			maxPush: this.options.maxPush || maxPush,
			type: this.options.type,
			actorId: this.options.actorId,
			actorType: this.options.actorType,
			alias: this.options.alias,
			attribute: this.base.name,
			chance: this.spell.chance,
			isAttack: this.isAttack,
			consumable: this.options.consumable,
			damage: this.damage,
			tokenId: this.options.tokenId,
			sceneId: this.options.sceneId,
			item: this.gear.name,
			itemId: this.gear.itemId || this.spell?.item?.id,
			willpower: this.options.willpower,
		};
	}

	async handleRollArrows() {
		const isCharacter = this.options.actorType === "character";
		const isRanged = this.gear.category === "ranged";
		const hasArrows = this.gear.ammo === "arrows";
		if (!(isCharacter && isRanged && hasArrows)) return;
		const actor = this.constructor.getSpeaker({
			actor: this.options.actorId,
			scene: this.options.sceneId,
			token: this.options.tokenId,
		});
		return setTimeout(() => actor.sheet.rollConsumable("arrows"), 500);
	}

	/**
	 * Takes rollData and rollOptions objects and produces a YZUR roll that is evaluated and sent to chat.
	 * @returns ChatMessage
	 * @see getRollOptions
	 * @see ChatMessage
	 */
	async executeRoll() {
		let base = `${this.roll.base.length}${this.roll.base[0]}xkh`;
		let penalty = `{${this.roll.penalty.map(die => die + 'xkh').join(', ')}}kl`;
		let bonus = `{${this.roll.bonus.map(die => die + 'xkh').join(', ')}}kh`;
		// {{{3d20xkh, {d8xkh, d10xkh}kl}kl}, {d4xkh, d6xkh}kh}kh
		// let formula = `{{{${base}, ${penalty}}kl}, ${bonus}}kh`;
		let formula = this.roll.penalty.length > 0 ? `{${base}, ${penalty}}kl` : base;
		if (this.roll.bonus.length > 0) formula = `{${formula}, ${bonus}}kh`;
console.log(formula);

		const roll = Roll.create(
			formula,
			{} /* We pass no "data" for the roll to evaluate */,
			{} //this.getRollOptions(),
		);
		// Roll the dice!
		await roll.roll({ async: true });
		return roll.toMessage();
	}

	/* -------------------------------------- */
	/*           STATIC METHODS               */
	/* -------------------------------------- */

	/**
	 * Determines whether the input resolves to a valid artifact. Used to determine whether the user has input a valid Artifact string.
	 * @param {string} input
	 * @returns true
	 * @see _validateForm
	 */
	static isValidArtifact(input) {
		const isEmpty = !input || "0";
		const containsArtifactDice = !!input?.match(/(\d*d(?:8|10|12))/i);
		const isDiceFormula = !input?.match(/[^\dd+, ]/i);
		return isEmpty || (isDiceFormula && containsArtifactDice);
	}

	/**
	 *
	 * @param {Object<any>} data data object predominantly containing information about dice. See constructor.
	 * @param {Object<any>} options catch-all for other related information.
	 * @returns rendered instance of SKRollHandler
	 * @see constructor
	 */
	static createRoll(data = {}, options = {}) {
		if (!data) console.warn("No roll data passed. Executing generic roll.");
		return new SKRollHandler(data, { ...options, title: game.i18n.localize(data.title) || "ACTION.GENERIC" }).render(
			true,
		);
	}

	/**
	 * Handles pushing of a roll. Mainly by utilizing YZUR push method. Then updating the character pushing the roll with attribute, gear damage and willpower.
	 * @param {ChatMessage} msg the chat message that was clicked when pushing the roll.
	 * @returns pushes then updates actor or simply pushes the roll if no actor is presented.
	 */
	static async pushRoll(msg) {
		const roll = msg.roll;
		await roll.push({ async: true });

		let speaker = this.getSpeaker(msg.data.speaker);
		if (speaker) await this.updateActor(roll, speaker);

		return roll.toMessage();
	}

	/**
	 * Handles attribute and gear damage to actor.
	 * @param {FBLRoll} roll
	 * @param {ActorData} speaker
	 */
	static async updateActor(roll, speaker) {
		// We need to keep track of how much damage has been done to the actor in case it's a Dwarf and allowed unlimited pushes.
		if (!roll.options.characterDamage) roll.options.characterDamage = { gear: 0, attribute: 0 };
		if (roll.gearDamage) await this.applyGearDamage(roll, speaker);
		if (roll.attributeTrauma) await this.applyAttributDamage(roll, speaker);
		roll.options.characterDamage = { gear: roll.gearDamage || 0, attribute: roll.attributeTrauma || 0 };
	}

	/**
	 * Applies attribute damage and calls modify willpower.
	 * @param {Roll} roll
	 * @param {ActorData} speaker
	 * @returns updates actor with attribute trauma.
	 */
	static async applyAttributDamage({ attributeTrauma, options: { attribute, characterDamage } }, speaker) {
		let { attribute: appliedDamage } = characterDamage;
		const currentDamage = attributeTrauma - appliedDamage;

		let value = speaker?.attributes[attribute]?.value;
		if (!value) return;

		await this.modifyWillpower(speaker, currentDamage);

		value = Math.max(value - currentDamage, 0);

		if (value === 0) ui.notifications.notify(game.i18n.localize("NOTIFY.YOU_ARE_BROKEN"));
		await speaker.update({ [`data.attribute.${attribute}.value`]: value });
	}

	/**
	 * Applies gear damage.
	 * @param {Roll} roll
	 * @param {ActorData} speaker
	 * @returns updates actor with gear damage.
	 */
	static async applyGearDamage({ gearDamage, options: { itemId, characterDamage } }, speaker) {
		let { gear: appliedDamage } = characterDamage;
		const currentDamage = gearDamage - appliedDamage;

		const item = speaker.items.get(itemId);
		if (!item) return;

		const value = Math.max(item?.bonus - currentDamage, 0);

		if (value === 0) ui.notifications.notify(game.i18n.localize("NOTIFY.YOUR_ITEM_BROKE"));
		await speaker.updateEmbeddedDocuments("Item", [{ _id: itemId, "data.bonus.value": value }]);
	}

	/**
	 * Modifies willpower by either adding (default) or subtracting willpower from the Actor.
	 * @param {ActorData} speaker
	 * @param {number} value number of willpower to add or subtract.
	 * @param {string} operation essentially a boolean.
	 * @returns updates actor with willpower changes.
	 */
	static async modifyWillpower(speaker, value, operation = "add") {
		let willpower = speaker.willpower;
		if (!willpower) return;

		willpower =
			operation === "add"
				? Math.min(willpower.value + value, willpower.max)
				: Math.max(willpower.value - value, 0);
		return await speaker.update({ "data.bio.willpower.value": willpower });
	}

	/**
	 * Attempts to update the Actor with a new consumable value.
	 * @param {string} messageId
	 * @returns updates actor with changes to the consumable.
	 */
	static async decreaseConsumable(messageId) {
		let {
			data: { speaker },
			roll: {
				options: { consumable },
			},
		} = game.messages.get(messageId);

		speaker = this.getSpeaker(speaker);
		if (!speaker) return console.error("Could not decrease consumable: No actor found.");

		const currentValue = speaker?.consumables[consumable]?.value;
		const newValue = Math.max(currentValue - 1, 0);
		return await speaker.update({ [`data.consumable.${consumable}.value`]: newValue });
	}
}