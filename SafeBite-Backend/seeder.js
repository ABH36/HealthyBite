const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Ingredient = require('./models/Ingredient');

dotenv.config();
connectDB();

const harmfulIngredients = [
  {
    name: "high fructose corn syrup",
    riskCategory: "Sugar Shock",
    riskLevel: 9,
    description: "Cheap sweetener linked to obesity, insulin resistance, and diabetes.",
    aliases: ["hfcs", "glucose-fructose syrup", "corn sugar"],
    childUnsafe: true // ⚠️ Bad for kids
  },
  {
    name: "palm oil",
    riskCategory: "Heart Poison",
    riskLevel: 8,
    description: "High in saturated fats; linked to increased cholesterol and heart disease risk.",
    aliases: ["palmolein", "palm kernel oil"],
    childUnsafe: false
  },
  {
    name: "monosodium glutamate",
    riskCategory: "Brain Poison",
    riskLevel: 7,
    description: "Excitotoxin that can overstimulate brain cells. May cause headaches/migraines.",
    aliases: ["msg", "e621", "yeast extract", "hydrolyzed soy protein"],
    childUnsafe: true // ⚠️ Bad for kids
  },
  {
    name: "aspartame",
    riskCategory: "Cancer Linked",
    riskLevel: 6,
    description: "Artificial sweetener. Some studies suggest links to cancer and neurological issues.",
    aliases: ["e951", "nutrasweet", "equal"],
    childUnsafe: true
  },
  {
    name: "tartrazine",
    riskCategory: "Hormone Killer",
    riskLevel: 6,
    description: "Artificial yellow food dye. Linked to hyperactivity in children and allergies.",
    aliases: ["e102", "yellow 5"],
    childUnsafe: true // ⚠️ Highly unsafe for kids (Hyperactivity)
  },
  {
    name: "trans fat",
    riskCategory: "Heart Poison",
    riskLevel: 10,
    description: "The worst type of fat. Increases bad cholesterol and risk of heart attacks.",
    aliases: ["partially hydrogenated oil", "hydrogenated vegetable oil", "shortening"],
    childUnsafe: true
  }
];

const importData = async () => {
  try {
    await Ingredient.deleteMany(); // Purana data clear karega
    await Ingredient.insertMany(harmfulIngredients); // Naya data (with childUnsafe) daalega

    console.log('✅ Data Imported Successfully with Child Safety Flags!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importData();