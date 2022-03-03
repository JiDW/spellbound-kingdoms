// import { CharacterCreation } from "../component/character-creation.js";
import { mergeDeep, dirname } from "../util.js";

export async function loadSystemSettings() {
  CONFIG.SpellboundKingdoms = await loadDatasets();
  CONFIG.SpellboundKingdoms.loadSpells = loadSpells;
  console.log(CONFIG.SpellboundKingdoms);
}

async function loadDatasets() {
  const datasetDir = game.settings.get("spellbound-kingdoms", "datasetDir");
  return loadJson(datasetDir, '/index.json');
}

async function loadJson(sourceDir, relativePath, depth = 1) {
  if (relativePath.substring(relativePath.length - 5) !== '.json') {
    throw `Load JSON Error! Given path is not a JSON: ${relativePath}`
  }
  if (depth > 20) {
    throw `Load JSON Error! Infinite recursion detected. Please make sure that your datasets don't have circular references.`
  }

  const absolutePath = sourceDir + relativePath;
  const resp = await fetch(absolutePath).catch(err => { return {} });
  let index = await resp.json();

  let data, dataset = {};
  for (const [datasetName, value] of Object.entries(index)) {
    if (typeof value === 'string' && value.substring(value.length - 5) === '.json') {
      data = await loadJson(dirname(absolutePath), value, depth + 1);
    } else {
      data = value;
    }

    dataset[datasetName] = data;
	}

  return dataset;
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


async function loadSpells() {    
    const path = 'systems/spellbound-kingdoms/assets/datasets/load/load_spells.json';
    const resp = await fetch(path).catch(err => { return {} });
    let spellsBySchool = await resp.json();

    const spellFolder = await Folder.create({
        name: "Spells",
        type: 'Item',
        parent: null,
    });

    for (let [school, spells] of Object.entries(spellsBySchool)) {
        const schoolFolder = await Folder.create({
            name: school,
            type: 'Item',
            parent: spellFolder.id,
        });
        spells = spells.map(spell => {
            spell.folder = schoolFolder.id;
            spell.type = 'spell';
            return spell;
        });
        Item.createDocuments(spells);
    }
}