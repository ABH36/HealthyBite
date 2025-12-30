const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const Product = require('./models/Product');

dotenv.config();
connectDB();

const safeProducts = [
  // 1. Alternative for Maggi (Noodles)
  {
    barcode: "SAFE001", // Fake Barcode for internal match
    name: "Whole Wheat Oats Noodles",
    brand: "HealthFarm",
    image: "https://m.media-amazon.com/images/I/81+M-6-xXSL.jpg", // Generic healthy image
    category: "Instant noodles", // Matches OpenFoodFacts category
    ingredients: ["Whole Wheat Flour", "Oats Flour", "Mild Spices", "Bran Oil"],
    analysis: {
      status: "GREEN",
      totalRiskScore: 0,
      harmfulIngredients: [],
      isChildSafe: true,
      cachedAt: new Date()
    }
  },
  
  // 2. Alternative for Lays (Chips)
  {
    barcode: "SAFE002",
    name: "Baked Ragi Chips",
    brand: "SoulFull",
    image: "https://m.media-amazon.com/images/I/61k8w-rX-lL.jpg",
    category: "Chips and fries", // Matches OpenFoodFacts category
    ingredients: ["Ragi", "Rice Bran Oil", "Natural Herbs", "Sea Salt"],
    analysis: {
      status: "GREEN",
      totalRiskScore: 2, // Very low risk
      harmfulIngredients: [],
      isChildSafe: true,
      cachedAt: new Date()
    }
  },

  // 3. Alternative for Coke/Pepsi (Beverages)
  {
    barcode: "SAFE003",
    name: "Natural Coconut Water",
    brand: "RawPressery",
    image: "https://m.media-amazon.com/images/I/41D17qQl-IL._SX300_SY300_QL70_FMwebp_.jpg",
    category: "Beverages",
    ingredients: ["100% Tender Coconut Water"],
    analysis: {
      status: "GREEN",
      totalRiskScore: 0,
      harmfulIngredients: [],
      isChildSafe: true,
      cachedAt: new Date()
    }
  }
];

const importSafeData = async () => {
  try {
    // Hum purane products delete nahi karenge, bas naye safe add karenge
    // Check if they exist first to avoid duplicates
    for (const product of safeProducts) {
        const exists = await Product.findOne({ barcode: product.barcode });
        if (!exists) {
            await Product.create(product);
            console.log(`✅ Added Safe Alternative: ${product.name}`);
        } else {
            console.log(`⚠️ Already Exists: ${product.name}`);
        }
    }
    
    console.log('🎉 Safe Alternatives Injection Complete!');
    process.exit();
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }
};

importSafeData();