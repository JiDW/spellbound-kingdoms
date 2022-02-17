import { SpellboundKingdomsActor, SpellboundKingdomsItem } from "./actor/spellbound-kingdoms.js";
import { SKDie } from "./components/roll-engine/sk-die.js";
import { SKRoll } from "./components/roll-engine/sk-roll.js";
import { initializeHandlebars } from "./hooks/handlebars.js";
// import { migrateWorld } from "./hooks/migration.js";
import { registerSheets } from "./hooks/sheets.js";
import { loadSystemSettings, registerSettings } from "./hooks/system-settings.js";
import { SpellboundKingdomsActorSheet } from './sheets/actor.js';

// CONFIG.debug.hooks = true;

Hooks.once("init", () => {
  CONFIG.Actor.documentClass = SpellboundKingdomsActor;
  CONFIG.Item.documentClass = SpellboundKingdomsItem;
  CONFIG.Dice.terms["d"] = SKDie;
  
  CONFIG.Dice.rolls[0] = SKRoll;
  CONFIG.Dice.rolls[0].CHAT_TEMPLATE = 'systems/spellbound-kingdoms/templates/components/roll-engine/chat-card.hbs';
  CONFIG.Dice.rolls[0].TOOLTIP_TEMPLATE = 'systems/spellbound-kingdoms/templates/components/roll-engine/chat-card-tooltip.hbs';
  // CONFIG.Dice.terms["2"] = SKDie;
  // CONFIG.Dice.terms["4"] = SKDie;
  // CONFIG.Dice.terms["6"] = SKDie;
  // CONFIG.Dice.terms["8"] = SKDie;
  // CONFIG.Dice.terms["10"] = SKDie;
  // CONFIG.Dice.terms["12"] = SKDie;
  // CONFIG.Dice.terms["20"] = SKDie;

  registerSheets();
  initializeHandlebars();
  registerSettings();
});

Hooks.once("ready", async () => {
  // migrateWorld();
  loadSystemSettings();
  window.TextEditor.activateListeners();
  SpellboundKingdomsActorSheet.setupSocketListeners();
  
  $('body').on('click', '.help-popup-trigger', function(e) {
    const content = $(e.currentTarget).parent().find('.help-popup-content');
    content.toggle();
  });
  $('body').on('click', '.help-popup-content', function(e) {
    $(e.currentTarget).toggle();
  });
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

	const skButton = html.find(".sk-button");
	if (skButton) {
		skButton.addEventListener("click", async (e) => {
      if ($(e.eventTarget).data('action')) {

      }
			if (app.roll.moodable) {
				await FBLRollHandler.moodRoll(app);

				// If the roll is mooded, we want to remove the button.
				if (game.modules.get("dice-so-nice").active)
					Hooks.once("diceSoNiceRollComplete", () => {
						app.delete();
					});
				else app.delete();
			}
		});
	}
});