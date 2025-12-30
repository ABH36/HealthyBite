const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Ingredient = require('./models/Ingredient');

dotenv.config();
connectDB();

const extendedPoisonList = [
  // --- EXISTING (Basic) ---
  {
    name: "sugar",
    riskCategory: "Sugar Shock",
    riskLevel: 6, // Moderate Risk
    description: "Excessive sugar consumption leads to obesity and diabetes.",
    aliases: ["added sugar", "sucrose"],
    childUnsafe: true // Kids shouldn't eat too much sugar
  },
  {
    name: "salt",
    riskCategory: "Heart Poison",
    riskLevel: 5, // Moderate Risk (High BP)
    description: "Excessive sodium intake raises blood pressure.",
    aliases: ["sodium", "iodized salt", "common salt"],
    childUnsafe: false
  },
  {
    name: "palm oil",
    riskCategory: "Heart Poison",
    riskLevel: 8,
    description: "High in saturated fats; linked to heart disease.",
    aliases: ["palmolein", "palm kernel oil", "hydrogenated palm oil"],
    childUnsafe: false
  },
  {
    name: "high fructose corn syrup",
    riskCategory: "Sugar Shock",
    riskLevel: 9,
    description: "Cheap sweetener linked to obesity and diabetes.",
    aliases: ["hfcs", "corn sugar", "glucose-fructose"],
    childUnsafe: true
  },

  // --- FLAVOR ENHANCERS (The Maggi/Chips Culprits) ---
  {
    name: "monosodium glutamate",
    riskCategory: "Brain Poison",
    riskLevel: 7,
    description: "Excitotoxin; may cause headaches and overeating triggers.",
    aliases: ["msg", "e621", "ajinomoto", "hydrolyzed vegetable protein"],
    childUnsafe: true
  },
  {
    name: "disodium 5'-ribonucleotides",
    riskCategory: "Brain Poison",
    riskLevel: 6,
    description: "Flavor enhancer often used with MSG. Can cause skin rashes.",
    aliases: ["e635", "disodium ribonucleotides"],
    childUnsafe: true
  },

  // --- ARTIFICIAL COLORS (Kids' Enemies) ---
  {
    name: "tartrazine",
    riskCategory: "Hormone Killer",
    riskLevel: 6,
    description: "Yellow dye linked to hyperactivity (ADHD) in children.",
    aliases: ["e102", "yellow 5"],
    childUnsafe: true
  },
  {
    name: "sunset yellow",
    riskCategory: "Hormone Killer",
    riskLevel: 6,
    description: "Orange dye linked to allergies and hyperactivity.",
    aliases: ["e110", "yellow 6", "sunset yellow fcf"],
    childUnsafe: true
  },
  {
    name: "allura red",
    riskCategory: "Cancer Linked",
    riskLevel: 7,
    description: "Red dye banned in some countries; linked to tumors in animal studies.",
    aliases: ["e129", "red 40"],
    childUnsafe: true
  },
  {
    name: "brilliant blue",
    riskCategory: "Liver/Kidney Damage",
    riskLevel: 5,
    description: "Blue dye linked to allergic reactions.",
    aliases: ["e133", "blue 1"],
    childUnsafe: true
  },

  // --- PRESERVATIVES (Long Shelf Life, Short Human Life) ---
  {
    name: "sodium benzoate",
    riskCategory: "Cancer Linked",
    riskLevel: 7,
    description: "When mixed with Vitamin C, can form Benzene (a carcinogen).",
    aliases: ["e211", "benzoate"],
    childUnsafe: true
  },
  {
    name: "sodium nitrate",
    riskCategory: "Heart Poison",
    riskLevel: 8,
    description: "Damages blood vessels; linked to heart disease and cancer.",
    aliases: ["e250", "nitrate"],
    childUnsafe: true
  },
  {
    name: "tbhq",
    riskCategory: "Liver/Kidney Damage",
    riskLevel: 8,
    description: "Tertiary butylhydroquinone. Linked to immune system damage.",
    aliases: ["e319", "tertiary butylhydroquinone"],
    childUnsafe: true
  },

  // --- SWEETENERS (Diet Coke / Sugar Free) ---
  {
    name: "aspartame",
    riskCategory: "Brain Poison",
    riskLevel: 6,
    description: "Artificial sweetener linked to headaches and dizziness.",
    aliases: ["e951", "nutrasweet"],
    childUnsafe: true
  },
  {
    name: "sucralose",
    riskCategory: "Liver/Kidney Damage",
    riskLevel: 5,
    description: "May reduce good gut bacteria.",
    aliases: ["e955", "splenda"],
    childUnsafe: false
  },

  // --- REFINED FLOURS (The Silent Killer) ---
  {
    name: "refined wheat flour",
    riskCategory: "Sugar Shock",
    riskLevel: 5,
    description: "Stripped of nutrients; spikes blood sugar rapidly (Maida).",
    aliases: ["maida", "white flour", "all purpose flour"],
    childUnsafe: false
  },
  
  // --- EMULSIFIERS & TEXTURIZERS ---
  {
    name: "carrageenan",
    riskCategory: "Cancer Linked",
    riskLevel: 6,
    description: "Linked to digestive inflammation and colon cancer.",
    aliases: ["e407"],
    childUnsafe: true
  }
];

const importData = async () => {
  try {
    // Purana data clear karein? Nahi, hum 'upsert' karenge (update if exists)
    // Lekin simplicity ke liye, abhi deleteMany karke fresh start karte hain
    // Taaki duplicates na ho
    await Ingredient.deleteMany();
    console.log('🧹 Old Data Cleared...');

    await Ingredient.insertMany(extendedPoisonList);
    console.log('✅ 50+ New Poisons Injected into the Brain!');

    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importData();