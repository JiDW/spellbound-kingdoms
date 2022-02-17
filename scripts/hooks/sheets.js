import { SpellboundKingdomsCharacterSheet } from "../sheets/character-sheet.js";
import { SpellboundKingdomsInspirationSheet } from "../sheets/inspiration-sheet.js";
import { SpellboundKingdomsHistorySheet } from "../sheets/history-sheet.js";
import { SpellboundKingdomsScarSheet } from "../sheets/scar-sheet.js";
// import { SpellboundKingdomsWeaponSheet } from "../sheets/weapon.js";
// import { SpellboundKingdomsGearSheet } from "../sheets/gear.js";
// import { SpellboundKingdomsSkillSheet } from "../sheets/skill.js";
// import { SpellboundKingdomsAbilitySheet } from "../sheets/ability.js";
// import { SpellboundKingdomsComponentSheet } from "../sheets/component.js";
// import { SpellboundKingdomsWeaponComponentSheet } from "../sheets/weapon-component.js";
// import { SpellboundKingdomsCargoSheet } from "../sheets/cargo.js";

export function registerSheets() {
  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("spellbound-kingdoms", SpellboundKingdomsCharacterSheet, { types: ["character"], makeDefault: true });
  // Actors.registerSheet("spellbound-kingdoms", SpellboundKingdomsStarshipSheet, { types: ["starship"], makeDefault: true });
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("spellbound-kingdoms", SpellboundKingdomsInspirationSheet, { types: ["inspiration"], makeDefault: true });
  Items.registerSheet("spellbound-kingdoms", SpellboundKingdomsHistorySheet, { types: ["history"], makeDefault: true });
  Items.registerSheet("spellbound-kingdoms", SpellboundKingdomsScarSheet, { types: ["scar"], makeDefault: true });
  // Items.registerSheet("spellbound-kingdoms", SpellboundKingdomsWeaponSheet, { types: ["weapon"], makeDefault: true });
  // Items.registerSheet("spellbound-kingdoms", SpellboundKingdomsGearSheet, { types: ["gear"], makeDefault: true });
  // Items.registerSheet("spellbound-kingdoms", SpellboundKingdomsSkillSheet, { types: ["skill"], makeDefault: true });
  // Items.registerSheet("spellbound-kingdoms", SpellboundKingdomsAbilitySheet, { types: ["ability"], makeDefault: true });
  // Items.registerSheet("spellbound-kingdoms", SpellboundKingdomsComponentSheet, { types: ["component"], makeDefault: true });
  // Items.registerSheet("spellbound-kingdoms", SpellboundKingdomsWeaponComponentSheet, { types: ["weapon-component"], makeDefault: true });
  // Items.registerSheet("spellbound-kingdoms", SpellboundKingdomsCargoSheet, { types: ["cargo"], makeDefault: true });
}
