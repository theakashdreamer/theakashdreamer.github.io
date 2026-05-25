const data = require('./tmp_websiteData.js');

function getL10n(selectedLanguage) {
  const websiteData = data;
  const translation = websiteData.translations && websiteData.translations[selectedLanguage];
  if (!translation) return websiteData;

  return {
    ...websiteData,
    ...translation,
    brand: { ...websiteData.brand, ...translation.brand },
    menu: translation.menu || websiteData.menu,
    hero: { ...websiteData.hero, ...translation.hero },
    about: { ...websiteData.about, ...translation.about },
    services: { ...websiteData.services, ...translation.services },
    helpline: { ...websiteData.helpline, ...translation.helpline },
    team: { ...websiteData.team, ...translation.team },
    contactSection: { ...websiteData.contactSection, ...translation.contactSection },
    footer: { ...translation.footer },
    localeLabels: { ...websiteData.localeLabels, ...translation.localeLabels },
    formValidation: { ...websiteData.formValidation, ...translation.formValidation }
  };
}

const languages = ['hi','en','te','kn','ml','brx'];
for (const lang of languages) {
  const merged = getL10n(lang);
  console.log(`${lang}: title ->`, merged.brand && merged.brand.title);
  console.log(`${lang}: helpline button text ->`, (merged.helpline && merged.helpline.buttons && merged.helpline.buttons[0] && merged.helpline.buttons[0].text) || 'N/A');
}
