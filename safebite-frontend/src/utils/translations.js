export const translations = {
    en: {
        analysisReport: "Analysis Report",
        safeToEat: "SAFE TO EAT",
        moderateRisk: "MODERATE RISK",
        dangerous: "DANGEROUS",
        unknown: "UNKNOWN",
        childWarning: "⚠️ Not recommended for children below 12",
        uglyTruth: "The Ugly Truth",
        toxins: "Toxins",
        whyBad: "Why it's bad:",
        freqCons: "💡 Frequent consumption may increase long-term health risk.",
        saferOptions: "Switch to Safer Options",
        safeChoice: "Safe Choice",
        legalAlt: "*Alternatives are suggestions, not endorsements. Verify ingredients before consumption.",
        legalFooter: "*SafeBite analysis is based on scientific data but does not replace medical advice. Always consult a doctor.",
        iAteThis: "I Ate This",
        addedLog: "Added to Log",
        
        // Medical Terms
        'Diabetes Risk': 'Diabetes Risk',
        'Heart Disease Risk': 'Heart Disease Risk',
        'High Cholesterol Risk': 'High Cholesterol Risk',
        'Hypertension Risk': 'High BP Risk',
        'Kidney Issue Risk': 'Kidney Risk',
        'ALLERGY ALERT': 'ALLERGY ALERT',
        'Child Hazard': 'Unsafe for Kids'
    },
    hi: {
        analysisReport: "विश्लेषण रिपोर्ट",
        safeToEat: "खाने के लिए सुरक्षित",
        moderateRisk: "मध्यम जोखिम",
        dangerous: "खतरनाक (DANGEROUS)",
        unknown: "अज्ञात",
        childWarning: "⚠️ 12 वर्ष से कम उम्र के बच्चों के लिए अनुशंसित नहीं",
        uglyTruth: "कड़वा सच (The Ugly Truth)",
        toxins: "विषाक्त पदार्थ",
        whyBad: "यह बुरा क्यों है:",
        freqCons: "💡 लगातार सेवन से दीर्घकालिक स्वास्थ्य जोखिम बढ़ सकता है।",
        saferOptions: "सुरक्षित विकल्प चुनें",
        safeChoice: "सुरक्षित विकल्प",
        legalAlt: "*विकल्प केवल सुझाव हैं। सेवन से पहले सामग्री की जाँच करें।",
        legalFooter: "*SafeBite विश्लेषण वैज्ञानिक डेटा पर आधारित है लेकिन यह डॉक्टरी सलाह की जगह नहीं लेता।",
        iAteThis: "मैंने इसे खाया",
        addedLog: "लॉग में जोड़ा गया",

        // Medical Terms (Hindi)
        'Diabetes Risk': 'मधुमेह (Sugar) का खतरा',
        'Heart Disease Risk': 'हृदय रोग का खतरा',
        'High Cholesterol Risk': 'कोलेस्ट्रॉल का खतरा',
        'Hypertension Risk': 'हाई बीपी का खतरा',
        'Kidney Issue Risk': 'गुर्दे (Kidney) का खतरा',
        'ALLERGY ALERT': 'एलर्जी चेतावनी ⚠️',
        'Child Hazard': 'बच्चों के लिए असुरक्षित'
    }
};

// Helper function to translate dynamic risk categories
export const translateRisk = (category, lang) => {
    if (lang === 'en') return category;
    
    // Check known categories
    const map = {
        'Diabetes Risk': 'मधुमेह (Sugar) का खतरा',
        'Heart Disease Risk': 'हृदय रोग का खतरा',
        'High Cholesterol Risk': 'कोलेस्ट्रॉल का खतरा',
        'Hypertension Risk': 'हाई बीपी का खतरा',
        'Kidney Issue Risk': 'गुर्दे (Kidney) का खतरा',
        'ALLERGY ALERT': 'एलर्जी चेतावनी ⚠️',
        'Child Hazard': 'बच्चों के लिए असुरक्षित'
    };

    return map[category] || category; // Return original if translation not found
};