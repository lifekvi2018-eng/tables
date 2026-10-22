---
name: loop-code-review-3
description: Interactive iterative code review for task-scoped active git changes using fresh independent reviewer agents without the orchestrator's conversation history. Before inspecting or reviewing anything, present the user with blocker, critical, serious, medium, minor, and preference-level review options, explain each briefly, ask which levels to search, and wait for an explicit answer. Then review, fix, validate, score, and loop only within the selected severity scope. Use when the user invokes `/loop-code-review-3` or `$loop-code-review-3`, asks for code review v3 with selectable depth, or wants to choose how strict an iterative review should be. The reviewer must run on exactly the same model and reasoning effort as the main orchestrator; never delegate the review to another model, assistant, agent, or external tool. Track every round in a user-language score table and the status-line state file.
---

# Loop Code Review 3

## Hard Rule: The Reviewer Runs On The Orchestrator's Own Model

**The reviewer MUST run on exactly the same model and exactly the same reasoning effort as the main orchestrator running this skill.**

**Each scoring pass runs exactly one reviewer.** Never two or more in parallel, and never on different models to compare or combine results.

These are hard requirements, not defaults, preferences, or starting suggestions. This skill never selects, proposes, or falls back to any other model. It never routes the review to another assistant, coding agent, CLI, or review service, no matter what is installed or available in the environment.

If the orchestrator's own model or reasoning effort cannot be established, the loop stops and reports as incomplete. It never proceeds on a substitute.

Full requirements are in **Reviewer Runtime Parity** and **Reviewer Independence**.

## Overview

Run an interactive review-and-fix loop over the current task's active git changes without reviewing unrelated worktree changes. First require the user to choose which severity levels count. Then use fresh independent read-only reviewer agents running on the orchestrator's own model and effort, address only in-scope findings, validate the result, and continue until the scoped acceptance criteria are met.

## Mandatory Severity Selection

Before inspecting the repository, running validation, reading diffs, or spawning a reviewer, ask the user which severity levels to search. This question is mandatory on every invocation, even if the invocation appears to imply a choice. Ask it in the user's language, make it the only substantive response, end the turn, and wait for an explicit answer.

Present all of these options with short plain-language descriptions:

1. **Blockers** — the change cannot be released or meaningfully tested: the app does not build or start, the primary flow is completely broken, or a migration can destroy data.
2. **Critical** — release is technically possible, but some users could face catastrophic harm: security or privacy exposure, unauthorized access, money errors, or irreversible data loss.
3. **Serious** — an important or common flow breaks or regularly produces a wrong result: changes do not save, requests duplicate, ordinary users cannot complete the main action, or common input crashes the service.
4. **Medium** — the main flow works, but a plausible edge case or recovery path is meaningfully worse: network recovery, unusual valid input, accessibility, performance, or misleading error behavior.
5. **Minor** — little direct user impact: local maintainability friction, small duplication, weak naming, or low-impact visual and structural imperfections.
6. **Preferences / optional polish** — subjective style, alternative refactors, extra abstraction, or aesthetic preferences that are not defects.
7. **All levels** — search levels 1 through 6.

Ask one direct question such as:

```text
Which levels should this review search? Reply with numbers or names, for example `1-3`, `1,2,4`, or `7`. For an everyday practical review, levels 1-3 are recommended.
```

- Do not silently choose a default.
- Do not start review work until the user answers.
- Accept ranges, lists, names, or an unambiguous natural-language selection.
- If the answer is ambiguous, ask one short clarification and continue waiting.
- Confirm the normalized selected scope in one short sentence before beginning work.

## Severity Scope Contract

Treat the user's selected levels as the review and acceptance boundary for the entire loop.

- Search deliberately only for selected severity levels.
- Report, fix, score, and continue the loop only because of findings in the selected levels.
- Do not report optional lists of unselected lower-severity findings, reduce the score because of them, or spend tokens polishing them.
- Do not promote or demote a finding merely to fit the selected scope. Classify it by actual impact, likelihood, reach, and recoverability.
- Classify missing or weak tests by the consequence of the regression they fail to protect, not automatically as serious.
- Treat vague complexity, architecture preferences, naming opinions, and speculative hardening as level 6 unless a concrete higher-impact failure scenario is demonstrated.
- If an unmistakable blocker, critical security/privacy exposure, or irreversible data-loss risk is discovered incidentally outside the selected scope, surface it once as a safety override. Do not broaden the search or automatically fix it without user direction unless higher-priority safety instructions require action.
- Allow the user to change the selected scope later. Apply the new scope only after explicit confirmation and label subsequent rounds with it.

Every score is scoped. A score of 9.5/10 means no unresolved actionable findings remain in the selected levels; it does not claim that unselected levels were reviewed or are clean.

## Review Purpose

Treat review as a structured handoff within the selected severity scope. Require the reviewer to reconstruct what the change does, how its important control or data flow works, which invariants it relies on, and why non-obvious decisions exist. Treat a comprehension obstacle as a finding only when it creates a concrete risk at a selected severity level.

Review comprehensibility and change safety alongside correctness, security, privacy, data integrity, UX, and operational behavior. Combine review with focused tests, static checks, builds, and runtime validation appropriate to the changed surface.

## Reviewer Independence

Independent review means the reviewer runs on the orchestrator's own model and effort and may share the same filesystem, repository state, and applicable project instructions, but must not inherit the parent thread's conversation history, reasoning, assumptions, tool results, or prior review discussion.

Independence comes from a fresh context only. A different model, assistant, or tool is not a source of independence and must never be used to obtain it.

**Exactly one reviewer per scoring pass.** A scoring pass launches a single reviewer agent, waits for its complete output, and produces exactly one score.

- Never run two or more reviewers at the same time, in parallel, or as a fan-out, ensemble, panel, tie-breaker, second opinion, or cross-check.
- Never launch reviewers on different models to compare, combine, average, reconcile, or vote on their findings and scores.
- Never launch an extra reviewer because the first one is slow, cheap to duplicate, or might miss something, or because the environment makes parallel agents easy.
- One round has exactly one reviewer, one model, and one score. If a round would produce more than one score, the design is wrong; stop and run a single reviewer instead.
- Additional reviewers are sequential only: a fresh reviewer starts after the previous round is fully processed, and only for the reasons listed in the workflow.
- Start each scoring reviewer as a fresh agent in an isolated conversation context without parent history.
- Pass a self-contained reviewer prompt containing only the repository location, task-owned scope, selected severity levels and definitions, validation expectations, and evidence the reviewer must independently verify.
- Require the reviewer to inspect `git status`, diffs, files, and validation output itself before scoring.
- Treat each scoring pass as coming from a fresh reviewer. Follow-up clarification from the same reviewer is not a new scoring pass.

## Reviewer Runtime Parity

The reviewer agent MUST run on exactly the same model and at exactly the same reasoning effort as the orchestrator that built or changed the code. Both are mandatory. Neither may be traded for the other.

Required before every scoring pass:

- Resolve the orchestrator's own running model and its actual reasoning-effort setting first, then launch the reviewer with both identical.
- Match the model exactly: same model, same version or variant identifier. Not a sibling model, not a smaller or larger one from the same family, not a "reviewer" or "reasoning" variant.
- Match reasoning effort exactly: `low` with `low`, `medium` with `medium`, `high` with `high`, `xhigh` with `xhigh`, `max` with `max`, and any other supported level with the identical level.
- Use guaranteed native inheritance when it preserves the orchestrator's exact model and effort while keeping context isolated. Otherwise pass both explicitly at launch.
- Record the exact runtime model name from launch configuration or runtime metadata. Never infer, translate, shorten, or guess it.

Prohibited without exception:

- Selecting, proposing, or defaulting to any model other than the orchestrator's own, for any reason.
- Routing the review to a separate assistant, coding agent, CLI, subscription, API, or external review service, even when one is installed, configured, available, cheaper, faster, idle, or appears better suited to reviewing.
- Treating a different model or tool as a way to achieve reviewer independence. Independence comes only from a fresh, isolated context.
- Promoting the reviewer because it is reviewing, or downgrading its model or effort to save cost, tokens, quota, or time.
- Using a reviewer role, preset, agent type, or configuration whose model or fixed reasoning effort differs from the orchestrator's current model and effort.
- Substituting a stand-in when the orchestrator's model or effort cannot be determined.

If exact model parity or exact effort parity cannot be established, do not launch the reviewer and do not count a pass. Stop and report the loop as incomplete, naming which parity could not be established.

The only permitted deviation is an explicit, unambiguous instruction from the user to run the reviewer on a specific different model. Never infer this from context, environment, or convenience. When it happens, state the deviation in the round table and in the Final Response.

Always report the model that actually ran.

## Review Scope

Review only changes belonging to the current user task, even when the worktree contains unrelated active changes.

- Identify task-owned files and, when necessary, task-owned hunks inside mixed files. Use task history and edits made during the task; do not infer ownership from `git status` alone.
- Include exact task scope and exclusions in the reviewer prompt. Use path-limited diffs where practical.
- Ask the user when file or hunk ownership is genuinely ambiguous.
- Allow neighboring code to be read for context, but limit findings to regressions introduced by scoped task changes.
- If scoped changes move while review runs, discard the stale score and use a fresh reviewer.

## Review Dimensions

Apply these dimensions only where they can produce findings in the selected severity levels:

- **Comprehensibility and change safety:** Reconstruct responsibility, flow, state transitions, invariants, and failure behavior. Raise only a specific obstacle with a concrete selected-level maintenance risk.
- **Correctness and operational risk:** Look for behavioral regressions, invalid assumptions, security/privacy exposure, data-integrity problems, poor failure handling, and unsafe operational consequences.
- **Test evidence:** Judge whether tests exercise changed behavior, fail for a plausible regression, assert an observable contract, and mock only real boundaries. Map coverage findings to the severity of the behavior left unprotected.
- **Reuse and local fit:** Recommend reuse only when a specific existing component, hook, utility, client, service, or integration is demonstrably better and avoiding it creates selected-level impact.
- **Architecture and conventions:** Treat deviation as a finding only when it violates an identifiable project rule or precedent and creates selected-level risk.

Do not chase score-only polish.

## Workflow

1. Complete **Mandatory Severity Selection** and wait for the user's answer.

2. Inspect the worktree:
   - Run `git status --short`, `git diff`, and `git diff --cached`.
   - Include relevant untracked files only when they belong to the current task.
   - Separate current-task changes from unrelated active work and record exact included paths or hunks.
   - Preserve unrelated user changes. Do not stage, commit, reset, stash, or push unless explicitly requested.

3. Validate the current scoped state before requesting a score:
   - Run the smallest meaningful tests, typecheck, lint, build, or focused scripts for the touched surface.
   - Fix validation failures only when they correspond to selected severity levels.
   - If an out-of-scope failure prevents meaningful review, stop and ask whether to expand the selected levels; do not fix it silently.
   - If an out-of-scope failure does not prevent review, record it as a validation note without expanding the loop or lowering the scoped score.
   - Record commands and results for independent verification.

4. Start exactly one independent reviewer, never two or more at once:
   - Apply **Reviewer Runtime Parity** before launching: confirm the orchestrator's own model and reasoning effort, and launch the reviewer on both identically. If either cannot be confirmed, stop here and report the loop as incomplete instead of launching.
   - Start a fresh isolated reviewer conversation on that same model and effort.
   - Include the selected severity levels, their exact definitions, and the **Severity Scope Contract** in the prompt.
   - Require read-only independent inspection, a comprehension summary, findings with file and line references, and a final scoped numeric score from 1 to 10.
   - If tests were added or changed, require a separate test-quality score and map any actionable test finding to a selected severity.

5. Process output:
   - Reject or discard every finding outside the selected scope except the defined safety override. Never fix it, reduce the score for it, or continue the loop because of it.
   - Fix concrete in-scope findings affecting comprehensibility, correctness, security, data integrity, UX, operations, or test coverage.
   - Never accept 9.5+ while the reviewer lists an unresolved in-scope actionable finding.
   - Verify rejected, stale, or architecture-conflicting findings. Clarification is not a new scoring pass and the original score cannot be reused for acceptance.
   - If the reviewer scores below 9.5 with no in-scope actionable findings, ask once what concrete in-scope issue prevents 9.5. Accept an explicit no-in-scope-findings signal when no issue is supplied.
   - If output remains malformed or demonstrates no credible understanding, use a fresh reviewer.

6. Report the completed round:
   - Add it to the running table using **Score Trajectory Report**.
   - Show the selected scope and exact reviewer model.
   - Refresh the status-line score file at the same moment.

7. Validate after every meaningful fix. Never accept while validation required for the selected scope is red.

8. Repeat:
   - Use a fresh reviewer after fixes, evidence-based rejection, or malformed review. Never reuse a score after an actionable finding was reported.
   - Accept only when required validation passes, no unresolved in-scope findings remain, and the latest reviewer either scores at least 9.5/10 or explicitly reports no in-scope actionable findings.
   - Use at most five scoring passes unless the user requests another limit or persistence until acceptance.
   - Treat two unchanged passes repeating rejected, stale, or out-of-scope comments as stagnation.
   - Pass-limit exhaustion or stagnation without acceptance is incomplete, not success.

## Scoped Scoring Anchors

- **10.0:** No known selected-level defects or actionable improvements remain; relevant validation is complete and green.
- **9.5:** No selected-level actionable findings remain; only unselected or subjective ideas may exist; relevant validation is sufficient and green.
- **Below 9.5:** At least one meaningful selected-level finding remains or required validation is missing or failing.

The score summarizes only the chosen levels. It never overrides concrete in-scope findings or required validation.

## Score Trajectory Report

- Maintain a running scoreboard. After the first round, before each subsequent pass, and once more in the Final Response, print exactly one table in the user's language and plain wording. Do not add an English duplicate.
- For intermediate updates, the table is the entire update with no prose above or below it.
- Use these translated columns:
  - **Round:** completed round number.
  - **Search scope:** selected severity levels for that round.
  - **Model:** exact runtime model name that actually reviewed that round; never substitute or guess it.
  - **Score:** scoped X/10 score.
  - **Most serious in-scope finding:** blocker, critical, serious, medium, minor, preference, or none in plain words.
  - **Why we continue or stop:** one short plain-language reason.
- Translate findings for a non-programmer and keep every cell to one short line.
- When a score dips, explain that a real in-scope issue surfaced which earlier rounds missed.

Example in Russian; render it in the user's language with the selected scope and the real runtime model name. `<модель>` below is a placeholder for the model that actually ran — never print a placeholder or copy an example value into a real table.

| Раунд | Что искали | Модель | Оценка | Самая серьёзная находка | Почему продолжаем или стоп |
|-------|-------------|--------|--------|--------------------------|-----------------------------|
| 1 | Блокеры, критические, серьёзные | `<модель>` | 8,0 | Серьёзная | Изменения иногда не сохранялись — починили |
| 2 | Блокеры, критические, серьёзные | `<модель>` | 9,5 | Нет | В выбранных уровнях замечаний не осталось |

## Status-line Round Feed

Mirror round scores into a small state file so a live status line can show them. Refresh it whenever the table is printed and clear it when the loop finishes. Failure here must never block or alter review.

- Key the file by repository root, falling back to `$PWD` outside Git:
  `RF="$HOME/.Codex/statusline-state/loop-review/$(printf '%s' "$(git rev-parse --show-toplevel 2>/dev/null || printf '%s' "$PWD")" | sed 's#[^A-Za-z0-9]#_#g')"`
- Write one `<sev>:<score>` segment per round, joined by `;`, latest last. Start the line with `code|`.
- Map severity as: `c` = blocker/critical/serious, `m` = medium, `s` = minor/preference, `n` = no in-scope findings.
- Example: `mkdir -p "$(dirname "$RF")" && printf 'code|%s\n' "c:8,0;n:9,5" > "$RF"`
- Remove the file in the Final Response with `rm -f "$RF"` after printing the final table.

## Reviewer Prompt Template

```text
Review only the task-scoped active changes in this workspace independently. The worktree may contain unrelated changes; ignore them unless the scoped changes depend on them or make them worse.

You have no parent conversation history. Derive findings only from repository state and tool output you inspect yourself. Stay read-only: do not edit, stage, commit, reset, stash, or push files.

Task scope:
- Included files/hunks: <exact task-owned scope>
- Excluded active changes: <exact exclusions>

Selected severity scope:
- <selected levels and their exact definitions>

This is a hard acceptance boundary. Deliberately search only selected levels. Do not report unselected lower-severity findings, reduce the score for them, or request fixes for them. Do not reclassify findings to fit the scope. An unmistakable incidentally discovered blocker, critical security/privacy exposure, or irreversible data-loss risk may be surfaced once as a safety override, without broadening the search.

Treat review as a handoff. Reconstruct the change, its important flow, invariants, and failure behavior. Report a comprehension, correctness, security, data, UX, operational, architecture, reuse, or test finding only when its concrete impact belongs to a selected level.

Return in-scope findings first in severity order with file/line references and plain user impact. Clearly state when none exist. Then explain the changed responsibility and important flow. If tests changed, give a separate test-quality score and classify any actionable gap by consequence. End with a scoped score from 1 to 10: 10 when no selected-level defect or actionable improvement remains and validation is complete; 9.5 when no selected-level actionable finding remains and only out-of-scope or subjective ideas may exist; below 9.5 only when a selected-level finding remains or required validation is missing/failing. State the concrete in-scope issue preventing 9.5.
```

## Final Response

- Print the final trajectory table with selected scope and exact reviewer model per round.
- State which severity levels were reviewed and explicitly state that unselected levels were not assessed.
- Report what changed and why, the scoped acceptance signal, pass count, and whether the loop passed, stopped incomplete, or was interrupted.
- Confirm model and reasoning-effort parity for every counted round.
- Report validation commands and results, test-quality score when applicable, intentionally unchanged in-scope findings, safety overrides, and remaining risks.
- Remove the status-line state file after printing the final table.
