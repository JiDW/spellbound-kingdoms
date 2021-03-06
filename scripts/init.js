import { SpellboundKingdomsActor, SpellboundKingdomsItem } from "./actor/spellbound-kingdoms.js";
import { SkCombatTracker } from "./components/combat-tracker/sk-combat-tracker.js";
import { SkCombat } from "./components/combat-tracker/sk-combat.js";
import { SkCombatant } from "./components/combat-tracker/sk-combatant.js";
import { SkTokenDocument } from "./components/combat-tracker/sk-token-document.js";
import { SKRollHandler } from "./components/roll-engine/engine.js";
import { SKDie } from "./components/roll-engine/sk-die.js";
import { SKRoll } from "./components/roll-engine/sk-roll.js";
import { initializeHandlebars } from "./hooks/handlebars.js";
// import { migrateWorld } from "./hooks/migration.js";
import { registerSheets } from "./hooks/sheets.js";
import { loadSystemSettings, registerSettings } from "./hooks/system-settings.js";
import { SpellboundKingdomsActorSheet } from './sheets/actor-sheet.js';

// CONFIG.debug.hooks = true;

Hooks.once("init", () => {
    CONFIG.Actor.documentClass = SpellboundKingdomsActor;
    CONFIG.Item.documentClass = SpellboundKingdomsItem;
    CONFIG.Dice.terms["d"] = SKDie;

    CONFIG.Combat.documentClass = SkCombat;
    CONFIG.Combatant.documentClass = SkCombatant;
    CONFIG.ui.combat = SkCombatTracker;
    CONFIG.Token.documentClass = SkTokenDocument;

    CONFIG.Dice.rolls[0] = SKRoll;
    CONFIG.Dice.rolls[0].CHAT_TEMPLATE = 'systems/spellbound-kingdoms/templates/components/roll-engine/chat-card.hbs';
    CONFIG.Dice.rolls[0].TOOLTIP_TEMPLATE = 'systems/spellbound-kingdoms/templates/components/roll-engine/chat-card-tooltip.hbs';
    //   CONFIG.Dice.terms["2"] = SKDie;
    //   CONFIG.Dice.terms["4"] = SKDie;
    //   CONFIG.Dice.terms["6"] = SKDie;
    //   CONFIG.Dice.terms["8"] = SKDie;
    //   CONFIG.Dice.terms["10"] = SKDie;
    //   CONFIG.Dice.terms["12"] = SKDie;
    //   CONFIG.Dice.terms["20"] = SKDie;

    setupStatusEffects();

    registerSheets();
    initializeHandlebars();
    registerSettings();
});

function setupStatusEffects() {
    let coreEffects = [
        {
            id: "dead",
            label: "EFFECT.StatusDead",
            icon: "icons/svg/skull.svg"
        },
        {
            id: "unconscious",
            label: "EFFECT.StatusUnconscious",
            icon: "icons/svg/unconscious.svg"
        },
        {
            id: "rebalance",
            label: "EFFECT.StatusRebalance",
            icon: "icons/svg/falling.svg"
        },
        {
            id: 'disarm',
            label: 'EFFECT.StatusDisarm',
            icon: 'systems/spellbound-kingdoms/assets/images/icons/status-effects/drop-weapon.svg',
        },
        {
            id: 'increase-die',
            label: 'EFFECT.StatusIncreaseDie',
            icon: 'systems/spellbound-kingdoms/assets/images/icons/status-effects/perspective-dice-six-faces-random-green.svg',
        },
        {
            id: 'increase-die-long',
            label: 'EFFECT.StatusIncreaseDieLong',
            icon: 'systems/spellbound-kingdoms/assets/images/icons/status-effects/perspective-dice-six-faces-random-blue.svg',
        },
        {
            id: 'decrease-die',
            label: 'EFFECT.StatusDecreaseDie',
            icon: 'systems/spellbound-kingdoms/assets/images/icons/status-effects/perspective-dice-six-faces-random-red.svg',
        },
        {
            id: 'increase-defense-die',
            label: 'EFFECT.StatusIncreaseDefenseDie',
            icon: 'systems/spellbound-kingdoms/assets/images/icons/status-effects/dice-shield-green.svg',
        },
        {
            id: 'increase-defense-die-long',
            label: 'EFFECT.StatusIncreaseDefenseDieLong',
            icon: 'systems/spellbound-kingdoms/assets/images/icons/status-effects/dice-shield-blue.svg',
        },
        {
            id: 'decrease-defense-die',
            label: 'EFFECT.StatusDecreaseDefenseDie',
            icon: 'systems/spellbound-kingdoms/assets/images/icons/status-effects/dice-shield-red.svg',
        },
        {
            id: 'increase-damage',
            label: 'EFFECT.StatusIncreaseDamage',
            icon: 'systems/spellbound-kingdoms/assets/images/icons/status-effects/sparkling-sabre-green.svg',
        },
        {
            id: 'increase-damage-long',
            label: 'EFFECT.StatusIncreaseDamageLong',
            icon: 'systems/spellbound-kingdoms/assets/images/icons/status-effects/sparkling-sabre-blue.svg',
        },
    ];

    console.log(CONFIG.statusEffects);
    CONFIG.statusEffects = coreEffects.concat(CONFIG.statusEffects);
    console.log(CONFIG.statusEffects);
};

Hooks.once("ready", async () => {
    // migrateWorld();
    loadSystemSettings();
    window.TextEditor.activateListeners();

    $('body').on('click', '.help-popup-trigger', function (e) {
        const content = $(e.currentTarget).parent().find('.help-popup-content');
        content.toggle();
    });
    $('body').on('click', '.help-popup-content', function (e) {
        $(e.currentTarget).toggle();
    });
});

Hooks.on("updateCombat", async (app, html) => {
    console.log('UPDATE COMBAT');

    let token;
    if (app.current.round !== app.previous.round) {
        for (let turn of app.turns) {
            token = canvas.tokens.get(turn.data.tokenId);
            token.actor.update({'data.locked-in-maneuver.id': ''});
        }
    }
});

Hooks.on("renderChatMessage", async (app, html) => {
    const postedItem = html.find(".chat-item")[0];
    if (postedItem) {
        postedItem.classList.add("draggable");
        postedItem.setAttribute("draggable", true);
        postedItem.addEventListener("dragstart", (ev) => {
            ev.dataTransfer.setData(
                "text/plain",
                JSON.stringify({
                    item: app.getFlag("spellbound-kingdoms", "itemData"),
                    type: "itemDrop",
                }),
            );
        });
    }

    const skButtons = html.find(".sk-button");
    if (skButtons.length > 0) {
        for (const skButton of skButtons) {
            skButton.addEventListener("click", async (e) => {
                let removeButton = false;
                let action = $(e.target).data('action');
                switch (action) {
                    case 'mood':
                        if (app.roll.moodable) {
                            await SKRollHandler.moodRoll(app);
                            removeButton = true;
                        }
                        break;
                    case 'weak-inspiration':
                        if (app.roll.inspirable) {
                            await SKRollHandler.weakInspireRoll(app);
                            removeButton = true;
                        }
                        break;
                    case 'strong-inspiration':
                        if (app.roll.moodable) {
                            await SKRollHandler.strongInspireRoll(app);
                            removeButton = true;
                        }
                        break;
                }

                if (removeButton) {
                    // If the roll is modified, we want to remove the button.
                    if (game.modules.get("dice-so-nice").active)
                        Hooks.once("diceSoNiceRollComplete", () => {
                            app.delete();
                        });
                    else app.delete();
                }
            });
        };
    }

    const tokenLinks = html.find('.token-link');
    if (tokenLinks.length > 0) {
        for (const tokenLink of tokenLinks) {
            tokenLink.addEventListener("click", async (e) => {
                let tokenId = e.currentTarget.dataset["tokenId"]
                let token = canvas.tokens.get(tokenId)
                canvas.animatePan({x: token.x, y: token.y, duration: 100});
            });
        }
    }
    const maneuverRolls = html.find('.maneuver-roll');
    if (maneuverRolls.length > 0) {
        for (const maneuverRoll of maneuverRolls) {
            maneuverRoll.addEventListener("click", async (e) => {
                const rollData = e.currentTarget.dataset;
                const actor = canvas.tokens.get(
                    $(e.currentTarget).closest('.locked-in-maneuver').data('token-id')
                ).document?.actor;

                const data = {
                    title: rollData.title,
                    base: {
                        label: rollData.label,
                        value: Number.isNumeric(rollData.value) 
                            ? rollData.value 
                            : (actor.data.data.stats[rollData.value] ? actor.data.data.stats[rollData.value].value : 4),
                    },
                };
                return SKRollHandler.createRoll(data, {}/*options*/);
            });
        }
    }
});
