import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  FileText,
  FileCheck2,
  UploadCloud,
  Globe,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send,
  AlertCircle,
  Loader2,
  Check,
} from 'lucide-react';
import { PRODUCTION_BRIEFING_STEPS, PRODUCTION_BRIEFING_QUESTIONS } from '../../server/src/services/briefingService';

interface ClientPortalProps {
  portalToken: string;
}

export const ClientPortalPage: React.FC<ClientPortalProps> = ({ portalToken }) => {
  const [projectData, setProjectData] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'briefing' | 'proposal' | 'materials' | 'preview'>('overview');
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Briefing Form State
  const [briefingAnswers, setBriefingAnswers] = useState<Record<string, string>>({});
  const [savingBriefing, setSavingBriefing] = useState(false);
  const [briefingSuccess, setBriefingSuccess] = useState(false);
  const [briefingStep, setBriefingStep] = useState(1);

  // Proposal State
  const [proposalData, setProposalData] = useState<any | null>(null);
  const [acceptorName, setAcceptorName] = useState('');
  const [acceptorEmail, setAcceptorEmail] = useState('');
  const [acceptingProposal, setAcceptingProposal] = useState(false);
  const [proposalAcceptedSuccess, setProposalAcceptedSuccess] = useState(false);

  // Materials State
  const [materials, setMaterials] = useState<any[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    loadPortalData();
  }, [portalToken]);

  const loadPortalData = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/portal/${portalToken}/project`);
      if (!res.ok) {
        throw new Error('Link de acesso inválido ou expirado.');
      }
      const data = await res.json();
      setProjectData(data);

      // Load briefing
      const brfRes = await fetch(`/api/portal/${portalToken}/briefing`);
      if (brfRes.ok) {
        const brfData = await brfRes.json();
        setBriefingAnswers(brfData.answers || {});
      }

      // Load materials
      const matRes = await fetch(`/api/portal/${portalToken}/materials`);
      if (matRes.ok) {
        const matData = await matRes.json();
        setMaterials(matData);
      }

      // Load proposal
      const propRes = await fetch(`/api/portal/${portalToken}/proposal`);
      if (propRes.ok) {
        const propData = await propRes.json();
        setProposalData(propData);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Erro ao carregar portal do cliente.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveBriefing = async (isFinalSubmit: boolean = false) => {
    try {
      setSavingBriefing(true);
      const res = await fetch(`/api/briefings/${projectData?.activeBriefing?.id}/answers`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          answers: briefingAnswers,
          isSubmitted: isFinalSubmit,
        }),
      });
      if (res.ok) {
        setBriefingSuccess(true);
        setTimeout(() => setBriefingSuccess(false), 3000);
        if (isFinalSubmit) {
          alert('Briefing de produção enviado com sucesso! Nossa equipe iniciará a análise dos materiais.');
          loadPortalData();
        }
      }
    } catch (err) {
      console.error('Erro ao salvar briefing:', err);
    } finally {
      setSavingBriefing(false);
    }
  };

  const handleAcceptProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposalData?.proposal?.id) return;
    try {
      setAcceptingProposal(true);
      const res = await fetch(`/api/portal/${portalToken}/proposal/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proposalId: proposalData.proposal.id,
          acceptedByName: acceptorName,
          acceptedByEmail: acceptorEmail,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setProposalAcceptedSuccess(true);
        loadPortalData();
      }
    } catch (err) {
      console.error('Erro ao aceitar proposta:', err);
    } finally {
      setAcceptingProposal(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, materialId?: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    if (materialId) formData.append('materialId', materialId);

    try {
      setUploadingFile(true);
      const res = await fetch(`/api/portal/${portalToken}/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        alert(`Arquivo "${file.name}" enviado com sucesso!`);
        loadPortalData();
      }
    } catch (err) {
      console.error('Erro no upload:', err);
    } finally {
      setUploadingFile(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-xs text-muted-foreground">
        <Loader2 className="w-5 h-5 animate-spin mr-2" />
        <span>Carregando portal do cliente seguro...</span>
      </div>
    );
  }

  if (errorMsg || !projectData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center">
        <div className="max-w-md bg-card border border-border rounded-xl p-8 shadow-xl space-y-3">
          <AlertCircle className="w-10 h-10 text-red-500 mx-auto" />
          <h2 className="text-base font-bold text-foreground">Acesso Não Autorizado</h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {errorMsg || 'O link de acesso fornecido não é válido ou foi expirado pela agência.'}
          </p>
        </div>
      </div>
    );
  }

  const client = projectData.client;
  const project = projectData.project;
  const stages = projectData.stages;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Client Navbar */}
      <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <img
            src="/praxis-logo-white.png"
            alt="PRAXIS"
            className="h-5 w-auto object-contain hidden dark:block"
          />
          <img
            src="/praxis-logo-dark.png"
            alt="PRAXIS"
            className="h-5 w-auto object-contain block dark:hidden"
          />
          <div className="h-4 w-px bg-border"></div>
          <div>
            <h1 className="text-sm font-bold text-foreground leading-none">{client.companyName}</h1>
            <span className="text-[11px] text-muted-foreground font-mono">Portal Exclusivo do Cliente • {client.code}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="hidden md:flex items-center gap-1 bg-secondary/50 border border-border rounded-lg p-1 text-xs">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'overview' ? 'bg-card text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Visão Geral
          </button>
          <button
            onClick={() => setActiveTab('briefing')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'briefing' ? 'bg-card text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Briefing
          </button>
          <button
            onClick={() => setActiveTab('proposal')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'proposal' ? 'bg-card text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Proposta
          </button>
          <button
            onClick={() => setActiveTab('materials')}
            className={`px-3 py-1 rounded-md font-medium transition-colors ${
              activeTab === 'materials' ? 'bg-card text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Arquivos
          </button>
          {projectData.previewUrl && (
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'preview' ? 'bg-card text-foreground shadow-xs font-semibold' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Prévia do Site
            </button>
          )}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-6 space-y-6">
        {/* Tab 1: Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-150">
            {/* Project Status Card */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <span className="text-xs uppercase font-mono text-primary font-bold">
                    {project ? project.current_stage : 'Aguardando Briefing'}
                  </span>
                  <h2 className="text-xl font-bold text-foreground mt-1">
                    {project ? project.name : 'Novo Projeto Digital'}
                  </h2>
                </div>

                <div className="text-left sm:text-right">
                  <span className="text-2xl font-bold font-mono text-primary">
                    {project ? `${project.progress_percent}%` : '0%'}
                  </span>
                  <span className="text-[11px] text-muted-foreground block">Concluído</span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${project ? project.progress_percent : 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                <span>Prazo Estimado: <strong>{project?.target_deadline || 'A definir após briefing'}</strong></span>
                <span>Ambiente Seguro e Monitorado</span>
              </div>
            </div>

            {/* Stages Checklist */}
            <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-4">
              <h3 className="font-bold text-sm text-foreground">Etapas de Produção</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {stages.map((stg: any, idx: number) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
                      stg.status === 'completed'
                        ? 'bg-emerald-500/5 border-emerald-500/30 text-emerald-500 font-semibold'
                        : stg.status === 'in_progress'
                        ? 'bg-primary/5 border-primary/40 text-primary font-semibold'
                        : 'bg-secondary/20 border-border text-muted-foreground'
                    }`}
                  >
                    <span>{stg.order_index}. {stg.stage_name}</span>
                    <span className="text-[10px] uppercase font-mono">
                      {stg.status === 'completed' ? '✓ Concluído' : stg.status === 'in_progress' ? 'Em Andamento' : 'Aguardando'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Interactive Briefing Form */}
        {activeTab === 'briefing' && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div>
                <h2 className="text-base font-bold text-foreground">Briefing de Produção do Site</h2>
                <p className="text-xs text-muted-foreground">
                  Preencha as informações do seu negócio em etapas simples com salvamento automático.
                </p>
              </div>
              {briefingSuccess && (
                <span className="text-xs text-emerald-500 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Salvo!
                </span>
              )}
            </div>

            {/* Step Selector Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border text-xs">
              {PRODUCTION_BRIEFING_STEPS.map((step) => (
                <button
                  key={step.step}
                  onClick={() => setBriefingStep(step.step)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                    briefingStep === step.step
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {step.step}. {step.title}
                </button>
              ))}
            </div>

            {/* Step Questions */}
            <div className="space-y-4">
              {PRODUCTION_BRIEFING_QUESTIONS.filter((q) => q.step === briefingStep).map((q) => (
                <div key={q.id} className="space-y-1.5">
                  <label className="block text-xs font-semibold text-foreground">
                    {q.label} {q.isRequired && <span className="text-red-500">*</span>}
                  </label>
                  <p className="text-[11px] text-muted-foreground">{q.description}</p>

                  {q.type === 'textarea' && (
                    <textarea
                      rows={3}
                      value={briefingAnswers[q.id] || ''}
                      onChange={(e) => setBriefingAnswers({ ...briefingAnswers, [q.id]: e.target.value })}
                      className="w-full p-2.5 text-xs rounded-lg border border-border bg-background text-foreground"
                    />
                  )}

                  {q.type === 'text' && (
                    <input
                      type="text"
                      value={briefingAnswers[q.id] || ''}
                      onChange={(e) => setBriefingAnswers({ ...briefingAnswers, [q.id]: e.target.value })}
                      className="w-full px-3 py-2 text-xs rounded-lg border border-border bg-background text-foreground"
                    />
                  )}

                  {q.type === 'radio_status' && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                      {[
                        { id: 'already_have', label: 'Já possuo' },
                        { id: 'need_create', label: 'Preciso criar' },
                        { id: 'unknown', label: 'Não sei informar' },
                        { id: 'send_later', label: 'Enviarei depois' },
                      ].map((opt) => (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setBriefingAnswers({ ...briefingAnswers, [q.id]: opt.id })}
                          className={`p-2 rounded-lg border text-xs font-medium text-center transition-colors ${
                            briefingAnswers[q.id] === opt.id
                              ? 'bg-primary/10 border-primary text-primary font-bold'
                              : 'bg-secondary/30 border-border text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Step Actions */}
            <div className="pt-4 border-t border-border flex items-center justify-between">
              <button
                type="button"
                onClick={() => handleSaveBriefing(false)}
                disabled={savingBriefing}
                className="px-4 py-2 rounded-lg bg-secondary border border-border text-xs text-foreground font-semibold hover:bg-secondary/80"
              >
                Salvar Rascunho
              </button>

              <div className="flex items-center gap-2">
                {briefingStep < PRODUCTION_BRIEFING_STEPS.length ? (
                  <button
                    type="button"
                    onClick={() => {
                      handleSaveBriefing(false);
                      setBriefingStep((s) => s + 1);
                    }}
                    className="px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-xs hover:bg-primary/90"
                  >
                    Próxima Etapa
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSaveBriefing(true)}
                    className="px-5 py-2 rounded-lg bg-emerald-600 text-white font-semibold text-xs hover:bg-emerald-500 shadow-xs"
                  >
                    Finalizar e Enviar Briefing
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Proposal & Formal Acceptance */}
        {activeTab === 'proposal' && (
          <div className="bg-card border border-border rounded-xl p-8 shadow-xs space-y-6 animate-in fade-in duration-150">
            {proposalData?.proposal ? (
              <div className="space-y-6">
                <div className="flex justify-between items-start pb-4 border-b border-border">
                  <div>
                    <span className="text-xs font-mono uppercase text-primary font-bold">
                      {proposalData.proposal.code}
                    </span>
                    <h2 className="text-lg font-bold text-foreground mt-0.5">{proposalData.proposal.title}</h2>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                      proposalData.proposal.status === 'accepted'
                        ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
                    }`}
                  >
                    {proposalData.proposal.status === 'accepted' ? 'Aprovada' : 'Aguardando Aceite'}
                  </span>
                </div>

                {/* Acceptance Receipt if Accepted */}
                {proposalData.acceptance ? (
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs space-y-1">
                    <h3 className="font-bold text-emerald-500 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Aceite Formal Confirmado
                    </h3>
                    <p className="text-foreground">
                      Aprovado digitalmente por <strong>{proposalData.acceptance.acceptedByName}</strong> em{' '}
                      {new Date(proposalData.acceptance.acceptedAt).toLocaleString('pt-BR')}.
                    </p>
                    <span className="text-[10px] font-mono text-muted-foreground block truncate">
                      Assinatura SHA-256: {proposalData.acceptance.signatureHash}
                    </span>
                  </div>
                ) : (
                  <div className="p-5 rounded-xl bg-primary/5 border border-primary/20 space-y-4">
                    <h3 className="font-bold text-sm text-foreground">Termo de Aceite Formal</h3>
                    <form onSubmit={handleAcceptProposal} className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block font-semibold mb-1">Nome Completo do Responsável Legal</label>
                        <input
                          type="text"
                          required
                          placeholder="Ex: Carlos Eduardo Silva"
                          value={acceptorName}
                          onChange={(e) => setAcceptorName(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                        />
                      </div>
                      <div>
                        <label className="block font-semibold mb-1">E-mail Corporativo</label>
                        <input
                          type="email"
                          required
                          placeholder="carlos@suaempresa.com.br"
                          value={acceptorEmail}
                          onChange={(e) => setAcceptorEmail(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground"
                        />
                      </div>
                      <div className="sm:col-span-2 pt-2 flex justify-end">
                        <button
                          type="submit"
                          disabled={acceptingProposal}
                          className="px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-xs"
                        >
                          {acceptingProposal ? 'Registrando Assinatura...' : 'Aprovar Proposta e Iniciar Projeto'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* 19 Clauses */}
                <div className="space-y-4 pt-4">
                  {proposalData.proposal.sections.map((sec: any) => (
                    <div key={sec.number} className="border-b border-border/60 pb-3 space-y-1">
                      <h4 className="font-bold text-xs uppercase tracking-wider text-primary">
                        {sec.number}. {sec.title}
                      </h4>
                      <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">
                        {sec.content}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-xs text-muted-foreground">
                Proposta comercial em elaboração pela agência.
              </div>
            )}
          </div>
        )}

        {/* Tab 4: Materials Upload */}
        {activeTab === 'materials' && (
          <div className="bg-card border border-border rounded-xl p-6 shadow-xs space-y-6 animate-in fade-in duration-150">
            <div>
              <h2 className="text-base font-bold text-foreground">Checklist de Materiais & Envio de Arquivos</h2>
              <p className="text-xs text-muted-foreground">
                Envie o logotipo vetorial, textos e fotografias da sua empresa em ambiente seguro com limite de até 15MB.
              </p>
            </div>

            <div className="space-y-3">
              {materials.map((mat) => (
                <div key={mat.id} className="p-4 rounded-xl border border-border bg-secondary/20 space-y-2 text-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-muted-foreground">{mat.category}</span>
                      <h4 className="font-bold text-foreground mt-0.5">{mat.description}</h4>
                    </div>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                        mat.status === 'submitted' || mat.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-500'
                          : 'bg-secondary text-muted-foreground'
                      }`}
                    >
                      {mat.status === 'submitted' ? 'Enviado' : mat.status === 'approved' ? 'Aprovado' : 'Pendente'}
                    </span>
                  </div>

                  {mat.solution_details && (
                    <p className="text-[11px] text-muted-foreground">{mat.solution_details}</p>
                  )}

                  <div className="pt-2 flex items-center justify-between">
                    {mat.file_name ? (
                      <span className="text-[11px] font-mono text-emerald-500 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5" /> {mat.file_name}
                      </span>
                    ) : (
                      <label className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90">
                        <UploadCloud className="w-3.5 h-3.5" />
                        <span>Enviar Arquivo</span>
                        <input
                          type="file"
                          className="hidden"
                          onChange={(e) => handleFileUpload(e, mat.id)}
                        />
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Site Preview */}
        {activeTab === 'preview' && projectData.previewUrl && (
          <div className="bg-card border border-border rounded-xl overflow-hidden shadow-xs h-[750px] animate-in fade-in duration-150">
            <iframe src={projectData.previewUrl} title="Demonstração" className="w-full h-full border-none" />
          </div>
        )}
      </main>
    </div>
  );
};
