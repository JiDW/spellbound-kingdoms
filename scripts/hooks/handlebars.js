

function preloadHandlebarsTemplates() {
  const templatePaths = [
    // "systems/spellbound-kingdoms/templates/chat/item.html",
    "systems/spellbound-kingdoms/templates/character/character.html",
    // "systems/spellbound-kingdoms/templates/starship.html",
    // "systems/spellbound-kingdoms/templates/weapon.html",
    // "systems/spellbound-kingdoms/templates/gear.html",
    // "systems/spellbound-kingdoms/templates/skill.html",
    // "systems/spellbound-kingdoms/templates/ability.html",
    // "systems/spellbound-kingdoms/templates/component.html",
    // "systems/spellbound-kingdoms/templates/weapon-component.html",
    // "systems/spellbound-kingdoms/templates/cargo.html",
    // "systems/spellbound-kingdoms/templates/tab/main.html",
    // "systems/spellbound-kingdoms/templates/tab/bio.html",
    // "systems/spellbound-kingdoms/templates/tab/starship-main.html",
    // "systems/spellbound-kingdoms/templates/tab/starship-control.html",
    // "systems/spellbound-kingdoms/templates/partial/item-picker.html",
    // "systems/spellbound-kingdoms/templates/partial/active-effect-list.html",
    // "systems/spellbound-kingdoms/templates/partial/crew-member.html",
    // "systems/spellbound-kingdoms/templates/partial/inventory-item.html",
    // "systems/spellbound-kingdoms/templates/partial/starship-role.html",
    // "systems/spellbound-kingdoms/templates/partial/component.html",
    // "systems/spellbound-kingdoms/templates/partial/skill.html",
    // "systems/spellbound-kingdoms/templates/partial/ability.html",
    // "systems/spellbound-kingdoms/templates/partial/character-creation/section.html",
    // "systems/spellbound-kingdoms/templates/partial/character-creation/list.html",
    // "systems/spellbound-kingdoms/templates/dialog/ap-per-skill.html",
    // "systems/spellbound-kingdoms/templates/chat/skill-challenge.html",
    // "systems/spellbound-kingdoms/templates/component/bh-combat-tracker.html",
    // "systems/spellbound-kingdoms/templates/component/character-creation.html",
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
