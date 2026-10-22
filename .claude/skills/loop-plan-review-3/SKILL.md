---
name: loop-plan-review-3
description: Interactive iterative review for plan and specification documents using fresh independent reviewer agents without the orchestrator's conversation history. Before reading the plan or repository, present blocker, critical, serious, medium, minor, and preference-level plan-defect options, explain each briefly, ask which levels to search, and wait for an explicit answer. Then verify, revise, score, and loop only within the selected severity scope until reviewer acceptance or the main orchestrator's mandatory development-ready stop. Use when the user invokes `/loop-plan-review-3` or `$loop-plan-review-3`, asks for plan review v3 with selectable depth, or wants to choose how strict an iterative plan review should be. The reviewer must run on exactly the same model and reasoning effort as the main orchestrator; never delegate the review to another model, assistant, agent, or external tool. Track every round in a user-language score table and the status-line state file.
---

# Loop Plan Review 3

## Hard Rule: The Reviewer Runs On The Orchestrator's Own Model

**The reviewer MUST run on exactly the same model and exactly the same reasoning effort as the main orchestrator running this skill.**

**Each scoring pass runs exactly one reviewer.** Never two or more in parallel, and never on different models to compare or combine results.

These are hard requirements, not defaults, preferences, or starting suggestions. This skill never selects, proposes, or falls back to any other model. It never routes the review to another assistant, coding agent, CLI, or review service, no matter what is installed or available in the environment.

If the orchestrator's own model or reasoning effort cannot be established, the loop stops and reports as incomplete. It never proceeds on a substitute.

Full requirements are in **Reviewer Runtime Parity** and **Reviewer Independence**.

## Overview

Run an interactive review-and-improve loop over a plan document. First require the user to choose which severity levels count. Then use fresh independent read-only reviewers running on the orchestrator's own model and effort, revise only in-scope plan defects, verify claims against repository evidence, and continue until the scoped acceptance criteria are met.

Execution-ready means that an implementer with repository access but no conversation history can follow the plan without guessing about goals, ordering, ownership, file-level targets, acceptance criteria, risks, validation, or fallback behavior.

## Mandatory Severity Selection

Before reading the plan, inspecting the repository, checking referenced files, or spawning a reviewer, ask which severity levels to search. This question is mandatory on every invocation, even when the invocation appears to imply a choice. Ask in the user's language, make it the only substantive response, end the turn, and wait for an explicit answer.

Present all options with short plain-language descriptions:

1. **Blockers** — implementation cannot safely begin: the goal or required decision is missing, stages fundamentally contradict each other, or the plan depends on a mechanism that does not exist.
2. **Critical** — following the plan could cause catastrophic harm: data loss, security or privacy exposure, unauthorized access, incorrect payments, or an unsafe irreversible rollout.
3. **Serious** — implementation is likely to fail or require major rework: a required stage or dependency is missing, repository facts are materially wrong, ordering is broken, or essential validation, migration, rollback, or acceptance criteria are absent.
4. **Medium** — the main implementation path is viable, but meaningful edge cases, recovery behavior, monitoring, rollout thresholds, or secondary validation are underspecified.
5. **Minor** — an experienced implementer can proceed, but local ambiguity, an imprecise reference, weak wording, or a small consistency gap creates avoidable friction.
6. **Preferences / optional polish** — formatting, alternative organization, extra detail, or architectural taste that does not materially change execution safety.
7. **All levels** — search levels 1 through 6.

Ask one direct question such as:

```text
Which levels should this plan review search? Reply with numbers or names, for example `1-3`, `1,2,4`, or `7`. For an everyday practical review, levels 1-3 are recommended.
```

- Do not silently choose a default.
- Do not start review work until the user answers.
- Accept ranges, lists, names, or an unambiguous natural-language choice.
- If the answer is ambiguous, ask one short clarification and continue waiting.
- Confirm the normalized scope in one short sentence before beginning work.

## Severity Scope Contract

Treat the selected levels as the review and acceptance boundary for the entire loop.

- Search deliberately only for selected severity levels.
- Report, revise, score, and continue only because of in-scope findings.
- Do not report optional lists of unselected lower-level findings, reduce the score because of them, or spend tokens polishing them.
- Do not promote or demote a finding to fit the chosen scope. Classify it by execution impact, likelihood, reach, reversibility, and cost of rework.
- Treat wording, formatting, speculative hardening, and alternative structure as level 6 unless a concrete higher-impact execution failure is demonstrated.
- Classify missing validation by the consequence of the implementation error it would fail to detect, not automatically as serious.
- If an unmistakable critical security/privacy, payment, or irreversible data-loss risk is discovered incidentally outside the selected scope, surface it once as a safety override. Do not broaden the review or silently revise the plan without user direction.
- Allow the user to change scope later. Apply the new scope only after explicit confirmation and label subsequent rounds with it.

Every score is scoped. A score of 9.5/10 means no unresolved actionable findings remain in the selected levels; it does not claim that unselected levels were reviewed or are clean.

## Plan Altitude

A plan states intent, boundaries, ordering, acceptance, risk, and fallback. It is not speculative code.

- Keep the plan at the level of approach and rejected alternatives, stage ordering and coupling, ownership, concrete repository anchors, observable acceptance criteria, risks with thresholds, rollout, and rollback.
- Do not require full SQL, generated migration bodies, final code, exact implementation signatures, or conclusions that can only be proved by execution.
- When a claim depends on runtime behavior such as performance, query plans, code generation, or lock duration, encode it as: named hypothesis, earliest-stage experiment, acceptance threshold, and fallback.
- Do not run experiments during plan review. If the plan already records hypothesis, experiment, threshold, and fallback, the unknown runtime answer is not a finding.
- Treat unnecessary code-level detail as a finding only when its actual impact falls within the selected severity scope.

## Mandatory Orchestrator Development-Ready Stop

Treat plan review as a gate to safe implementation, not a demand for a perfect document. The main orchestrator that owns the upcoming implementation must stop the loop as soon as the plan is ready to build.

- After processing and validating every scoring pass, explicitly decide whether implementation can safely begin now.
- Require a successful stop even below 9.5/10 or with remaining reviewer comments as soon as the orchestrator determines all of the following:
  - goal, scope, ordering, ownership, repository anchors, and acceptance criteria are sufficient to start without dangerous guessing;
  - no blocker, critical safety risk, or unresolved security, privacy, payment, data-loss, or irreversible-rollout issue remains;
  - no unanswered product decision or material repository contradiction is likely to cause wrong behavior or major rework;
  - every remaining comment is implementation-local, can be settled by an early experiment already bounded by threshold and fallback, or can be safely found and fixed during implementation and `loop-code-review-3`.
- Never defer a known plan-level defect to code review when it could select the wrong product behavior, break a contract or migration, expose data, make rollback unsafe, or force major architectural rework.
- This decision is a hard stop, not an optional override. Once the gate passes, do not continue reviewing, polishing, or ask the user whether to run another pass unless the user explicitly requests more review after seeing the final result.
- When this gate passes, state in the user's language: "The plan is ready for development; remaining acceptable issues will be handled during implementation and code review." List only concrete remaining risks worth carrying forward.
- Label this result as **accepted by the main orchestrator as development-ready**, not as reviewer acceptance or a 9.5 score.
- Do not launch another scoring pass merely to raise the score or polish the plan after this gate passes.

## Plan Scope

- Review the plan path supplied with the invocation. If absent, use the plan most recently created or discussed; if ambiguous, ask which document to review after severity selection.
- Identify grounding sources before the first scoring pass: product specification or TZ, data-model and architecture documents, and code areas the plan references.
- Pass source paths to reviewers, never parent conclusions.
- Edit only the plan and directly coupled plan documents explicitly in scope. Never implement the planned code during this loop.
- Preserve unrelated user changes. Do not stage, commit, reset, stash, or push unless explicitly requested.

## Reviewer Independence

Independent review means the reviewer runs on the orchestrator's own model and effort and may share filesystem and repository state, but must not inherit parent conversation history, reasoning, assumptions, tool results, or prior review discussion.

Independence comes from a fresh context only. A different model, assistant, or tool is not a source of independence and must never be used to obtain it.

**Exactly one reviewer per scoring pass.** A scoring pass launches a single reviewer agent, waits for its complete output, and produces exactly one score.

- Never run two or more reviewers at the same time, in parallel, or as a fan-out, ensemble, panel, tie-breaker, second opinion, or cross-check.
- Never launch reviewers on different models to compare, combine, average, reconcile, or vote on their findings and scores.
- Never launch an extra reviewer because the first one is slow, cheap to duplicate, or might miss something, or because the environment makes parallel agents easy.
- One round has exactly one reviewer, one model, and one score. If a round would produce more than one score, the design is wrong; stop and run a single reviewer instead.
- Additional reviewers are sequential only: a fresh reviewer starts after the previous round is fully processed, and only for the reasons listed in the workflow.
- Start every scoring reviewer as a fresh agent in an isolated conversation context.
- Pass a self-contained prompt with repository location, plan path, grounding-source paths, selected severity levels and definitions, and validation expectations.
- Require the reviewer to read the plan and independently inspect repository evidence before scoring.
- Treat follow-up clarification from the same reviewer as clarification, not a new scoring pass.

## Reviewer Runtime Parity

The reviewer agent MUST run on exactly the same model and at exactly the same reasoning effort as the orchestrator revising the plan. Both are mandatory. Neither may be traded for the other.

Required before every scoring pass:

- Resolve the orchestrator's own running model and its actual reasoning-effort setting first, then launch the reviewer with both identical.
- Match the model exactly: same model, same version or variant identifier. Not a sibling model, not a smaller or larger one from the same family, not a "reviewer" or "reasoning" variant.
- Match reasoning effort exactly: `low` with `low`, `medium` with `medium`, `high` with `high`, `xhigh` with `xhigh`, `max` with `max`, and any other supported level with the identical level.
- Use guaranteed native inheritance when it preserves the orchestrator's exact model and effort while keeping context isolated; otherwise pass both explicitly at launch.
- Record the exact runtime model name from launch configuration or runtime metadata. Never infer, translate, shorten, or guess it.

Prohibited without exception:

- Selecting, proposing, or defaulting to any model other than the orchestrator's own, for any reason.
- Routing the review to a separate assistant, coding agent, CLI, subscription, API, or external review service, even when one is installed, configured, available, cheaper, faster, idle, or appears better suited to reviewing.
- Treating a different model or tool as a way to achieve reviewer independence. Independence comes only from a fresh, isolated context.
- Promoting the reviewer because it is reviewing, or downgrading its model or effort to save cost, tokens, quota, or time.
- Using a reviewer preset, role, agent type, or configuration whose model or fixed effort differs from the orchestrator's current model and effort.
- Substituting a stand-in when the orchestrator's model or effort cannot be determined.

If exact model parity or exact effort parity cannot be established, do not launch the reviewer and do not count a pass. Stop and report the loop as incomplete, naming which parity could not be established.

The only permitted deviation is an explicit, unambiguous instruction from the user to run the reviewer on a specific different model. Never infer this from context, environment, or convenience. When it happens, state the deviation in the round table and in the Final Response.

Always report the model that actually reviewed the plan.

## Review Dimensions

Apply these dimensions only where they can produce findings in the selected severity levels:

- **Execution readiness:** Can an implementer execute each stage without guessing about responsibility, inputs, outputs, dependencies, or completion?
- **Repository grounding:** Do referenced files, schemas, routes, APIs, commands, boundaries, and existing behavior actually match the repository?
- **Ordering and coverage:** Are stages correctly ordered, and are required producers, consumers, migrations, rollout steps, and coupled surfaces included?
- **Decisions and scope:** Are product choices, exclusions, ownership, alternatives, and assumptions explicit? Never invent an open product decision.
- **Acceptance and validation:** Are observable outcomes, failure cases, test boundaries, operational checks, rollout thresholds, and recovery criteria sufficient for the selected severity?
- **Risk and fallback:** Are meaningful failure modes, rollback, data safety, compatibility, and experiment fallbacks covered?
- **Plan altitude:** Does the plan avoid pretending that unimplemented code or unrun experiments are settled facts?

Do not chase score-only polish.

## Workflow

1. Complete **Mandatory Severity Selection** and wait for the user's answer.

2. Resolve and inspect the plan:
   - Determine the plan document unambiguously.
   - Read it end to end.
   - Locate grounding sources and referenced code surfaces.
   - Keep edits inside plan scope; do not implement code.

3. Validate the current plan before requesting a score:
   - Verify factual claims against repository evidence: paths exist, schemas and routes match, commands are real, and referenced behavior is current.
   - Check internal consistency, stage ordering, cross-references, and agreement with the governing spec/TZ.
   - Correct only validation failures in the selected levels.
   - If an out-of-scope problem prevents meaningful review, stop and ask whether to expand scope; do not silently revise it.
   - Record the evidence checked so the reviewer can verify it independently.

4. Start exactly one independent reviewer, never two or more at once:
   - Apply **Reviewer Runtime Parity** before launching: confirm the orchestrator's own model and reasoning effort, and launch the reviewer on both identically. If either cannot be confirmed, stop here and report the loop as incomplete instead of launching.
   - Start a fresh isolated conversation on that same model and effort.
   - Include plan path, grounding sources, exact selected levels and definitions, **Severity Scope Contract**, and **Plan Altitude** in the prompt.
   - Require read-only independent inspection, findings with plan-section and repository references, an execution-readiness summary, and a final scoped score from 1 to 10.

5. Process reviewer output:
   - Reject or discard findings outside the selected scope except the safety override. Never revise, reduce the score, or continue because of them.
   - Verify in-scope factual findings against repository evidence before revising.
   - Fix concrete in-scope defects: wrong or stale claims, missing or misordered stages, broken dependencies, absent acceptance or validation, unhandled risks, contradictions, and ambiguity that forces selected-level guessing.
   - Never accept 9.5+ while an unresolved in-scope actionable finding remains.
   - For an open product decision, pause and present up to two options with a recommendation. Resume only after the user decides and the decision is recorded.
   - For runtime uncertainty, use hypothesis + experiment + threshold + fallback rather than arguing or adding speculative implementation detail.
   - Clarification from the same reviewer is not a new scoring pass, and its original score cannot be reused after an actionable finding.
   - If the reviewer scores below 9.5 with no in-scope actionable findings, ask once for the concrete in-scope blocker. Accept an explicit no-in-scope-findings signal when none is supplied.
   - If output remains malformed or shows no credible understanding, use a fresh reviewer.
   - Apply **Mandatory Orchestrator Development-Ready Stop** after verified revisions. If it passes, end the loop immediately; otherwise continue only when another pass could prevent a material implementation risk rather than pursue plan perfection.

6. Report the completed round:
   - Add it to the running table using **Score Trajectory Report**.
   - Show selected scope and exact reviewer model.
   - Refresh the status-line score file at the same moment.

7. Validate after every meaningful revision:
   - Re-verify changed factual claims against repository evidence.
   - Re-check consistency, ordering, cross-references, and spec agreement.
   - Never accept while required selected-scope validation is red or an in-scope product decision remains unanswered.

8. Repeat:
   - Use a fresh reviewer after revisions, evidence-based rejection, or malformed output. Never reuse a score after an actionable finding.
   - Accept through either of two explicit paths: reviewer acceptance (selected-scope validation passes, no unresolved in-scope findings or product decisions remain, and the latest reviewer scores at least 9.5/10 or reports no in-scope actionable findings) or the **Mandatory Orchestrator Development-Ready Stop**. The first path reached ends the loop immediately.
   - Use at most five scoring passes unless the user requests another limit or persistence until acceptance.
   - Treat two unchanged passes repeating rejected, stale, or out-of-scope comments as stagnation.
   - Treat pass-limit exhaustion or stagnation without acceptance as incomplete, not success.
   - Stop at plan altitude when remaining questions require implementation experiments and the plan already contains the correct hypothesis, experiment, threshold, and fallback.

## Scoped Scoring Anchors

- **10.0:** No known selected-level plan defects or actionable improvements remain; factual grounding and internal validation are complete.
- **9.5:** No selected-level actionable findings remain; only unselected or subjective ideas may exist; grounding and validation are sufficient.
- **Below 9.5:** At least one meaningful selected-level finding, unanswered in-scope product decision, or required validation gap remains.

The score summarizes only chosen levels. It never overrides concrete in-scope findings, contradictions, or unverified claims. A score below 9.5 does not by itself require another pass when the main orchestrator has explicitly accepted the plan as development-ready under the gate above.

## Score Trajectory Report

- Maintain a running scoreboard. After the first round, before each subsequent pass, and once more in the Final Response, print exactly one table in the user's language and plain wording. Do not add an English duplicate.
- For intermediate updates, the table is the entire update with no prose above or below it.
- Use these translated columns:
  - **Round:** completed round number.
  - **Search scope:** selected plan-defect levels for that round.
  - **Model:** exact runtime model name that actually reviewed that round; never substitute or guess it.
  - **Score:** scoped X/10 execution-readiness score.
  - **Most serious in-scope finding:** blocker, critical, serious, medium, minor, preference, or none in plain words.
  - **Why we continue or stop:** one short plain-language reason.
- Translate findings for a non-programmer and keep each cell to one short line.
- When a score dips, explain that a real in-scope defect surfaced which earlier rounds missed.

Example in Russian; render it in the user's language with the selected scope and the real runtime model name. `<модель>` below is a placeholder for the model that actually ran — never print a placeholder or copy an example value into a real table.

| Раунд | Что искали | Модель | Оценка | Самая серьёзная находка | Почему продолжаем или стоп |
|-------|-------------|--------|--------|--------------------------|-----------------------------|
| 1 | Блокеры, критические, серьёзные | `<модель>` | 8,0 | Серьёзная | В плане пропустили обязательную миграцию — добавили |
| 2 | Блокеры, критические, серьёзные | `<модель>` | 9,5 | Нет | В выбранных уровнях замечаний не осталось |

## Status-line Round Feed

Mirror scores into a small state file for a live status line. Refresh it whenever the table is printed and clear it when the loop finishes. Failure here must never block or alter review.

- Key the file by repository root, falling back to `$PWD` outside Git:
  `RF="$HOME/.Codex/statusline-state/loop-review/$(printf '%s' "$(git rev-parse --show-toplevel 2>/dev/null || printf '%s' "$PWD")" | sed 's#[^A-Za-z0-9]#_#g')"`
- Write one `<sev>:<score>` segment per round, joined by `;`, latest last. Start with `plan|`.
- Map severity as: `c` = blocker/critical/serious, `m` = medium, `s` = minor/preference, `n` = no in-scope findings.
- Example: `mkdir -p "$(dirname "$RF")" && printf 'plan|%s\n' "c:8,0;n:9,5" > "$RF"`
- Remove the file in the Final Response with `rm -f "$RF"` after printing the final table.

## Reviewer Prompt Template

```text
Review the plan at <plan-path> independently. You have no parent conversation history. Derive findings only from the plan, grounding documents, repository state, and tool output you inspect yourself. Stay read-only: do not edit, stage, commit, reset, stash, push, implement code, or run experiments.

Plan goal: <one-line goal>
Grounding sources: <spec/TZ, architecture/data docs, referenced code areas>

Selected severity scope:
- <selected levels and their exact plan-specific definitions>

This is a hard acceptance boundary. Search only selected levels. Do not report unselected lower-severity findings, reduce the score for them, request revisions for them, or reclassify findings to fit the scope. An unmistakable incidentally discovered critical security/privacy, payment, or irreversible data-loss risk may be surfaced once as a safety override without broadening the search.

Treat the plan as a statement of intent, not speculative code. Review approach, rejected alternatives, stage ordering and dependencies, ownership and boundaries, repository grounding, observable acceptance criteria, validation, risks, rollout, rollback, and fallback behavior. Do not demand code-level implementation details or run experiments. Runtime uncertainty belongs in the plan as hypothesis + earliest experiment + threshold + fallback.

Could an implementer with repository access but no other context execute the plan without guessing at the selected severity levels? Return only in-scope findings in severity order, each with a plan-section reference, supporting repository evidence, and plain execution impact. Flag in-scope open product decisions separately. Clearly state when no in-scope actionable findings exist. Then summarize the plan's approach, ordering, invariants, risks, and validation so understanding is demonstrated.

End with a scoped score from 1 to 10: 10 when no selected-level defect remains and grounding is complete; 9.5 when no selected-level actionable finding remains and only out-of-scope or subjective ideas may exist; below 9.5 only when a selected-level finding, unanswered selected-level product decision, or required validation gap remains. State the concrete in-scope issue preventing 9.5.
```

## Final Response

- Print the final trajectory table with selected scope and exact reviewer model per round.
- State which plan-defect levels were reviewed and explicitly state that unselected levels were not assessed.
- Report plan revisions and why, scoped acceptance signal, pass count, and whether the loop passed, stopped incomplete, or was interrupted.
- State whether acceptance came from the reviewer or from the main orchestrator's development-ready decision. For the latter, state that implementation may begin and name any concrete risks intentionally handed to implementation and code review.
- Confirm model and reasoning-effort parity for every counted round.
- Report repository claims verified, user product decisions, intentionally unchanged in-scope findings, safety overrides, altitude stops, and remaining risks.
- Remove the status-line state file after printing the final table.
