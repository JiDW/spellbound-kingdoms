export class SKRoll extends Roll {
  
  constructor(formula, data={}, options={}) {
		if (options.name == undefined) options.name = data.name;
		if (options.type == undefined) options.type = data.type;

    super(formula, data, options);
    
    this.mooded = false;
    this.inspired = false;
  }

	/**
	 * The name of the roll.
	 * @type {string}
	 * @readonly
	 */
	get name() {
		return this.options.name;
	}
	set name(str) {
		this.options.name = str;
	}

	/**
	 * The name of the roll.
	 * @type {string}
	 * @readonly
	 */
	get type() {
		return this.options.type;
	}
	set type(str) {
		this.options.type = str;
	}

  /**
	 * Tells if the roll is pushable.
	 * @type {boolean}
	 * @readonly
	 */
	get moodable() {
		return !this.mooded;
	}

  /**
	 * Tells if the roll is pushable.
	 * @type {boolean}
	 * @readonly
	 */
	get inspirable() {
		return !this.inspired;
	}

	// Override the create method to use SKRoll class
	static create(formula, data = {}, options = {}) {
		return new this(formula, data, options);
	}
  
  /**
   * Render the tooltip HTML for a Roll instance
   * @return {Promise<string>}      The rendered HTML tooltip as a string
   */
  async getTooltip() {
    const categories = this.getTooltipParts();
    return renderTemplate(this.constructor.TOOLTIP_TEMPLATE, { categories });
  }

  getTooltipParts() {
    let categories = this.dice.reduce(
      (categorizedDice, curDie) => {
        let dieTtData = curDie.getTooltipData();
        let category = dieTtData.flavor || 'base';

        if (categorizedDice[category] === undefined) {
          categorizedDice[category] = {
            label: category, 
            total: dieTtData.total, 
            rolls: dieTtData.rolls
          };
        } else {
          categorizedDice[category].rolls = categorizedDice[category].rolls.concat(dieTtData.rolls);
          categorizedDice[category].total = categorizedDice[category].totalAccumulator(
            categorizedDice[category].total,
            dieTtData.total
          );
        }

        return categorizedDice;
      },
      { 
        base: {label: 'SK.DICE.BASE', total: 0, rolls: [], totalAccumulator: Math.max}, 
        penalty: {label: 'SK.DICE.PENALTY', total: Number.MAX_SAFE_INTEGER, rolls: [], totalAccumulator: Math.min}, 
        bonus: {label: 'SK.DICE.BONUS', total: 0, rolls: [], totalAccumulator: Math.max}, 
      }
    );

    // remove blank categories
    if (categories.base.total === 0) delete categories.base;
    if (categories.penalty.total === Number.MAX_SAFE_INTEGER) delete categories.penalty;
    if (categories.bonus.total === 0) delete categories.bonus;

    return categories;
  }

  /** @override */
	async render(chatOptions = {}) {
		chatOptions = foundry.utils.mergeObject(
			{
				user: game.user.id,
				flavor: this.name,
				isSkRoll: this.type === 'sk',
				template: this.constructor.CHAT_TEMPLATE,
			},
			chatOptions,
		);
		const isPrivate = chatOptions.isPrivate;

		// Executes the roll, if needed.
		if (!this._evaluated) await this.evaluate();

		// Defines chat data.
		const chatData = {
			formula: isPrivate ? "???" : this._formula,
			flavor: isPrivate ? null : chatOptions.flavor,
			isSkRoll: isPrivate ? null : chatOptions.isSkRoll,
			user: chatOptions.user,
			tooltip: isPrivate ? "" : await this.getTooltip(),
			total: isPrivate ? "?" : Math.round(this.total * 100) / 100,
			moodable: isPrivate ? false : this.moodable,
			inspirable: isPrivate ? false : this.inspirable,
			options: chatOptions,
			roll: this,
		};

		// Renders the roll display template.
		return renderTemplate(chatOptions.template, chatData);
	}
}