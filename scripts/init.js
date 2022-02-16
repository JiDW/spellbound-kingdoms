import { SpellboundKingdomsActor, SpellboundKingdomsItem } from "./actor/spellbound-kingdoms.js";
import { SKDie } from "./components/roll-engine/sk-die.js";
import { initializeHandlebars } from "./hooks/handlebars.js";
// import { migrateWorld } from "./hooks/migration.js";
import { registerSheets } from "./hooks/sheets.js";
import { loadSystemSettings, registerSettings } from "./hooks/system-settings.js";
import { SpellboundKingdomsActorSheet } from './sheets/actor.js';

// CONFIG.debug.hooks = true;

Hooks.once("init", () => {
  CONFIG.Actor.documentClass = SpellboundKingdomsActor;
  CONFIG.Item.documentClass = SpellboundKingdomsItem;
  CONFIG.Dice.terms["e"] = SKDie;
  // CONFIG.Dice.terms["d"] = SKDie;
  CONFIG.Dice.terms["2"] = SKDie;
  CONFIG.Dice.terms["4"] = SKDie;
  CONFIG.Dice.terms["6"] = SKDie;
  CONFIG.Dice.terms["8"] = SKDie;
  CONFIG.Dice.terms["10"] = SKDie;
  CONFIG.Dice.terms["12"] = SKDie;
  CONFIG.Dice.terms["20"] = SKDie;

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
