#!/usr/bin/env node
import fs from 'node:fs';
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
  status [--project <id>] [--task <id>]                             Summarize latest task states from runtime/ledger.jsonl`);
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

  throw new Error(`Unknown command '${command}'`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
});
