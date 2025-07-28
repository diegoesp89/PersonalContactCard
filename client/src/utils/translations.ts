export type Language = 'es' | 'en' | 'pt';

export const translations = {
  es: {
    // Contact info labels
    phone: 'Teléfono',
    email: 'Correo Electrónico',
    whatsapp: 'WhatsApp',
    website: 'Sitio Web',
    officeAddress: 'Dirección de Oficina',
    
    // Social media labels
    instagram: 'Instagram',
    tiktok: 'TikTok',
    linkedin: 'LinkedIn',
    telegram: 'Telegram',
    youtube: 'YouTube',
    facebook: 'Facebook',
    
    // Banking labels
    bankingInfo: 'Información Bancaria',
    bankName: 'Banco',
    accountNumber: 'Número de Cuenta',
    accountType: 'Tipo de Cuenta',
    accountHolder: 'Titular de la Cuenta',
    
    // Action buttons
    saveContact: 'Guardar Contacto',
    shareContact: 'Compartir',
    translate: 'Traducir',
    call: 'Llamar',
    sendEmail: 'Enviar Email',
    sendMessage: 'Enviar Mensaje',
    visit: 'Visitar',
    
    // Share modal
    shareOptions: 'Opciones para Compartir',
    qrCode: 'Código QR',
    copyLink: 'Copiar Enlace',
    shareNative: 'Compartir',
    linkCopied: 'Enlace copiado al portapapeles',
    
    // Languages
    spanish: 'Español',
    english: 'Inglés',
    portuguese: 'Portugués',
  },
  
  en: {
    // Contact info labels
    phone: 'Phone',
    email: 'Email',
    whatsapp: 'WhatsApp',
    website: 'Website',
    officeAddress: 'Office Address',
    
    // Social media labels
    instagram: 'Instagram',
    tiktok: 'TikTok',
    linkedin: 'LinkedIn',
    telegram: 'Telegram',
    youtube: 'YouTube',
    facebook: 'Facebook',
    
    // Banking labels
    bankingInfo: 'Banking Information',
    bankName: 'Bank',
    accountNumber: 'Account Number',
    accountType: 'Account Type',
    accountHolder: 'Account Holder',
    
    // Action buttons
    saveContact: 'Save Contact',
    shareContact: 'Share',
    translate: 'Translate',
    call: 'Call',
    sendEmail: 'Send Email',
    sendMessage: 'Send Message',
    visit: 'Visit',
    
    // Share modal
    shareOptions: 'Share Options',
    qrCode: 'QR Code',
    copyLink: 'Copy Link',
    shareNative: 'Share',
    linkCopied: 'Link copied to clipboard',
    
    // Languages
    spanish: 'Spanish',
    english: 'English',
    portuguese: 'Portuguese',
  },
  
  pt: {
    // Contact info labels
    phone: 'Telefone',
    email: 'Email',
    whatsapp: 'WhatsApp',
    website: 'Site Web',
    officeAddress: 'Endereço do Escritório',
    
    // Social media labels
    instagram: 'Instagram',
    tiktok: 'TikTok',
    linkedin: 'LinkedIn',
    telegram: 'Telegram',
    youtube: 'YouTube',
    facebook: 'Facebook',
    
    // Banking labels
    bankingInfo: 'Informações Bancárias',
    bankName: 'Banco',
    accountNumber: 'Número da Conta',
    accountType: 'Tipo de Conta',
    accountHolder: 'Titular da Conta',
    
    // Action buttons
    saveContact: 'Salvar Contato',
    shareContact: 'Compartilhar',
    translate: 'Traduzir',
    call: 'Ligar',
    sendEmail: 'Enviar Email',
    sendMessage: 'Enviar Mensagem',
    visit: 'Visitar',
    
    // Share modal
    shareOptions: 'Opções de Compartilhamento',
    qrCode: 'Código QR',
    copyLink: 'Copiar Link',
    shareNative: 'Compartilhar',
    linkCopied: 'Link copiado para a área de transferência',
    
    // Languages
    spanish: 'Espanhol',
    english: 'Inglês',
    portuguese: 'Português',
  },
};

export const getTranslation = (language: Language, key: keyof typeof translations.es): string => {
  return translations[language][key] || translations.es[key] || key;
};

export const getLanguageName = (language: Language, currentLang: Language): string => {
  const languageMap = {
    es: { es: 'Español', en: 'Spanish', pt: 'Espanhol' },
    en: { es: 'Inglés', en: 'English', pt: 'Inglês' },
    pt: { es: 'Portugués', en: 'Portuguese', pt: 'Português' },
  };
  
  return languageMap[language][currentLang] || language.toUpperCase();
};