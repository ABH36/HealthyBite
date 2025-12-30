const Ingredient = require('../models/Ingredient');

// 🩺 MEDICAL RULE BOOK (Existing)
const conditionRules = {
    'Diabetes': ['sugar', 'glucose', 'fructose', 'sucrose', 'corn syrup', 'maltodextrin', 'dextrose', 'honey', 'jaggery', 'added sugar'],
    'Hypertension': ['salt', 'sodium', 'baking soda', 'monosodium glutamate', 'msg'],
    'Heart Disease': ['palm oil', 'palmolein', 'hydrogenated', 'trans fat', 'margarine', 'butter', 'ghee'],
    'High Cholesterol': ['palm oil', 'palmolein', 'red meat', 'butter', 'cheese', 'ghee'],
    'Kidney Issue': ['salt', 'sodium', 'potassium', 'protein isolate']
};

// ☠️ ALLERGEN SYNONYMS (Existing)
const allergenMap = {
  'peanuts': ['peanut','groundnut','arachis'],
  'milk': ['milk','dairy','lactose','whey','casein', 'cream', 'butter'],
  'gluten': ['wheat','maida','barley','rye','malt', 'atta', 'semolina', 'rava'],
  'soy': ['soy','soya','soybean', 'tofu', 'lecithin'],
  'shellfish': ['shrimp','prawn','crab','lobster', 'clam', 'mussel'],
  'dairy': ['milk','dairy','lactose','whey','casein', 'cream', 'butter']
};

// 👶 CHILD ZERO TOLERANCE LIST (New)
// Ye cheezein bacchon ke liye STRICTLY mana hain
const childStrictRules = ['caffeine', 'alcohol', 'energy drink', 'saccharin', 'aspartame', 'coffee', 'espresso'];

const calculateRisk = async (ingredientsList, userProfile = null) => {
    if (!ingredientsList || ingredientsList.length === 0) {
        return { status: "GREEN", totalRiskScore: 0, isChildSafe: true, harmfulIngredients: [], harmfulCount: 0 };
    }

    const productIngredients = ingredientsList.map(item => item.toLowerCase().trim());
    const allHarmful = await Ingredient.find({});

    let totalRiskScore = 0;
    let isChildSafe = true;
    const flaggedIngredients = [];

    let personalizedRiskFound = false;
    let allergenFound = false;
    let childDangerFound = false; // 👶 New Flag

    // --- 1. PERSONALIZED CHECKS ---
    if (userProfile && userProfile.healthProfile) {
        const { conditions, allergens, age } = userProfile.healthProfile;

        productIngredients.forEach(ing => {
            // A. ALLERGY CHECK
            if (allergens && allergens.length > 0) {
                allergens.forEach(allergen => {
                    const keywords = allergenMap[allergen.toLowerCase()] || [allergen.toLowerCase()];
                    if (keywords.some(w => ing.includes(w))) {
                        flaggedIngredients.push({
                            name: ing,
                            riskCategory: "ALLERGY ALERT",
                            riskLevel: 100,
                            description: `⚠️ Contains ${allergen}. Deadly for you!`,
                            childUnsafe: true,
                            isPersonalized: true
                        });
                        totalRiskScore += 100;
                        allergenFound = true;
                    }
                });
            }

            // B. DISEASE CONDITION CHECK
            if (conditions && conditions.length > 0) {
                conditions.forEach(cond => {
                    const badWords = conditionRules[cond] || [];
                    badWords.forEach(bad => {
                        if (ing.includes(bad)) {
                            if (!flaggedIngredients.find(f => f.name === ing && f.riskCategory === cond)) {
                                flaggedIngredients.push({
                                    name: ing,
                                    riskCategory: `${cond} Risk`,
                                    riskLevel: 10,
                                    description: `Contains ${bad}, harmful for ${cond}.`,
                                    childUnsafe: false,
                                    isPersonalized: true
                                });
                                totalRiskScore += 10;
                                personalizedRiskFound = true;
                            }
                        }
                    });
                });
            }

            // C. 👶 CHILD MODE (Age < 12)
            if (age && age < 12) {
                // Check Strict Rules (Caffeine etc.)
                if (childStrictRules.some(rule => ing.includes(rule))) {
                    flaggedIngredients.push({
                        name: ing,
                        riskCategory: "Child Hazard",
                        riskLevel: 20, // High Penalty
                        description: `Contains ${ing}, unsafe for children.`,
                        childUnsafe: true,
                        isPersonalized: true
                    });
                    childDangerFound = true;
                    totalRiskScore += 20;
                }
            }
        });
    }

    // --- 2. STANDARD DB CHECK ---
    productIngredients.forEach(prodIng => {
        const foundPoison = allHarmful.find(dbPoison => {
            if (prodIng === dbPoison.name) return true;
            if (dbPoison.aliases.includes(prodIng)) return true;
            if (prodIng.includes(dbPoison.name)) return true;
            return dbPoison.aliases.some(alias => prodIng.includes(alias));
        });

        if (foundPoison) {
            const alreadyFlagged = flaggedIngredients.find(i => i.name === foundPoison.name);
            if (!alreadyFlagged) {
                totalRiskScore += foundPoison.riskLevel;
                
                // 👶 Check Child Safety from DB Flag
                if (foundPoison.childUnsafe) {
                    isChildSafe = false;
                    // Agar user baccha hai, to iska impact badha do
                    if (userProfile?.healthProfile?.age < 12) {
                        childDangerFound = true;
                        totalRiskScore += 10; // Extra penalty
                    }
                }

                flaggedIngredients.push({
                    name: foundPoison.name,
                    riskCategory: foundPoison.riskCategory,
                    riskLevel: foundPoison.riskLevel,
                    description: foundPoison.description,
                    childUnsafe: foundPoison.childUnsafe
                });
            }
        }
    });

    // --- 4. FINAL VERDICT (UPDATED) ---
    let status = "GREEN";
    
    // Priority 1: Immediate Danger (Allergy OR Child Hazard)
    if (allergenFound || childDangerFound) {
        status = "RED"; // 🚨 Force RED for Kids if hazard found
    } 
    else if (totalRiskScore >= 15) {
        status = "RED";
    } 
    else if (totalRiskScore >= 7 || personalizedRiskFound) {
        status = "YELLOW";
    }

    // Child Safe Boolean Update (For UI Banner)
    if (childDangerFound) isChildSafe = false;

    return {
        status,
        totalRiskScore: Math.min(totalRiskScore, 100),
        isChildSafe,
        harmfulIngredients: flaggedIngredients,
        harmfulCount: flaggedIngredients.length,
        totalIngredientsScanned: productIngredients.length
    };
};

module.exports = { calculateRisk };