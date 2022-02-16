export class SKDie extends Die {
	constructor(termData) {
    termData.faces = termData.faces || 4;
		super(termData);
	}

  static DIE_STEPS = {
    '0': {decrease: 0, faces: 0, increase: 2},
    '2': {decrease: 2, faces: 2, increase: 4},
    '4': {decrease: 2, faces: 4, increase: 6},
    '6': {decrease: 4, faces: 6, increase: 8},
    '8': {decrease: 6, faces: 8, increase: 10},
    '10': {decrease: 8, faces: 10, increase: 12},
    '12': {decrease: 10, faces: 12, increase: 20},
    '20': {decrease: 12, faces: 20, increase: 20},
  }

  /**
   * Explode the Die, rolling additional results for any values which match the target set.
   * If no target number is specified, explode the highest possible result.
   * Explosion can be a "small explode" using a lower-case x or a "big explode" using an upper-case "X"
   *
   * @param {string} modifier     The matched modifier query
   * @param {boolean} recursive   Explode recursively, such that new rolls can also explode?
   */
   explode(modifier, {recursive=true}={}) {

    // Match the explode or "explode once" modifier
    const rgx = /xo?([0-9]+)?([<>=]+)?([0-9]+)?/i;
    const match = modifier.match(rgx);
    if ( !match ) return false;
    let [max, comparison, target] = match.slice(1);

    // If no comparison or target are provided, treat the max as the target
    if ( max && !(target || comparison) ) {
      target = max;
      max = null;
    }

    // Determine target values
    target = Number.isNumeric(target) ? parseInt(target) : this.faces;
    comparison = comparison || "=";
    max = Number.isNumeric(max) ? parseInt(max) : null;

    // Recursively explode until there are no remaining results to explode
    let checked = 0;
    let initial = this.results.length;
    while ( checked < this.results.length ) {
      let r = this.results[checked];
      r.faces = this.faces;
      checked++;
      if (!r.active) continue;

      // Maybe we have run out of explosions
      if ( (max !== null) && (max <= 0) ) break;

      // Determine whether to explode the result and roll again!
      if ( DiceTerm.compareResult(r.result, comparison, target) ) {
        r.exploded = true;
        this.faces = SKDie.DIE_STEPS[this.faces].increase;
        target = this.faces;
        this.roll();

        if ( max !== null ) max -= 1;
      }

      // Limit recursion
      if ( !recursive && (checked >= initial) ) checked = this.results.length;
      if ( checked > 1000 ) throw new Error("Maximum recursion depth for exploding dice roll exceeded");
    }
  }

  /**
   * Get the CSS classes that should be used to display each rolled result
   * @param {DiceTermResult} result     The rolled result
   * @return {string[]}                 The desired classes
   */
  getResultCSS(result) {
    const hasSuccess = result.success !== undefined;
    const hasFailure = result.failure !== undefined;
    const isMax = result.result === this.faces;
    const isMin = result.result === 1;
    return [
      this.constructor.name.toLowerCase(),
      "d" + (result.faces ?? this.faces),
      result.success ? "success" : null,
      result.failure ? "failure" : null,
      result.rerolled ? "rerolled" : null,
      result.exploded ? "exploded" : null,
      result.discarded ? "discarded" : null,
      !(hasSuccess || hasFailure) && isMin ? "min" : null,
      !(hasSuccess || hasFailure) && isMax ? "max" : null
    ]
  }
}