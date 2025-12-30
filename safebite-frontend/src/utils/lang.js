export const getLanguage = () => {
    return localStorage.getItem('safeBite_lang') || 'en';
};

export const setLanguage = (lang) => {
    localStorage.setItem('safeBite_lang', lang);
    window.location.reload(); // Simple reload to apply changes globally
};