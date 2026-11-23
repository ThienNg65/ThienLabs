#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';
import { type ExecutionResult, assertTaskBrief } from './contracts.js';
import { buildContext, initProject } from './context.js';
import { approveTask, completeTask, dispatchTask } from './dispatch.js';
import { parseMarkdownFile } from './parser.js';
import { validateRepo } from './validate.js';

function printUsage(): void {
  console.log(`Usage: thienlabs <command> [options]

Commands:
  validate                                            Validate YAML frontmatter, links, and isolation rules
  build-context --project <id> --agent <agent_id>     Build authorized context envelope for an agent
  init-project --id <id> --name <name> [--dry-run]    Scaffold a new project unit and register it
  dispatch --brief <path> [--dry-run]                 Prepare authorized Antigravity prompt & log dispatch
  complete --brief <path> --result <json-or-file>     Record ExecutionResult & trigger Level 3 gate if needed
  approve --task <id> --decision <approved|rejected>  Record Director decision on a paused Level 3 task`);
}

async function main(): Promise<void> {
  const [command, ...rest] = process.argv.slice(2);
  if (!command || command === '--help' || command === '-h') {
    printUsage();
    return;
  }

  const rootDir = process.cwd();

  if (command === 'validate') {
    const res = validateRepo(rootDir);
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
      },
    });
    if (!values.project || !values.agent) {
      throw new Error('build-context requires --project <id> and --agent <agent_id>');
    }
    const briefSources = values.brief
      ? assertTaskBrief(parseMarkdownFile(path.resolve(rootDir, values.brief)).frontmatter ?? {}, values.brief).sources
      : [];
    const maxFiles = values['max-files'] ? Number(values['max-files']) : 12;
    const envelope = buildContext({
      rootDir,
      projectId: values.project,
      agentId: values.agent,
      briefSources,
      maxFiles,
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
    const parsedResult = JSON.parse(rawResult) as ExecutionResult;
    const res = completeTask({
      rootDir,
      briefPath: values.brief,
      result: parsedResult,
    });
    console.log(JSON.stringify(res, null, 2));
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

  throw new Error(`Unknown command '${command}'`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
});
