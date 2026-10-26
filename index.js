/**
 * Host half of the collapsible-reply bundle.
 *
 * Registers one system-prompt section so replies read as a complete, concise
 * answer with optional depth underneath: the opening is always visible, and
 * `##` sections only carry detail a reader may skip. The Client half renders
 * that shape.
 */

/** Stable prompt-section name; keep it unique so an agent preset can shadow it. */
const SECTION = 'collapsible-reply:reply-shape'

/** Late placement: after tool guidance, before the deployment persona suffix. */
const SECTION_ORDER = 9950

const PROMPT = `## Reply shape for a collapsible transcript

This chat keeps the opening of a reply visible and folds long \`##\` sections under their headings. A reader who never expands must still get the complete answer.

- The opening — everything before the first \`##\` heading — is the complete answer: the result, conclusion, or recommendation, written concisely (aim for one to five short lines, or up to three bullets). It must be understandable on its own.
- Use \`##\` sections only for optional depth a reader can skip: evidence, examples, edge cases, extended reasoning, logs, command output, alternatives. Never move a required result, warning, error, or file path into a section.
- One topic per heading, at most four; headings are short noun phrases. A section that repeats the opening is noise.
- Short answers have no sections at all: just the concise, complete answer.
- Tables, code fences, long lists, and logs belong inside a section, never in the opening.
- Write in the language of the conversation.`

export const inject = ['systemPrompt']

/**
 * Register the prompt section for the lifetime of the plugin.
 *
 * @param ctx - Host plugin context.
 */
export function apply(ctx) {
  ctx.effect(() => ctx.systemPrompt.section({
    name: SECTION,
    order: SECTION_ORDER,
    text: PROMPT,
  }))
}
