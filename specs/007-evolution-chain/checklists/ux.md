# Checklist: UX & Layout Requirements Quality — Evolution Chain

**Purpose**: Validate that the spec's UX and layout requirements for the Evolution section are complete, specific, consistent, and measurable before a PR reviewer signs off.
**Created**: 2026-04-14
**Feature**: [spec.md](../spec.md)
**Audience**: PR reviewer

> These are "unit tests for English" — they evaluate the *requirements themselves*, not whether the implementation works.

## Requirement Completeness

- [ ] CHK001 — Are requirements defined for where the Evolution section sits in the page flow (above/below which other sections)? [Completeness, Spec §FR-001]
- [ ] CHK002 — Is the empty-chain copy ("This Pokémon does not evolve.") defined as exact wording, not just a description? [Completeness, Spec §FR-017]
- [ ] CHK003 — Are requirements specified for how arrow labels behave when the trigger data is missing or unrecognized? [Completeness, Spec §FR-005b]

## Requirement Clarity

- [ ] CHK004 — Is "visually highlighted" quantified with specific visual properties (border weight, shadow depth) rather than left as an adjective? [Clarity, Spec §FR-008]
- [ ] CHK005 — Is "comparable visual space" in the no-evolutions state measurable (e.g., matches a populated stage-card's height)? [Measurability, Spec §FR-018]
- [ ] CHK006 — Is "wide viewport" / "narrow viewport" defined by a specific breakpoint value or left implementation-decided? [Clarity, Spec §FR-006, §FR-007]
- [ ] CHK007 — Is the arrow-label requirement "MUST NOT become multi-line on desktop" quantified (e.g., max character count or `white-space: nowrap` rule)? [Clarity, Spec §FR-005a]

## Requirement Consistency

- [ ] CHK008 — Are the current-stage highlight requirements consistent with — and visually distinguishable from — the hover and focus-visible states described elsewhere in the app? [Consistency, Spec §FR-008]
- [ ] CHK009 — Is the "Evolution" section heading's typographic treatment aligned with the spec-level description of detail-page section headings (not just "visually consistent")? [Consistency, Spec §FR-003]

## Acceptance Criteria / Measurability

- [ ] CHK010 — Is SC-002 ("identify highlighted stage within 3 seconds") paired with a verification method, or left as qualitative? [Measurability, Spec §SC-002]
- [ ] CHK011 — Is the count of enumerated states in SC-007 consistent with the states enumerated in the spec body (spec says "all four states" but lists five)? [Consistency, Spec §SC-007]

## Scenario & Edge Case Coverage

- [ ] CHK012 — Are layout requirements specified for chains longer than the typical 3-stage Gen 1 cases (defensive breakpoint behavior)? [Coverage, Spec §Edge Cases]
- [ ] CHK013 — Are requirements defined for where keyboard focus should land after a user navigates via a chain card (spec says "SHOULD land somewhere predictable" without specifying)? [Clarity, Spec §Edge Cases]
- [ ] CHK014 — Are requirements specified for how the section renders when the main detail has loaded but the chain is still in flight? [Coverage, Spec §FR-020]
- [ ] CHK015 — Are branching-chain layout requirements defined for both desktop and mobile viewports (the spec covers linear layout per breakpoint but branching may inherit implicitly)? [Coverage, Spec §FR-010–FR-012]

## Ambiguities & Conflicts

- [ ] CHK016 — Does FR-002 ("section MUST always render") conflict with or duplicate FR-017/FR-018's no-evolve rules (umbrella vs specialization is acceptable, but worth flagging)? [Conflict, Spec §FR-002 vs §FR-017/018]
- [ ] CHK017 — Is the term "stage" / "chain member" used consistently across spec and data-model, or does one document use a term the other doesn't define? [Terminology, Spec §Key Entities]

## Notes

- Items marked `[Gap]` would indicate a missing requirement; none are present here because the clarify + analyze passes already filled the main gaps. What remains is a mix of Clarity, Measurability, Consistency, and Coverage questions.
- Every item above references a specific section of the spec — no purely-generic items.
- Follow-up: if a CHK item fails on review, the remediation is either a spec edit or (for Measurability/Clarity fails) the developer adds a CSS/test assertion making the requirement testable in code.
