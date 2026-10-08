export interface SiteGenerationInput {
  companyName: string;
  niche: string;
  city: string;
  phone?: string;
  address?: string;
  primaryColor?: string;
}

export interface GeneratedSiteResult {
  html: string;
  previewToken: string;
  theme: string;
  title: string;
  sections: string[];
}

export const generateDemoSite = (input: SiteGenerationInput): GeneratedSiteResult => {
  const company = input.companyName || 'Empresa em Destaque';
  const niche = (input.niche || 'Serviços').toLowerCase();
  const city = input.city || 'São Paulo';
  const phone = input.phone || '(11) 99999-9999';
  const rawDigits = phone.replace(/\D/g, '') || '11999999999';
  const cleanPhone = rawDigits.startsWith('55') ? rawDigits : `55${rawDigits}`;
  const address = input.address || `Centro, ${city}`;
  const previewToken = `demo_${Math.random().toString(36).substring(2, 10)}_${Date.now().toString(36)}`;

  // Determine industry theme and color scheme
  let theme = 'corporate';
  let primaryColor = input.primaryColor || '#2563EB';
  let secondaryColor = '#1E40AF';
  let accentColor = '#38BDF8';
  let heroSubtitle = 'Excelência e atendimento de alto padrão para você e sua família.';
  let services = [
    { title: 'Atendimento Personalizado', desc: 'Soluções sob medida desenvolvidas por profissionais qualificados.' },
    { title: 'Tecnologia & Inovação', desc: 'Equipamentos modernos e processos certificados para o melhor resultado.' },
    { title: 'Pontualidade e Conforto', desc: 'Ambiente planejado para oferecer comodidade e máxima eficiência.' },
  ];

  if (niche.includes('odonto') || niche.includes('dentist')) {
    theme = 'dental';
    primaryColor = '#0284C7';
    secondaryColor = '#0369A1';
    accentColor = '#14B8A6';
    heroSubtitle = 'A tecnologia mais avançada em ortodontia, implantes e estética dental em ' + city + '.';
    services = [
      { title: 'Ortodontia Digital & Alinhadores', desc: 'Tratamentos ortodônticos rápidos e discretos com planejamento 3D.' },
      { title: 'Implantes & Próteses Guiadas', desc: 'Recupere seu sorriso com cirurgia guiada sem cortes desnecessários.' },
      { title: 'Estética Dental & Clareamento a Laser', desc: 'Lentes de resina e porcelana para um sorriso radiante e natural.' },
      { title: 'Odontopediatria Humanizada', desc: 'Cuidado especializado para crianças em ambiente lúdico e acolhedor.' },
    ];
  } else if (niche.includes('barbearia') || niche.includes('barber')) {
    theme = 'barber';
    primaryColor = '#D97706';
    secondaryColor = '#B45309';
    accentColor = '#78350F';
    heroSubtitle = 'Tradição, navalha afiada e corte de precisão no coração de ' + city + '.';
    services = [
      { title: 'Corte Clássico & Fade', desc: 'Técnicas contemporâneas e tesoura precisa alinhadas ao seu estilo.' },
      { title: 'Barba Terapia com Toalha Quente', desc: 'Hidratação profunda, esfoliação facial e navalhete tradicional.' },
      { title: 'Colorimetria & Pigmentação', desc: 'Acabamento impecável e disfarce de fios brancos com produtos premium.' },
      { title: 'Ambiente Lounge & Bar', desc: 'Cerveja gelada, sinuca e café especial enquanto você relaxa.' },
    ];
  } else if (niche.includes('restaurante') || niche.includes('gastronomia') || niche.includes('pizza')) {
    theme = 'restaurant';
    primaryColor = '#DC2626';
    secondaryColor = '#991B1B';
    accentColor = '#F59E0B';
    heroSubtitle = 'Uma experiência gastronômica inesquecível com ingredientes frescos e receitas autorais.';
    services = [
      { title: 'Menu À La Carte Especial', desc: 'Pratos elaborados por chefs premiados com matérias-primas nobres.' },
      { title: 'Carta de Vinhos Selecionada', desc: 'Rótulos nacionais e internacionais harmonizados para cada prato.' },
      { title: 'Espaço para Eventos & Confraternizações', desc: 'Salão privativo climatizado com atendimento exclusivo.' },
      { title: 'Delivery & Take Away Gourmet', desc: 'O melhor da nossa cozinha entregue com frescor na sua casa.' },
    ];
  } else if (niche.includes('advoc') || niche.includes('jurid') || niche.includes('direito')) {
    theme = 'law';
    primaryColor = '#1E3A8A';
    secondaryColor = '#172554';
    accentColor = '#D97706';
    heroSubtitle = 'Segurança jurídica, consultoria preventiva e defesa combativa dos seus direitos em ' + city + '.';
    services = [
      { title: 'Direito Empresarial & Contratos', desc: 'Blindagem contratual e compliance para empresas em crescimento.' },
      { title: 'Direito Trabalhista & Previdenciário', desc: 'Defesa estratégica em litígios e cálculos de aposentadoria.' },
      { title: 'Direito Civil & Imobiliário', desc: 'Assessoria em compra, venda, locação e regularização de imóveis.' },
      { title: 'Planejamento Sucessório & Família', desc: 'Inventários ágeis, holdings familiares e proteção patrimonial.' },
    ];
  }

  const servicesHtml = services.map(s => `
    <div class="service-card">
      <div class="service-icon-box">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
      </div>
      <h3>${s.title}</h3>
      <p>${s.desc}</p>
    </div>
  `).join('');

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${company} — ${city}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    :root {
      --primary: ${primaryColor};
      --secondary: ${secondaryColor};
      --accent: ${accentColor};
      --bg: #0B0F19;
      --card-bg: #111827;
      --border: #1F2937;
      --text: #F3F4F6;
      --text-muted: #9CA3AF;
    }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
      background: var(--bg);
      color: var(--text);
      line-height: 1.6;
      overflow-x: hidden;
    }
    /* Non-official Demo Disclaimer Banner */
    .demo-banner {
      background: linear-gradient(90deg, #1E1B4B 0%, #312E81 100%);
      border-bottom: 1px solid #4338CA;
      color: #E0E7FF;
      font-size: 0.82rem;
      padding: 10px 16px;
      text-align: center;
      position: sticky;
      top: 0;
      z-index: 100;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .demo-banner strong { color: #A5B4FC; }
    .nav {
      max-width: 1200px;
      margin: 0 auto;
      padding: 24px 20px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand {
      font-size: 1.4rem;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #FFFFFF;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .brand-dot {
      width: 10px;
      height: 10px;
      background: var(--primary);
      border-radius: 50%;
      display: inline-block;
    }
    .nav-links {
      display: flex;
      gap: 28px;
      align-items: center;
    }
    .nav-links a {
      color: var(--text-muted);
      text-decoration: none;
      font-size: 0.95rem;
      font-weight: 500;
      transition: color 0.2s;
    }
    .nav-links a:hover { color: #FFF; }
    .btn-cta {
      background: var(--primary);
      color: #FFF;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      font-size: 0.95rem;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: transform 0.2s, background 0.2s;
    }
    .btn-cta:hover {
      background: var(--secondary);
      transform: translateY(-2px);
    }
    /* Hero Section */
    .hero {
      max-width: 1200px;
      margin: 40px auto 80px;
      padding: 0 20px;
      text-align: center;
    }
    .hero-badge {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: rgba(37, 99, 235, 0.12);
      border: 1px solid rgba(37, 99, 235, 0.3);
      padding: 6px 16px;
      border-radius: 999px;
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--accent);
      margin-bottom: 24px;
    }
    .hero h1 {
      font-size: 3.2rem;
      font-weight: 800;
      letter-spacing: -1.5px;
      line-height: 1.15;
      max-width: 900px;
      margin: 0 auto 20px;
      color: #FFF;
    }
    .hero h1 span {
      background: linear-gradient(135deg, #FFF 30%, var(--accent) 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    .hero p {
      font-size: 1.2rem;
      color: var(--text-muted);
      max-width: 640px;
      margin: 0 auto 36px;
    }
    .hero-actions {
      display: flex;
      justify-content: center;
      gap: 16px;
      flex-wrap: wrap;
    }
    .btn-secondary {
      background: #1F2937;
      color: #FFF;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      border: 1px solid #374151;
      transition: background 0.2s;
    }
    .btn-secondary:hover { background: #374151; }
    /* Features / Services */
    .section-title {
      text-align: center;
      margin-bottom: 50px;
    }
    .section-title h2 {
      font-size: 2.2rem;
      font-weight: 700;
      color: #FFF;
      letter-spacing: -0.5px;
    }
    .section-title p {
      color: var(--text-muted);
      font-size: 1rem;
      margin-top: 8px;
    }
    .services-grid {
      max-width: 1200px;
      margin: 0 auto 90px;
      padding: 0 20px;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
      gap: 24px;
    }
    .service-card {
      background: var(--card-bg);
      border: 1px solid var(--border);
      border-radius: 12px;
      padding: 32px 24px;
      transition: transform 0.2s, border-color 0.2s;
    }
    .service-card:hover {
      transform: translateY(-4px);
      border-color: var(--primary);
    }
    .service-icon-box {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      background: rgba(37, 99, 235, 0.15);
      color: var(--accent);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 20px;
    }
    .service-card h3 {
      font-size: 1.25rem;
      font-weight: 700;
      color: #FFF;
      margin-bottom: 12px;
    }
    .service-card p {
      color: var(--text-muted);
      font-size: 0.95rem;
      line-height: 1.5;
    }
    /* Contact Box */
    .contact-cta {
      max-width: 1000px;
      margin: 0 auto 80px;
      padding: 48px 32px;
      background: linear-gradient(180deg, #131B2E 0%, #0D1322 100%);
      border: 1px solid #1E293B;
      border-radius: 16px;
      text-align: center;
    }
    .contact-cta h3 {
      font-size: 2rem;
      font-weight: 800;
      color: #FFF;
      margin-bottom: 12px;
    }
    .contact-cta p {
      color: var(--text-muted);
      margin-bottom: 28px;
      font-size: 1.05rem;
    }
    .contact-info-pills {
      display: flex;
      justify-content: center;
      gap: 24px;
      margin-bottom: 32px;
      flex-wrap: wrap;
    }
    .info-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      background: #1E293B;
      padding: 8px 18px;
      border-radius: 999px;
      font-size: 0.9rem;
      color: #E2E8F0;
    }
    /* Footer */
    footer {
      border-top: 1px solid var(--border);
      padding: 32px 20px;
      text-align: center;
      color: #6B7280;
      font-size: 0.85rem;
    }
    /* Floating WhatsApp Button */
    .float-wa {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: #25D366;
      color: #FFF;
      width: 58px;
      height: 58px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 14px rgba(37, 211, 102, 0.4);
      z-index: 99;
      text-decoration: none;
      transition: transform 0.2s;
    }
    .float-wa:hover { transform: scale(1.1); }
    @media (max-width: 768px) {
      .hero h1 { font-size: 2.2rem; }
      .nav-links { display: none; }
    }
  </style>
</head>
<body>
  <!-- Demonstrative Notice Header -->
  <div class="demo-banner">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    <span><strong>Demonstração Não Oficial:</strong> Prévia visual conceitual desenvolvida exclusivamente para <strong>${company}</strong> por Praxis Digital Studio.</span>
  </div>

  <header>
    <nav class="nav">
      <div class="brand">
        <span class="brand-dot"></span>
        <span>${company}</span>
      </div>
      <div class="nav-links">
        <a href="#servicos">Serviços</a>
        <a href="#sobre">Diferenciais</a>
        <a href="#contato">Localização</a>
        <a href="https://wa.me/${cleanPhone}" target="_blank" class="btn-cta">Falar no WhatsApp</a>
      </div>
    </nav>
  </header>

  <main>
    <section class="hero">
      <div class="hero-badge">
        <span>📍 Atendimento Premium em ${city}</span>
      </div>
      <h1>Presença, Autoridade e <span>Atendimento de Excelência</span></h1>
      <p>${heroSubtitle}</p>
      <div class="hero-actions">
        <a href="https://wa.me/${cleanPhone}" target="_blank" class="btn-cta">
          Agendar Atendimento Online
        </a>
        <a href="#servicos" class="btn-secondary">
          Conhecer Nossas Especialidades
        </a>
      </div>
    </section>

    <section id="servicos">
      <div class="section-title">
        <h2>Soluções Especializadas</h2>
        <p>Cuidado e dedicação pensados nos mínimos detalhes</p>
      </div>
      <div class="services-grid">
        ${servicesHtml}
      </div>
    </section>

    <section id="contato" class="contact-cta">
      <h3>Pronto para transformar sua experiência?</h3>
      <p>Nossa equipe está pronta para atender você com toda a atenção que você merece.</p>
      <div class="contact-info-pills">
        <div class="info-pill">📞 ${phone}</div>
        <div class="info-pill">📍 ${address}</div>
        <div class="info-pill">⏰ Seg a Sex: 08h às 19h | Sáb: 08h às 14h</div>
      </div>
      <a href="https://wa.me/${cleanPhone}" target="_blank" class="btn-cta">
        Iniciar Conversa no WhatsApp
      </a>
    </section>
  </main>

  <footer>
    <p>© ${new Date().getFullYear()} ${company}. Todos os direitos reservados. Localizado em ${city} - Brasil.</p>
  </footer>

  <!-- WhatsApp Floating Icon -->
  <a href="https://wa.me/${cleanPhone}" target="_blank" class="float-wa" title="Conversar no WhatsApp">
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/></svg>
  </a>
</body>
</html>`;

  return {
    html,
    previewToken,
    theme,
    title: `${company} — Site Demonstrativo`,
    sections: ['Hero', 'Serviços Especializados', 'Diferenciais', 'Contato & Localização'],
  };
};
