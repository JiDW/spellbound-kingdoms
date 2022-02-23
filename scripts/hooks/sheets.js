import { SpellboundKingdomsCharacterSheet } from "../sheets/character-sheet.js";
import { SpellboundKingdomsInspirationSheet } from "../sheets/inspiration-sheet.js";
import { SpellboundKingdomsHistorySheet } from "../sheets/history-sheet.js";
import { SpellboundKingdomsScarSheet } from "../sheets/scar-sheet.js";
import { SpellboundKingdomsTalentSheet } from "../sheets/talent-sheet.js";
import { SpellboundKingdomsAbilitySheet } from "../sheets/ability-sheet.js";
import { SpellboundKingdomsGearSheet } from "../sheets/gear-sheet.js";
import { SpellboundKingdomsWealthSlotCooldownSheet } from "../sheets/wealth-slot-cooldown-sheet.js";

export function registerSheets() {
    Actors.unregisterSheet("core", ActorSheet);
    Actors.registerSheet("spellbound-kingdoms", SpellboundKingdomsCharacterSheet, { types: ["character"], makeDefault: true });

    Items.unregisterSheet("core", ItemSheet);
    Items.registerSheet("spellbound-kingdoms", SpellboundKingdomsInspirationSheet, { types: ["inspiration"], makeDefault: true });
    Items.registerSheet("spellbound-kingdoms", SpellboundKingdomsHistorySheet, { types: ["history"], makeDefault: true });
    Items.registerSheet("spellbound-kingdoms", SpellboundKingdomsScarSheet, { types: ["scar"], makeDefault: true });
    Items.registerSheet("spellbound-kingdoms", SpellboundKingdomsTalentSheet, { types: ["talent"], makeDefault: true });
    Items.registerSheet("spellbound-kingdoms", SpellboundKingdomsAbilitySheet, { types: ["ability"], makeDefault: true });
    Items.registerSheet("spellbound-kingdoms", SpellboundKingdomsGearSheet, { types: ["gear"], makeDefault: true });
    Items.registerSheet("spellbound-kingdoms", SpellboundKingdomsWealthSlotCooldownSheet, { types: ["wealth-slot-cooldown"], makeDefault: true });
}
