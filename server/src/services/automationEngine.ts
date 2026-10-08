import { run, query, get } from '../db/database.js';
import crypto from 'crypto';
import { enqueueJob } from './agentQueueService.js';
import { generateMaterialsChecklistFromBriefing } from './materialsChecklistService.js';

export interface AutomationTriggerEvent {
  event: 'LEAD_CREATED' | 'LEAD_QUALIFIED' | 'BRIEFING_COMPLETED' | 'PROPOSAL_ACCEPTED' | 'MATERIAL_SUBMITTED' | 'TASK_COMPLETED';
  payload: Record<string, any>;
}

export const dispatchAutomationEvent = async (event: AutomationTriggerEvent) => {
  console.log(`[Automation Engine] Evento disparado: ${event.event}`, event.payload);

  const activeAutomations = query(
    `SELECT * FROM automations WHERE trigger_event = ? AND is_active = 1`,
    [event.event]
  );

  for (const auto of activeAutomations) {
    try {
      const conditions: Array<{ field: string; operator: string; value: any }> = JSON.parse(auto.conditions_json || '[]');
      const actions: Array<Record<string, any>> = JSON.parse(auto.actions_json || '[]');

      // Check conditions
      let matches = true;
      for (const cond of conditions) {
        const actualVal = event.payload[cond.field];
        if (cond.operator === '==' && actualVal !== cond.value) matches = false;
        if (cond.operator === '!=' && actualVal === cond.value) matches = false;
        if (cond.operator === '>=' && Number(actualVal) < Number(cond.value)) matches = false;
        if (cond.operator === '<=' && Number(actualVal) > Number(cond.value)) matches = false;
      }

      if (!matches) {
        continue;
      }

      console.log(`[Automation Engine] Executando regra "${auto.name}" (ID: ${auto.id})...`);
      const executionResults: any[] = [];

      // Execute actions
      for (const act of actions) {
        if (act.action === 'CREATE_NOTIFICATION') {
          run(
            `INSERT INTO notifications (id, title, message, category, type, is_read, created_at)
             VALUES (?, ?, ?, 'automation', ?, 0, CURRENT_TIMESTAMP)`,
            [`notif_${crypto.randomBytes(6).toString('hex')}`, act.title, `Automação "${auto.name}" disparada.`, act.type || 'info']
          );
          executionResults.push({ action: act.action, status: 'created_notification' });
        } else if (act.action === 'ENQUEUE_JOB') {
          const jobId = enqueueJob(act.jobType, event.payload, 15);
          executionResults.push({ action: act.action, jobId });
        } else if (act.action === 'GENERATE_MATERIALS_CHECKLIST') {
          const answers = event.payload.answers || {};
          const checklist = generateMaterialsChecklistFromBriefing(answers);
          for (const item of checklist) {
            run(
              `INSERT INTO material_requirements (id, project_id, briefing_id, description, category, is_mandatory, responsible, status, solution_type, solution_details, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
              [
                `mat_${crypto.randomBytes(6).toString('hex')}`,
                event.payload.projectId || null,
                event.payload.briefingId || null,
                item.description,
                item.category,
                item.isMandatory ? 1 : 0,
                item.responsible,
                item.status,
                item.solutionType,
                item.solutionDetails,
              ]
            );
          }
          executionResults.push({ action: act.action, itemsGenerated: checklist.length });
        } else if (act.action === 'UPDATE_STAGE' && event.payload.leadId) {
          const targetStage = get('SELECT id FROM crm_stages WHERE code = ?', [act.stageCode]);
          if (targetStage) {
            run('UPDATE leads SET stage_id = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', [targetStage.id, event.payload.leadId]);
            executionResults.push({ action: act.action, stageCode: act.stageCode });
          }
        }
      }

      // Log successful automation run
      run(
        `INSERT INTO automation_runs (id, automation_id, trigger_event, status, payload_json, result_json, executed_at)
         VALUES (?, ?, ?, 'success', ?, ?, CURRENT_TIMESTAMP)`,
        [
          `run_${crypto.randomBytes(6).toString('hex')}`,
          auto.id,
          event.event,
          JSON.stringify(event.payload),
          JSON.stringify(executionResults),
        ]
      );

      // Increment counter
      run(
        `UPDATE automations 
         SET execution_count = execution_count + 1, last_triggered_at = CURRENT_TIMESTAMP 
         WHERE id = ?`,
        [auto.id]
      );
    } catch (err: any) {
      console.error(`[Automation Engine] Erro ao executar automação ${auto.id}:`, err);
      run(
        `INSERT INTO automation_runs (id, automation_id, trigger_event, status, payload_json, error_message, executed_at)
         VALUES (?, ?, ?, 'failed', ?, ?, CURRENT_TIMESTAMP)`,
        [
          `run_${crypto.randomBytes(6).toString('hex')}`,
          auto.id,
          event.event,
          JSON.stringify(event.payload),
          err.message,
        ]
      );
    }
  }
};
