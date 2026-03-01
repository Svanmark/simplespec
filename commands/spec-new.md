---
name: spec-new
description: Create a new product/engineering specification using our spec-driven development workflow. Use when asked to draft a new spec, define requirements, acceptance criteria, or produce a spec for a feature.
metadata:
  version: "0.1"
---

# /spec-new - Create a new simple spec

## Inputs

A text describing the idea for the feature to implement. It can be:
- A short description of the feature.
- A longer, more detailed description capturing requirements and approaches.
- Link(s) to relevant documents or resources. Link(s) to external project management tools like Jira or Confluence.

## Outputs
A spec file created at `.simplespec/specs/spec:<number>-<slug>.md` based on `.simplespec/templates/spec-template.md`. Theres an example spec available under `.simplespec/examples/example-spec.md`

### Slug Generation Rules
Generate the `<slug>` from the spec name using these rules:
- Convert to lowercase
- Replace spaces with hyphens
- Remove special characters (keep only alphanumeric and hyphens)
- Remove consecutive hyphens
- Trim hyphens from start/end
- Maximum 50 characters
- Examples:
  - "User Authentication" → `user-authentication`
  - "API Rate Limiting (v2)" → `api-rate-limiting-v2`
  - "Real-time Chat Feature!!!" → `real-time-chat-feature`

## Process
1. **Parse Input**: Extract key information from the input text or linked resources. If links are inaccessible, notify and ask for alternative sources or proceed with available information.

2. **Analyze Requirements**: Identify the main components, dependencies, and requirements of the feature. Consider:
   - Core functionality needed
   - System components affected
   - Integration points
   - Potential technical challenges

3. **Gather Missing Details**: Ask targeted questions only for crucial information gaps that significantly impact the spec. Examples of "major/crucial" details:
   - Target users or use cases that fundamentally change the approach
   - Performance requirements (scale, latency expectations)
   - Security or compliance requirements
   - Integration dependencies or constraints
   - MVP scope vs. future enhancements

4. **Complete Spec Sections**: Fill in all template sections with extracted and analyzed information. Ensure:
   - Each section captures all relevant details and is well-structured
   - Use "N/A" for sections that don't apply (with brief justification)
   - Leave "Open Questions" for items needing stakeholder input
   - Be specific and avoid vague language

5. **Break Down Tasks**: Create implementation tasks that are:
   - Independently testable and deployable
   - Sized appropriately (1-3 days of work ideally)
   - Ordered by logical dependencies
   - Formatted as markdown checkboxes
   - Include brief acceptance criteria per task

6. **Validate Completeness**: Review the spec against success criteria (see below). Iterate if:
   - Any required section is missing or too vague
   - Acceptance criteria are not measurable
   - Tasks are not granular enough or have unclear scope
   - Requirements contain ambiguities

7. **Handle Duplicates**: Before saving, check if a spec with similar name/slug exists in `.simplespec/specs/`. If found, either:
   - Append a numeric suffix to the slug (e.g., `-2`, `-3`)
   - Ask if this should update an existing spec

8. **Save Spec File**: Create the spec file with proper frontmatter metadata and naming:
   - Set `created_date` to current date in YYYY-MM-DD format
   - Set `last_updated` to creation date
   - Generate slug per rules above
   - Determine `<number>` by listing files in `.simplespec/specs/`, extracting existing `spec:<number>-*.md` prefixes, and using the next incremental number (start at `1` when none exist)

9. **Ask if user want to proceed to implementing the spec.**
    - Ask the user if they want to proceed with implementing the spec, providing options to:
    - Start implementation immediately, refer to the `spec-apply` skill.

## Error Handling

- **Inaccessible Links**: If external links can't be accessed, inform the user and  ask if you shall proceed with available information or request alternatives
- **Incomplete Input**: If critical information is missing and can't be inferred, ask specific questions rather than making assumptions
- **Duplicate Detection**: Check for existing specs with same/similar slugs before saving
- **Invalid Spec Name**: If the name can't generate a valid slug, ask for clarification

## Success Criteria

A high-quality spec should meet these criteria:
- ✅ All required template sections are completed (or marked N/A with justification)
- ✅ Summary clearly explains what and why in 2-3 sentences
- ✅ Goals and Non-goals are specific and mutually exclusive
- ✅ Requirements are unambiguous and verifiable
- ✅ Acceptance criteria are measurable and testable
- ✅ Implementation tasks are granular, ordered, and independently deliverable
- ✅ Risks identify potential issues with mitigation strategies
- ✅ No ambiguous or vague language (avoid "should", "might", "probably")
- ✅ Dependencies on other systems/specs are explicitly documented
- ✅ The spec can be handed off to an engineer without additional clarification
