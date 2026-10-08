import React, { useState, useEffect } from 'react';
import {
  FolderGit2,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
  Layers,
  FileText,
  Calendar,
  MessageSquare,
  ChevronRight,
  ArrowRight,
  Check,
  Sparkles,
} from 'lucide-react';
import { NavigationModule } from '../components/Sidebar';

interface ProjectItem {
  id: string;
  name: string;
  project_type: string;
  status: string;
  current_stage: string;
  progress_percent: number;
  target_deadline?: string;
  total_value: number;
  client_code: string;
  company_name: string;
  total_tasks: number;
  completed_tasks: number;
}

interface ProjectsPageProps {
  onNavigate: (module: NavigationModule) => void;
}

export const ProjectsPage: React.FC<ProjectsPageProps> = ({ onNavigate }) => {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [projectDetail, setProjectDetail] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState<'stages' | 'tasks' | 'materials' | 'revisions'>('stages');

  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await fetch('/api/projects');
      const data = await res.json();
      setProjects(data);
      if (data.length > 0 && !selectedProjectId) {
        viewProject(data[0].id);
      }
    } catch (err) {
      console.error('Erro ao carregar projetos:', err);
    }
  };

  const viewProject = async (id: string) => {
    setSelectedProjectId(id);
    try {
      const res = await fetch(`/api/projects/${id}`);
      const data = await res.json();
      setProjectDetail(data);
    } catch (err) {
      console.error('Erro ao carregar projeto:', err);
    }
  };

  const handleToggleTask = async (taskId: string) => {
    if (!selectedProjectId) return;
    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/tasks/${taskId}/toggle`, {
        method: 'PATCH',
      });
      const data = await res.json();
      if (data.success) {
        viewProject(selectedProjectId);
        fetchProjects();
      }
    } catch (err) {
      console.error('Erro ao alternar status da tarefa:', err);
    }
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProjectId || !newTaskTitle) return;
    try {
      const res = await fetch(`/api/projects/${selectedProjectId}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle, estimatedHours: 2 }),
      });
      const data = await res.json();
      if (data.success) {
        setNewTaskTitle('');
        viewProject(selectedProjectId);
        fetchProjects();
      }
    } catch (err) {
      console.error('Erro ao adicionar tarefa:', err);
    }
  };

  return (
    <div className="p-6 sm:p-10 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase font-bold border border-primary/30 bg-primary/15 text-foreground mb-3">
            <Layers className="w-3.5 h-3.5 text-primary" />
            Produção Técnica & Entregas
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-foreground uppercase">
            Andamento dos <span className="font-serif italic font-normal text-muted-foreground">Projetos</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-2xl font-sans">
            Cronograma linear em 14 etapas automatizadas, checklist de tarefas operacionais e controle de revisões.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Selector List (1 col) */}
        <div className="space-y-4">
          <h3 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
            Projetos Ativos ({projects.length})
          </h3>

          <div className="space-y-3">
            {projects.map((proj, idx) => {
              const isSelected = selectedProjectId === proj.id;
              const indexNum = String(idx + 1).padStart(2, '0');

              return (
                <div
                  key={proj.id}
                  onClick={() => viewProject(proj.id)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 shadow-sm ${
                    isSelected
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-primary">
                          {indexNum}.
                        </span>
                        <span className="text-[10px] font-mono uppercase text-muted-foreground font-bold">
                          {proj.client_code}
                        </span>
                      </div>
                      <h4 className="font-extrabold text-sm text-foreground mt-1 leading-snug">
                        {proj.name}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-secondary border border-border text-foreground font-bold">
                      {proj.current_stage}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                      <span>Progresso Concluído</span>
                      <span className="font-bold text-foreground">{proj.progress_percent}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden border border-border">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${proj.progress_percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {projects.length === 0 && (
              <div className="p-12 border border-dashed border-border rounded-2xl text-center text-xs text-muted-foreground bg-card">
                Nenhum projeto em andamento. Converta um lead ou aprove uma proposta comercial para iniciar.
              </div>
            )}
          </div>
        </div>

        {/* Project Management Detail (2 cols) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-7 sm:p-8 shadow-sm flex flex-col justify-between">
          {projectDetail ? (
            <div className="space-y-6">
              {/* Project Header Info */}
              <div className="pb-5 border-b border-border space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-secondary border border-border text-foreground font-bold">
                    Contrato: {projectDetail.project.client_code}
                  </span>
                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-foreground">
                      {projectDetail.project.progress_percent}%
                    </span>
                    <span className="block text-[10px] font-mono uppercase text-muted-foreground tracking-wider font-bold">
                      Concluído
                    </span>
                  </div>
                </div>

                <div>
                  <h3 className="text-xl font-black text-foreground uppercase tracking-tight">
                    {projectDetail.project.name}
                  </h3>
                  <p className="text-xs text-muted-foreground font-sans mt-0.5">
                    Empresa: <strong className="text-foreground">{projectDetail.project.company_name}</strong> | Localização: {projectDetail.project.city}
                  </p>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 border-b border-border pb-2 overflow-x-auto text-xs">
                <button
                  onClick={() => setActiveTab('stages')}
                  className={`px-3.5 py-2 rounded-xl font-mono text-[11px] uppercase tracking-wider font-bold transition-all ${
                    activeTab === 'stages'
                      ? 'bg-primary text-black shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  14 Etapas do Cronograma
                </button>

                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`px-3.5 py-2 rounded-xl font-mono text-[11px] uppercase tracking-wider font-bold transition-all ${
                    activeTab === 'tasks'
                      ? 'bg-primary text-black shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  Tarefas & Checklist ({projectDetail.tasks.length})
                </button>

                <button
                  onClick={() => setActiveTab('materials')}
                  className={`px-3.5 py-2 rounded-xl font-mono text-[11px] uppercase tracking-wider font-bold transition-all ${
                    activeTab === 'materials'
                      ? 'bg-primary text-black shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  Materiais do Cliente ({projectDetail.materials.length})
                </button>

                <button
                  onClick={() => setActiveTab('revisions')}
                  className={`px-3.5 py-2 rounded-xl font-mono text-[11px] uppercase tracking-wider font-bold transition-all ${
                    activeTab === 'revisions'
                      ? 'bg-primary text-black shadow-xs'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  }`}
                >
                  Revisões ({projectDetail.revisions.length})
                </button>
              </div>

              {/* Tab 1: 14 Stages */}
              {activeTab === 'stages' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
                  {projectDetail.stages.map((stg: any) => {
                    const stageNum = String(stg.order_index).padStart(2, '0');
                    return (
                      <div
                        key={stg.id}
                        className={`p-4 rounded-xl border text-xs flex items-center justify-between transition-all ${
                          stg.status === 'completed'
                            ? 'bg-emerald-500/[0.08] border-emerald-500/30'
                            : stg.status === 'in_progress'
                            ? 'bg-primary/15 border-primary/40'
                            : 'bg-secondary/40 border-border'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-black text-foreground">
                            {stageNum}.
                          </span>
                          <div>
                            <h4 className="font-bold text-foreground uppercase tracking-tight">{stg.stage_name}</h4>
                            <span className="text-[10px] font-mono text-muted-foreground">Peso: {stg.weight_percent}%</span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                            stg.status === 'completed'
                              ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-500/15'
                              : stg.status === 'in_progress'
                              ? 'text-foreground bg-primary/25 font-black'
                              : 'text-muted-foreground bg-background'
                          }`}
                        >
                          {stg.status === 'completed' ? 'Concluída' : stg.status === 'in_progress' ? 'Em Andamento' : 'Pendente'}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Tab 2: Dynamic Task Checklist */}
              {activeTab === 'tasks' && (
                <div className="space-y-4">
                  <form onSubmit={handleAddTask} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Adicionar nova tarefa operacional ao projeto..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="flex-1 px-4 py-2.5 text-xs rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary font-sans"
                    />
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-primary text-black font-extrabold uppercase text-xs tracking-wider flex items-center gap-1.5 hover:bg-primary/90 transition-all shadow-xs"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>Adicionar</span>
                    </button>
                  </form>

                  <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                    {projectDetail.tasks.map((task: any) => {
                      const isDone = task.status === 'done';
                      return (
                        <div
                          key={task.id}
                          onClick={() => handleToggleTask(task.id)}
                          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                            isDone
                              ? 'bg-secondary/20 border-border line-through opacity-60'
                              : 'bg-card border-border hover:border-primary/60'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                                isDone ? 'bg-primary border-primary text-black' : 'border-muted-foreground bg-background'
                              }`}
                            >
                              {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="font-semibold text-foreground">{task.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-muted-foreground">{task.estimated_hours}h est.</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 3: Materials Checklist */}
              {activeTab === 'materials' && (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
                  {projectDetail.materials.map((mat: any) => (
                    <div key={mat.id} className="p-4 rounded-xl border border-border bg-secondary/30 space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-muted-foreground block">{mat.category}</span>
                          <h4 className="font-bold text-foreground mt-0.5">{mat.description}</h4>
                        </div>
                        <span className="text-[10px] px-2.5 py-0.5 rounded-full font-mono font-bold uppercase bg-background border border-border text-foreground">
                          {mat.status}
                        </span>
                      </div>
                      {mat.solution_details && (
                        <p className="text-[11px] text-muted-foreground border-l-2 border-primary pl-2.5 font-sans">
                          Solução: {mat.solution_details}
                        </p>
                      )}
                    </div>
                  ))}
                  {projectDetail.materials.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-10 font-sans">
                      O checklist de materiais será gerado automaticamente quando o briefing de produção for preenchido.
                    </p>
                  )}
                </div>
              )}

              {/* Tab 4: Revisions */}
              {activeTab === 'revisions' && (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
                  {projectDetail.revisions.map((rev: any) => (
                    <div key={rev.id} className="p-4 rounded-xl border border-border bg-secondary/30 space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-foreground uppercase">Revisão #{rev.revision_number}</span>
                        <span className="text-[10px] text-muted-foreground font-mono">Solicitante: {rev.requested_by}</span>
                      </div>
                      <p className="text-muted-foreground leading-relaxed font-sans">{rev.description}</p>
                    </div>
                  ))}
                  {projectDetail.revisions.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-10 font-sans">
                      Nenhuma solicitação de alteração aberta pelo cliente até o momento.
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-xs text-muted-foreground space-y-2">
              <FolderGit2 className="w-8 h-8 text-muted-foreground/60" />
              <span>Selecione um projeto à esquerda para gerenciar tarefas e cronograma.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
