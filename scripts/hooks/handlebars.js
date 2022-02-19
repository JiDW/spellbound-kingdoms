

function preloadHandlebarsTemplates() {
  const templatePaths = [
    // "systems/spellbound-kingdoms/templates/chat/item.hbs",
    "systems/spellbound-kingdoms/templates/character/character.hbs",
    "systems/spellbound-kingdoms/templates/character/tab-main.hbs",
    "systems/spellbound-kingdoms/templates/character/tab-combat.hbs",
    "systems/spellbound-kingdoms/templates/character/tab-inventory.hbs",
    "systems/spellbound-kingdoms/templates/character/tab-wealth.hbs",
    "systems/spellbound-kingdoms/templates/character/tab-magic.hbs",
    "systems/spellbound-kingdoms/templates/character/partial/narrative-item.hbs",
    "systems/spellbound-kingdoms/templates/character/partial/scar.hbs",
    "systems/spellbound-kingdoms/templates/character/partial/ability.hbs",
    "systems/spellbound-kingdoms/templates/character/partial/talent.hbs",
    "systems/spellbound-kingdoms/templates/character/partial/stat.hbs",

    "systems/spellbound-kingdoms/templates/items/inspiration.hbs",
    "systems/spellbound-kingdoms/templates/items/history.hbs",
    "systems/spellbound-kingdoms/templates/items/scar.hbs",
    
    "systems/spellbound-kingdoms/templates/components/roll-engine/dialog.hbs",
    "systems/spellbound-kingdoms/templates/components/roll-engine/partial/die-select.hbs",
    "systems/spellbound-kingdoms/templates/components/roll-engine/chat-card.hbs",
    "systems/spellbound-kingdoms/templates/components/roll-engine/chat-card-tooltip.hbs",

    "systems/spellbound-kingdoms/templates/components/dialog/item-picker.hbs",
    "systems/spellbound-kingdoms/templates/components/dialog/partial/item-picker-item.hbs",
  ];
  return loadTemplates(templatePaths);
}

function registerHandlebarsHelpers() {
  Handlebars.registerHelper("plaintextToHTML", function (value) {
    // strip tags, add <br/> tags
    return new Handlebars.SafeString(value.replace(/(<([^>]+)>)/gi, "").replace(/(?:\r\n|\r|\n)/g, "<br/>"));
  });
  Handlebars.registerHelper("toUpperCase", function (str) {
    return str.toUpperCase();
  });
  Handlebars.registerHelper("hasLocalization", function (str) {
    return game.i18n.has(str);
  });
  Handlebars.registerHelper("eq", function () {
    const args = Array.prototype.slice.call(arguments, 0, -1);
    return args.every(function (expression) {
      return args[0] === expression;
    });
  });
  Handlebars.registerHelper("or", function () {
    const args = Array.prototype.slice.call(arguments, 0, -1);
    return args.reduce((x, y) => x || y);
  });
  Handlebars.registerHelper("and", function () {
    const args = Array.prototype.slice.call(arguments, 0, -1);
    return args.reduce((x, y) => x && y);
  });
  Handlebars.registerHelper("not", function (boolValue) {
    return !boolValue;
  });
  Handlebars.registerHelper('sk_strconcat', function () {
      const args = Array.prototype.slice.call(arguments);
      args.pop(); // remove unrelated data
      return args.join("");
  });

  Handlebars.registerHelper('sk_enrich', function (content) {
      // Enrich the content
      content = TextEditor.enrichHTML(content, { entities: true });
      return new Handlebars.SafeString(content);
  });
}

export const initializeHandlebars = () => {
  registerHandlebarsHelpers();
  preloadHandlebarsTemplates();
};
