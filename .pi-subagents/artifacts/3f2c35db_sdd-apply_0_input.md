# Task for sdd-apply

Implement the remaining tasks (Task 4 to Task 8) in 'openspec/onboarding-marketing-overhaul.tasks.md' for the change 'onboarding-marketing-overhaul'. Note that Task 1, 2, and 3 are already implemented in the files 'lib/onboarding-i18n.ts', 'components/onboarding/OnboardingTour.tsx', and 'components/layout/Sidebar.tsx' respectively. You must implement the rest (DashboardShell integration, SetupForm language selector, landing page copy, privacy/terms translation, and the reset tour button). Run 'npm run test:run' and 'npx tsc --noEmit' to verify.

## Acceptance Contract
Acceptance level: checked
Completion is not accepted from prose alone. End with a structured acceptance report.

Criteria:
- criterion-1: Implement the requested change without widening scope

Required evidence: changed-files, tests-added, commands-run, residual-risks, no-staged-files

Finish with a fenced JSON block tagged `acceptance-report` in this shape:
Use empty arrays when no items apply; array fields contain strings unless object entries are shown.
```acceptance-report
{
  "criteriaSatisfied": [
    {
      "id": "criterion-1",
      "status": "satisfied",
      "evidence": "specific proof"
    }
  ],
  "changedFiles": [
    "src/file.ts"
  ],
  "testsAddedOrUpdated": [
    "test/file.test.ts"
  ],
  "commandsRun": [
    {
      "command": "command",
      "result": "passed",
      "summary": "short result"
    }
  ],
  "validationOutput": [
    "validation output or concise summary"
  ],
  "residualRisks": [
    "none"
  ],
  "noStagedFiles": true,
  "diffSummary": "short description of the diff",
  "reviewFindings": [
    "blocker: file.ts:12 - issue found, or no blockers"
  ],
  "manualNotes": "anything else the parent should know"
}
```