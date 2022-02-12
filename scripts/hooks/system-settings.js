// import { CharacterCreation } from "../component/character-creation.js";

export async function loadSystemSettings() {
  CONFIG.SpellboundKingdoms = loadDatasets();
}

async function loadDatasets() {
  let datasets = {};
  
  datasets['races'] = loadRaces();
  datasets['classes'] = loadClasses();
  datasets['fighting-styles'] = loadFightingStyles();

  return datasets;
}

async function loadRaces() {
  return {};
  // const datasetDir = game.settings.get("spellbound-kingdoms", "datasetDir");
  // const resp = await fetch(datasetDir + '/reputation.json').catch(err => { return {} });
  // return resp.json();
}

async function loadClasses() {
  return {};
  // const datasetDir = game.settings.get("spellbound-kingdoms", "datasetDir");
  // const resp = await fetch(datasetDir + '/starship-roles.json').catch(err => { return {} });
  // return resp.json();
}

async function loadFightingStyles() {
  return {};
  // const datasetDir = game.settings.get("spellbound-kingdoms", "datasetDir");
  // const resp = await fetch(datasetDir + '/character-creation.json').catch(err => { return {} });
  // return resp.json();
}

export function registerSettings() {
  game.settings.register("spellbound-kingdoms", "worldSchemaVersion", {
    name: game.i18n.localize("SK.SETTINGS.WORLD_VERSION"),
    hint: game.i18n.localize("SK.SETTINGS.WORLD_VERSION_HINT"),
    scope: "world",
    config: false,
    default: 0,
    type: Number,
  });
  game.settings.register("spellbound-kingdoms", "datasetDir", {
    name: game.i18n.localize("SK.SETTINGS.DATASET_DIR"),
    hint: game.i18n.localize("SK.SETTINGS.DATASET_DIR_HINT"),
    scope: "world",
    config: true,
    default: "systems/spellbound-kingdoms/assets/datasets",
    type: String
  });
  game.settings.register("spellbound-kingdoms", "loadModuleDatasets", {
    name: game.i18n.localize("SK.SETTINGS.LOAD_MODULE_DATASETS"),
    hint: game.i18n.localize("SK.SETTINGS.LOAD_MODULE_DATASETS_HINT"),
    scope: "world",
    config: true,
    default: true,
    type: Boolean
  });
  game.settings.register("spellbound-kingdoms", "moduleDatasetDirs", {
    name: game.i18n.localize("SK.SETTINGS.MODULE_DATASET_DIRS"),
    hint: game.i18n.localize("SK.SETTINGS.MODULE_DATASET_DIRS_HINT"),
    scope: "world",
    config: false,
    default: [],
    type: Number,
  });
}