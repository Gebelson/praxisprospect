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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-mono tracking-wider uppercase font-semibold border border-primary/30 bg-primary/10 text-primary mb-3">
            <Layers className="w-3.5 h-3.5" />
            Produção & Entrega Contínua
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white uppercase">
            Gestão de <span className="font-serif italic font-normal text-primary">Projetos</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1 max-w-2xl font-sans">
            Cronograma linear em 14 etapas automatizadas, controle granular de tarefas e checklist de aprovações.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Selector List (1 col) */}
        <div className="space-y-4">
          <h3 className="font-mono text-[11px] uppercase tracking-wider text-neutral-400 font-semibold">
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
                  className={`p-5 rounded-2xl border cursor-pointer transition-all space-y-3 backdrop-blur-xl group relative overflow-hidden ${
                    isSelected
                      ? 'border-primary bg-primary/[0.04] shadow-lg shadow-primary/10'
                      : 'border-white/10 bg-white/[0.02] hover:border-primary/40 hover:bg-white/[0.03]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-black text-primary/40 group-hover:text-primary transition-colors">
                          {indexNum}.
                        </span>
                        <span className="text-[10px] font-mono uppercase text-neutral-500">
                          {proj.client_code}
                        </span>
                      </div>
                      <h4 className="font-black text-sm text-white uppercase tracking-tight mt-1 group-hover:text-primary transition-colors">
                        {proj.name}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-primary font-bold">
                      {proj.current_stage}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1.5 pt-1">
                    <div className="flex justify-between text-[11px] font-mono text-neutral-400">
                      <span>Progresso Linear</span>
                      <span className="font-bold text-white">{proj.progress_percent}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full transition-all duration-300 shadow-xs shadow-primary/50"
                        style={{ width: `${proj.progress_percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}

            {projects.length === 0 && (
              <div className="p-12 border border-dashed border-white/10 rounded-2xl text-center text-xs text-neutral-400 bg-white/[0.01]">
                Nenhum projeto em andamento. Converta um lead ou aprove uma proposta comercial para iniciar.
              </div>
            )}
          </div>
        </div>

        {/* Project Management Detail (2 cols) */}
        <div className="lg:col-span-2 bg-white/[0.02] border border-white/10 rounded-2xl p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between">
          {projectDetail ? (
            <div className="space-y-6">
              {/* Window Chrome & Project Header Info */}
              <div className="pb-5 border-b border-white/10 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
                  </div>
                  <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-neutral-400">
                    Contrato: {projectDetail.project.client_code}
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">
                      {projectDetail.project.name}
                    </h3>
                    <p className="text-xs text-neutral-400 font-sans mt-0.5">
                      Empresa: <strong className="text-neutral-200">{projectDetail.project.company_name}</strong> | Localização: {projectDetail.project.city}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-2xl font-black font-mono text-primary">
                      {projectDetail.project.progress_percent}%
                    </span>
                    <span className="block text-[10px] font-mono uppercase text-neutral-500 tracking-wider">
                      Execução Concluída
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-2 border-b border-white/10 text-xs pb-1 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('stages')}
                  className={`px-3 py-2 rounded-xl font-mono text-[11px] uppercase tracking-wider font-bold transition-all ${
                    activeTab === 'stages'
                      ? 'bg-primary text-black shadow-md shadow-primary/20'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  14 Etapas do Cronograma
                </button>

                <button
                  onClick={() => setActiveTab('tasks')}
                  className={`px-3 py-2 rounded-xl font-mono text-[11px] uppercase tracking-wider font-bold transition-all ${
                    activeTab === 'tasks'
                      ? 'bg-primary text-black shadow-md shadow-primary/20'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Tarefas & Checklist ({projectDetail.tasks.length})
                </button>

                <button
                  onClick={() => setActiveTab('materials')}
                  className={`px-3 py-2 rounded-xl font-mono text-[11px] uppercase tracking-wider font-bold transition-all ${
                    activeTab === 'materials'
                      ? 'bg-primary text-black shadow-md shadow-primary/20'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Materiais do Cliente ({projectDetail.materials.length})
                </button>

                <button
                  onClick={() => setActiveTab('revisions')}
                  className={`px-3 py-2 rounded-xl font-mono text-[11px] uppercase tracking-wider font-bold transition-all ${
                    activeTab === 'revisions'
                      ? 'bg-primary text-black shadow-md shadow-primary/20'
                      : 'text-neutral-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  Revisões ({projectDetail.revisions.length})
                </button>
              </div>

              {/* Tab 1: 14 Stages */}
              {activeTab === 'stages' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[480px] overflow-y-auto pr-1">
                  {projectDetail.stages.map((stg: any) => {
                    const stageNum = String(stg.order_index).padStart(2, '0');
                    return (
                      <div
                        key={stg.id}
                        className={`p-4 rounded-xl border text-xs flex items-center justify-between transition-all ${
                          stg.status === 'completed'
                            ? 'bg-emerald-500/[0.04] border-emerald-500/30'
                            : stg.status === 'in_progress'
                            ? 'bg-primary/[0.04] border-primary/40'
                            : 'bg-white/[0.01] border-white/5'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono text-xs font-bold text-primary">
                            {stageNum}.
                          </span>
                          <div>
                            <h4 className="font-bold text-white uppercase tracking-tight">{stg.stage_name}</h4>
                            <span className="text-[10px] font-mono text-neutral-500">Peso: {stg.weight_percent}%</span>
                          </div>
                        </div>
                        <span
                          className={`text-[10px] font-mono px-2 py-0.5 rounded-full font-bold uppercase ${
                            stg.status === 'completed'
                              ? 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20'
                              : stg.status === 'in_progress'
                              ? 'text-primary bg-primary/10 border border-primary/30'
                              : 'text-neutral-500 bg-white/5'
                          }`}
                        >
                          {stg.status === 'completed' ? 'Concluída' : stg.status === 'in_progress' ? 'Em Curso' : 'Aguardando'}
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
                      className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-white/10 bg-black/40 text-white placeholder:text-neutral-600 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary font-sans"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-primary text-black font-black uppercase text-xs tracking-wider flex items-center gap-1.5 hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
                    >
                      <Plus className="w-4 h-4 stroke-[2.5]" />
                      <span>Adicionar</span>
                    </button>
                  </form>

                  <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                    {projectDetail.tasks.map((task: any) => {
                      const isDone = task.status === 'done';
                      return (
                        <div
                          key={task.id}
                          onClick={() => handleToggleTask(task.id)}
                          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                            isDone
                              ? 'bg-white/[0.01] border-white/5 line-through opacity-50'
                              : 'bg-white/[0.02] border-white/10 hover:border-primary/40'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors ${
                                isDone ? 'bg-primary border-primary text-black' : 'border-neutral-600'
                              }`}
                            >
                              {isDone && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                            <span className="font-medium text-white">{task.title}</span>
                          </div>
                          <span className="text-[10px] font-mono text-neutral-500">{task.estimated_hours}h est.</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Tab 3: Materials Checklist */}
              {activeTab === 'materials' && (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {projectDetail.materials.map((mat: any) => (
                    <div key={mat.id} className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-2 text-xs">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-mono uppercase text-neutral-500 block">{mat.category}</span>
                          <h4 className="font-bold text-white uppercase mt-0.5">{mat.description}</h4>
                        </div>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold uppercase bg-white/5 border border-white/10 text-neutral-300">
                          {mat.status}
                        </span>
                      </div>
                      {mat.solution_details && (
                        <p className="text-[11px] text-neutral-400 border-l-2 border-primary/40 pl-2 font-mono">
                          Solução: {mat.solution_details}
                        </p>
                      )}
                    </div>
                  ))}
                  {projectDetail.materials.length === 0 && (
                    <p className="text-xs text-neutral-500 text-center py-10 font-sans">
                      O checklist de materiais será gerado automaticamente quando o briefing de produção for enviado pelo cliente.
                    </p>
                  )}
                </div>
              )}

              {/* Tab 4: Revisions */}
              {activeTab === 'revisions' && (
                <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                  {projectDetail.revisions.map((rev: any) => (
                    <div key={rev.id} className="p-4 rounded-xl border border-white/10 bg-white/[0.02] space-y-1.5 text-xs">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-white uppercase">Revisão #{rev.revision_number}</span>
                        <span className="text-[10px] text-neutral-500 font-mono">Solicitante: {rev.requested_by}</span>
                      </div>
                      <p className="text-neutral-300 leading-relaxed font-sans">{rev.description}</p>
                    </div>
                  ))}
                  {projectDetail.revisions.length === 0 && (
                    <p className="text-xs text-neutral-500 text-center py-10 font-sans">
                      Nenhuma solicitação de alteração aberta pelo cliente até o momento.
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="h-64 flex flex-col items-center justify-center text-xs text-neutral-500 space-y-2">
              <FolderGit2 className="w-8 h-8 text-neutral-600" />
              <span>Selecione um projeto à esquerda para gerenciar tarefas e cronograma.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
