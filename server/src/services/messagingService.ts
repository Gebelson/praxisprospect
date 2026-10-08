export interface MessageRenderInput {
  templateText: string;
  variables: Record<string, string>;
  phone?: string;
  email?: string;
  instagram?: string;
}

export interface RenderedMessageResult {
  content: string;
  whatsappUrl?: string;
  instagramUrl?: string;
  mailtoUrl?: string;
}

export const renderTemplateText = (template: string, vars: Record<string, string>): string => {
  let rendered = template;
  for (const [key, value] of Object.entries(vars)) {
    const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
    rendered = rendered.replace(regex, value || '');
  }
  return rendered;
};

export const prepareChannelLinks = (
  renderedText: string,
  subject?: string,
  phone?: string,
  email?: string,
  instagramHandle?: string
): RenderedMessageResult => {
  let whatsappUrl: string | undefined;
  let instagramUrl: string | undefined;
  let mailtoUrl: string | undefined;

  if (phone) {
    const cleanPhone = phone.replace(/\D/g, '');
    const formattedPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(renderedText)}`;
  }

  if (instagramHandle) {
    const cleanIg = instagramHandle.replace('@', '').trim();
    instagramUrl = `https://instagram.com/${cleanIg}`;
  }

  if (email) {
    const sub = subject ? encodeURIComponent(subject) : '';
    const body = encodeURIComponent(renderedText);
    mailtoUrl = `mailto:${email}?subject=${sub}&body=${body}`;
  }

  return {
    content: renderedText,
    whatsappUrl,
    instagramUrl,
    mailtoUrl,
  };
};
