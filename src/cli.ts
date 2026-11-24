#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { parseArgs } from 'node:util';
import {
  FAILURE_CLASSES,
  type FailureClass,
  assertExecutionResult,
  assertTaskBrief,
} from './contracts.js';
import { buildContext, initProject } from './context.js';
import { approveTask, completeTask, dispatchTask, getLedgerPath, retryTask } from './dispatch.js';
import { readLedger } from './ledger.js';
import { parseMarkdownFile } from './parser.js';
import { validateRepo } from './validate.js';

function parsePositiveIntFlag(raw: string | undefined, fallback: number, flagName: string): number {
  if (raw === undefined) return fallback;
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${flagName} must be a positive integer (received '${raw}')`);
  }
  return parsed;
}

function printUsage(): void {
  console.log(`Usage: thienlabs <command> [options]

Commands:
  validate [--json]                                                 Validate contracts, links, isolation, and src/ DAG
  build-context --project <id> --agent <agent_id> [--max-chars <n>] Build authorized context envelope for an agent
  init-project --id <id> --name <name> [--dry-run]                  Scaffold a new project unit and register it
  dispatch --brief <path> [--dry-run]                               Prepare authorized Antigravity prompt & log dispatch
  complete --brief <path> --result <json-or-file>                   Record ExecutionResult, handoff, or Level 3 gate
  retry --brief <path> --failure-class <class> --summary <text>     Record classified retry or trip max_step_retries
  approve --task <id> --decision <approved|rejected> [--notes <t>]  Record Director decision on a paused Level 3 task
  status [--project <id>] [--task <id>]                             Summarize latest task states from runtime/ledger.jsonl
  simulate [--project <id>] [--json]                                Run isolated end-to-end outer-loop multi-agent simulation`);
}

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2);
  if (!command || command === '--help' || command === '-h') {
    printUsage();
    return;
  }

  const rootDir = process.cwd();

  if (command === 'validate') {
    const { values } = parseArgs({
      args: rest,
      options: { json: { type: 'boolean', default: false } },
    });
    const res = validateRepo(rootDir);
    if (values.json) {
      console.log(JSON.stringify(res, null, 2));
      if (res.errors.length > 0) process.exitCode = 1;
      return;
    }
    if (res.errors.length > 0) {
      console.error(`Validation failed (${res.errors.length} errors across ${res.checkedFiles} files):`);
      for (const err of res.errors) console.error(`  - ${err}`);
      process.exitCode = 1;
      return;
    }
    console.log(`Checked ${res.checkedFiles} markdown files. ALL CHECKS PASSED`);
    return;
  }

  if (command === 'build-context') {
    const { values } = parseArgs({
      args: rest,
      options: {
        project: { type: 'string' },
        agent: { type: 'string' },
        brief: { type: 'string' },
        'max-files': { type: 'string' },
        'max-chars': { type: 'string' },
      },
    });
    if (!values.project || !values.agent) {
      throw new Error('build-context requires --project <id> and --agent <agent_id>');
    }
    const briefSources = values.brief
      ? assertTaskBrief(parseMarkdownFile(path.resolve(rootDir, values.brief)).frontmatter ?? {}, values.brief).sources
      : [];
    const maxFiles = parsePositiveIntFlag(values['max-files'], 12, '--max-files');
    const maxTotalChars = parsePositiveIntFlag(values['max-chars'], 48000, '--max-chars');
    const envelope = buildContext({
      rootDir,
      projectId: values.project,
      agentId: values.agent,
      briefSources,
      maxFiles,
      maxTotalChars,
    });
    console.log(
      JSON.stringify(
        {
          project: envelope.project.project_id,
          agent: envelope.agent.agent_id,
          access_classification: envelope.agent.access_classification,
          loaded_files: envelope.files.map((f) => ({ path: f.path, classification: f.classification })),
          skipped: envelope.skipped,
        },
        null,
        2,
      ),
    );
    return;
  }

  if (command === 'init-project') {
    const { values } = parseArgs({
      args: rest,
      options: {
        id: { type: 'string' },
        name: { type: 'string' },
        'dry-run': { type: 'boolean', default: false },
      },
    });
    if (!values.id || !values.name) {
      throw new Error('init-project requires --id <id> and --name <name>');
    }
    console.log(
      JSON.stringify(
        initProject({
          rootDir,
          projectId: values.id,
          name: values.name,
          dryRun: values['dry-run'],
        }),
        null,
        2,
      ),
    );
    return;
  }

  if (command === 'dispatch') {
    const { values } = parseArgs({
      args: rest,
      options: {
        brief: { type: 'string' },
        'dry-run': { type: 'boolean', default: false },
      },
    });
    if (!values.brief) {
      throw new Error('dispatch requires --brief <path-to-task-brief.md>');
    }
    const output = dispatchTask({
      rootDir,
      briefPath: values.brief,
      dryRun: values['dry-run'],
    });
    console.log(JSON.stringify(output, null, 2));
    return;
  }

  if (command === 'complete') {
    const { values } = parseArgs({
      args: rest,
      options: {
        brief: { type: 'string' },
        result: { type: 'string' },
      },
    });
    if (!values.brief || !values.result) {
      throw new Error('complete requires --brief <path> and --result <json-or-file>');
    }
    const rawResult = fs.existsSync(path.resolve(rootDir, values.result))
      ? fs.readFileSync(path.resolve(rootDir, values.result), 'utf8')
      : values.result;
    const parsedResult = assertExecutionResult(JSON.parse(rawResult));
    const res = completeTask({
      rootDir,
      briefPath: values.brief,
      result: parsedResult,
    });
    console.log(JSON.stringify(res, null, 2));
    return;
  }

  if (command === 'retry') {
    const { values } = parseArgs({
      args: rest,
      options: {
        brief: { type: 'string' },
        'failure-class': { type: 'string' },
        summary: { type: 'string' },
      },
    });
    if (
      !values.brief ||
      !values['failure-class'] ||
      !FAILURE_CLASSES.includes(values['failure-class'] as FailureClass) ||
      !values.summary
    ) {
      throw new Error(
        `retry requires --brief <path> --failure-class <${FAILURE_CLASSES.join('|')}> --summary <text>`,
      );
    }
    console.log(
      JSON.stringify(
        retryTask({
          rootDir,
          briefPath: values.brief,
          failureClass: values['failure-class'] as FailureClass,
          summary: values.summary,
        }),
        null,
        2,
      ),
    );
    return;
  }

  if (command === 'approve') {
    const { values } = parseArgs({
      args: rest,
      options: {
        task: { type: 'string' },
        decision: { type: 'string' },
        notes: { type: 'string', default: '' },
      },
    });
    if (!values.task || (values.decision !== 'approved' && values.decision !== 'rejected')) {
      throw new Error('approve requires --task <task_id> and --decision <approved|rejected>');
    }
    console.log(
      JSON.stringify(
        approveTask({
          rootDir,
          taskId: values.task,
          decision: values.decision,
          notes: values.notes,
        }),
        null,
        2,
      ),
    );
    return;
  }

  if (command === 'status') {
    const { values } = parseArgs({
      args: rest,
      options: {
        project: { type: 'string' },
        task: { type: 'string' },
      },
    });
    const events = readLedger(getLedgerPath(rootDir));
    const latestByTask = new Map<string, (typeof events)[number]>();
    for (const ev of events) {
      if (values.project && ev.project_id !== values.project) continue;
      if (values.task && ev.task_id !== values.task) continue;
      latestByTask.set(ev.task_id, ev);
    }
    console.log(JSON.stringify(Array.from(latestByTask.values()), null, 2));
    return;
  }

  if (command === 'simulate') {
    const { values } = parseArgs({
      args: rest,
      options: {
        project: { type: 'string', default: 'ferry' },
        json: { type: 'boolean', default: false },
      },
    });
    const projectId = values.project ?? 'ferry';
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'thienlabs-sim-'));
    const scenarios: Array<{ name: string; status: 'pass' | 'fail'; details: string }> = [];

    try {
      fs.cpSync(path.join(rootDir, 'organization'), path.join(tmp, 'organization'), { recursive: true });
      if (fs.existsSync(path.join(rootDir, 'docs'))) {
        fs.cpSync(path.join(rootDir, 'docs'), path.join(tmp, 'docs'), { recursive: true });
      }
      fs.cpSync(path.join(rootDir, 'projects', projectId), path.join(tmp, 'projects', projectId), {
        recursive: true,
      });

      // Scenario 1: Validate copied project & organization artifacts
      const val = validateRepo(tmp);
      scenarios.push({
        name: 'repo-validation',
        status: val.errors.length === 0 ? 'pass' : 'fail',
        details: val.errors.length === 0 ? `Checked ${val.checkedFiles} files` : val.errors.join('; '),
      });

      // Scenario 2: Cross-department handoff -> retry -> Level 3 approval -> resume -> complete
      const simTaskId = `TASK-${projectId.toUpperCase()}-SIM-001`;
      const briefRel = `projects/${projectId}/product/${simTaskId}.md`;
      fs.writeFileSync(
        path.join(tmp, briefRel),
        `---\ndoc_id: ${simTaskId}\nproject_id: ${projectId}\ndepartment: product\ndoc_type: task-brief\nowner: ${projectId}-prd-lead\ncreated_by: org-chief-of-staff\nparent_task_id: null\nstatus: active\npriority: medium\nhop_count: 1\nmax_hops: 4\napproval_stage: level-3\nworkflow_phase: implementation\naccess_classification: internal\nsources: []\n---\n# Outer-Loop Simulation Task\n`,
        'utf8',
      );
      dispatchTask({ rootDir: tmp, briefPath: briefRel });
      completeTask({
        rootDir: tmp,
        briefPath: briefRel,
        result: {
          status: 'handoff',
          summary: 'Sim handoff to marketing',
          evidence: [`projects/${projectId}/project-context.md`],
          handoff: { to_agent: `${projectId}-mkt-lead`, reason: 'Verify public messaging', deliverables: ['copy.md'] },
        },
      });
      const resumedHandoff = dispatchTask({ rootDir: tmp, briefPath: briefRel });
      retryTask({ rootDir: tmp, briefPath: briefRel, failureClass: 'tool', summary: 'Transient sim retry' });
      completeTask({
        rootDir: tmp,
        briefPath: briefRel,
        result: {
          status: 'needs_approval',
          summary: 'Sim ready for Director sign-off',
          evidence: ['npm test passed'],
          approval_request: {
            action_type: 'Release',
            target: projectId,
            reason: 'Outer-loop verification',
            risks: 'None (isolated temp simulation)',
            rollback_plan: 'Discard temp workspace',
          },
        },
      });
      approveTask({ rootDir: tmp, taskId: simTaskId, decision: 'approved', notes: 'Sim approved' });
      dispatchTask({ rootDir: tmp, briefPath: briefRel });
      const finalRes = completeTask({
        rootDir: tmp,
        briefPath: briefRel,
        result: { status: 'completed', summary: 'Post-approval phase completed', evidence: ['npm test passed'] },
      });
      scenarios.push({
        name: 'multi-dept-handoff-approval-lifecycle',
        status: resumedHandoff.owner === `${projectId}-mkt-lead` && finalRes.status === 'completed' ? 'pass' : 'fail',
        details: `resumedOwner=${resumedHandoff.owner}, finalStatus=${finalRes.status}`,
      });

      // Scenario 3: Context isolation & token budget check
      const env = buildContext({
        rootDir: tmp,
        projectId,
        agentId: `${projectId}-mkt-lead`,
        briefSources: [`projects/${projectId}/development/lead.md`],
        maxTotalChars: 4000,
      });
      const leaked = env.files.some((f) => f.path.replace(/\\/g, '/').includes('/development/'));
      scenarios.push({
        name: 'classification-isolation',
        status: !leaked ? 'pass' : 'fail',
        details: `loaded=${env.files.length}, skipped=${env.skipped.length}`,
      });
    } finally {
      fs.rmSync(tmp, { recursive: true, force: true });
    }

    const ok = scenarios.every((s) => s.status === 'pass');
    const report = { ok, project_id: projectId, timestamp: new Date().toISOString(), scenarios };
    console.log(JSON.stringify(report, null, 2));
    if (!ok) process.exitCode = 1;
    return;
  }

  throw new Error(`Unknown command '${command}'`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
});
