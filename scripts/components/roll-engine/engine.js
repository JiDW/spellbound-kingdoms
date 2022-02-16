import { SKDie } from "./sk-die.js";

/**
 * @extends Application
 * @description An Application that mimics Dialog, but provides more functionality in terms of data binds and handling of a roll object. Supports Forbidden Lands standard rolls and spell rolls.
 * @see Dialog
 */
 export class SKRollHandler extends Application {
	constructor(
		{
			stat = { label: "DICE.BASE", value: 0 }, // die that initiates the roll
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
		let baseSelect = JSON.parse(JSON.stringify(SKDie.DIE_STEPS));
		delete baseSelect['0'];
		let otherSelect = JSON.parse(JSON.stringify(baseSelect));
		baseSelect[SKRollHandler.statToDieSize(this.base.value)].selected = true;

		return {
			title: this.title,
			base: this.base,
			baseSelect: baseSelect,
			otherSelect: otherSelect,
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

		this.roll = roll;
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

		return roll.toMessage();
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
	 * 
	 * @param {Number} statValue 
	 * @returns {Number}
	 */
	static statToDieSize(statValue) {
		if (SKDie.DIE_STEPS[statValue] !== undefined) return statValue;

		while (SKDie.DIE_STEPS[statValue] === undefined && statValue > 0) {
			statValue--;
		}

		if (SKDie.DIE_STEPS[statValue] === undefined) return 2;

		return statValue;
	}
}