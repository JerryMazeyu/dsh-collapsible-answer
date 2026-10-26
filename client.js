window.__ModuleLoader__.load({
  id: '@local/dsh-collapsible-answer',
  factory(require) {
    const React = require('react')
    const primitives = require('@deepseek-ai/dsh-client-ui-primitives')

    const h = React.createElement
    const MarkdownText = primitives.MarkdownText
    const JsonBlock = primitives.JsonBlock
    const IconChevronRightOutlineRegular = primitives.IconChevronRightOutlineRegular
    const IconThinkOutlineRegular = primitives.IconThinkOutlineRegular

    const NS = 'collapsible-reply'
    const PKG = '@local/dsh-collapsible-answer'
    const CSS_ID = PKG + '/collapsible-reply.css'

    /** Heading levels that become sections; deeper headings stay in the body. */
    const SECTION_MAX_LEVEL = 3
    /** A section longer than this many characters starts folded. */
    const FOLD_MIN_CHARS = 240
    /** A section longer than this many lines starts folded. */
    const FOLD_MIN_LINES = 6

    const en = {
      'sections.expandAll': 'Expand all',
      'sections.collapseAll': 'Collapse all',
      'reasoning.title': 'Thinking',
      'reasoning.running': 'Thinking…',
      'reply.stopped': 'Stopped',
      'reply.unknownBlock': 'Unknown block',
      'json.truncated': '{total} more',
      'copy': 'Copy',
      'copied': 'Copied',
      'codeBlock.title': 'Code',
      'codeBlock.wrap': 'Wrap lines',
      'codeBlock.unwrap': 'Unwrap lines',
      'markdown.footnotes': 'Footnotes',
    }

    const zh = {
      'sections.expandAll': '展开全部',
      'sections.collapseAll': '收起全部',
      'reasoning.title': '思考',
      'reasoning.running': '思考中…',
      'reply.stopped': '已停止',
      'reply.unknownBlock': '未知内容块',
      'json.truncated': '还有 {total} 项',
      'copy': '复制',
      'copied': '已复制',
      'codeBlock.title': '代码',
      'codeBlock.wrap': '自动换行',
      'codeBlock.unwrap': '取消换行',
      'markdown.footnotes': '脚注',
    }

    const CSS = [
      '.dshcr-root{display:flex;flex-direction:column;gap:6px;min-width:0;max-width:100%;}',
      '.dshcr-toolbar{display:flex;justify-content:flex-end;margin:2px 0 -2px;}',
      '.dshcr-toggle-all{margin:0;padding:3px 6px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:18px;cursor:pointer;}',
      '.dshcr-toggle-all:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);}',
      '.dshcr-toggle-all:focus-visible,.dshcr-section-header:focus-visible,.dshcr-reasoning-header:focus-visible{outline:2px solid var(--dsw-alias-brand-primary);outline-offset:1px;}',
      '.dshcr-section{display:flex;flex-direction:column;gap:2px;min-width:0;}',
      '.dshcr-section-header{display:flex;align-items:center;gap:6px;width:100%;margin:0;padding:3px 6px 3px 4px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-weight:600;text-align:left;cursor:pointer;user-select:text;-webkit-user-select:text;}',
      'button.dshcr-section-header:hover{background:var(--dsw-alias-bg-layer-1);}',
      '.dshcr-section-header[data-static]{cursor:default;}',
      '.dshcr-section-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.dshcr-section-spacer{display:inline-flex;flex:none;width:16px;height:16px;}',
      '.dshcr-section-body{min-width:0;padding:0 0 2px 22px;}',
      '.dshcr-chevron{display:inline-flex;flex:none;align-items:center;justify-content:center;width:16px;height:16px;transition:transform .12s ease;}',
      '.dshcr-chevron>svg{display:block;width:16px;height:16px;}',
      '.dshcr-chevron[data-open]{transform:rotate(90deg);}',
      '.dshcr-reasoning{display:flex;flex-direction:column;gap:2px;min-width:0;}',
      '.dshcr-reasoning-header{display:flex;align-items:center;gap:6px;margin:0;padding:3px 6px 3px 4px;border:0;border-radius:6px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12px;line-height:18px;text-align:left;cursor:pointer;}',
      '.dshcr-reasoning-header:hover{color:var(--dsw-alias-label-primary);background:var(--dsw-alias-bg-layer-1);}',
      '.dshcr-reasoning-icon{display:inline-flex;flex:none;align-items:center;justify-content:center;width:14px;height:14px;}',
      '.dshcr-reasoning-icon>svg{display:block;width:14px;height:14px;}',
      '.dshcr-reasoning-title{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}',
      '.dshcr-reasoning-body{padding:0 0 2px 22px;}',
      '.dshcr-stopped{color:var(--dsw-alias-label-secondary);font-size:12px;line-height:18px;opacity:.8;}',
      '@media (prefers-reduced-motion: reduce){.dshcr-chevron{transition:none;}}',
    ].join('\n')

    /**
     * Turn inline Markdown into plain label text.
     *
     * @param value - raw inline Markdown.
     * @returns display text without markup.
     */
    function stripInline(value) {
      return value
        .replace(/!\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/`([^`]*)`/g, '$1')
        .replace(/(\*\*|__)(.*?)\1/g, '$2')
        .replace(/(\*|_)(.*?)\1/g, '$2')
        .replace(/~~(.*?)~~/g, '$1')
        .replace(/\s+/g, ' ')
        .trim()
    }

    /**
     * Split one Markdown text block into a lead and level-1..3 heading sections.
     * Headings inside fenced code never split.
     *
     * @param text - one assistant text block.
     * @returns the lead plus ordered sections.
     */
    function splitSections(text) {
      const sections = []
      const lead = []
      let current = null
      let fence = null
      const push = (line) => {
        if (current === null) lead.push(line)
        else current.body.push(line)
      }
      for (const line of text.split(/\r?\n/)) {
        if (fence !== null) {
          push(line)
          const close = /^\s{0,3}(`{3,}|~{3,})\s*$/.exec(line)
          if (close !== null && close[1][0] === fence.char && close[1].length >= fence.length) fence = null
          continue
        }
        const open = /^\s{0,3}(`{3,}|~{3,})(.*)$/.exec(line)
        if (open !== null) {
          fence = { char: open[1][0], length: open[1].length }
          push(line)
          continue
        }
        const heading = /^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line)
        if (heading !== null && heading[1].length <= SECTION_MAX_LEVEL) {
          const title = stripInline(heading[2]) || heading[2].trim()
          current = { level: heading[1].length, title, body: [] }
          sections.push(current)
          continue
        }
        push(line)
      }
      return {
        lead: lead.join('\n').trim(),
        sections: sections.map((section) => ({
          level: section.level,
          title: section.title,
          body: section.body.join('\n').trim(),
        })),
      }
    }

    /**
     * Whether a section is long enough to start folded.
     *
     * @param body - section Markdown without its heading.
     * @returns true when the body deserves a disclosure row.
     */
    function isFoldable(body) {
      return body.length > FOLD_MIN_CHARS || body.split('\n').length > FOLD_MIN_LINES
    }

    /**
     * Whether the reader currently holds a text selection. A heading click that
     * ends a selection (for example while annotating the heading) must not also
     * toggle the section.
     *
     * @returns true when a non-empty selection exists.
     */
    function selectionActive() {
      const selection = window.getSelection()
      return selection !== null && selection.isCollapsed === false && selection.toString().trim() !== ''
    }

    /**
     * @param t - locale seat for this plugin namespace.
     * @returns labels for the shared Markdown renderer's code chrome.
     */
    function markdownLabels(t) {
      return {
        code: {
          copyLabel: t('copy'),
          copiedLabel: t('copied'),
          toolbarLabels: {
            codeLabel: t('codeBlock.title'),
            wrapLabel: t('codeBlock.wrap'),
            unwrapLabel: t('codeBlock.unwrap'),
          },
        },
        footnotes: t('markdown.footnotes'),
      }
    }

    function Chevron(props) {
      return h('span', {
        className: 'dshcr-chevron',
        'data-open': props.open ? 'true' : undefined,
        'aria-hidden': 'true',
      }, h(IconChevronRightOutlineRegular, null))
    }

    /** Compact reasoning disclosure kept independent of the reply state. */
    function ReasoningPart(props) {
      const openState = React.useState(false)
      const open = openState[0]
      const setOpen = openState[1]
      return h('div', { className: 'dshcr-reasoning' },
        h('button', {
          type: 'button',
          className: 'dshcr-reasoning-header',
          'aria-expanded': open,
          onClick: () => setOpen((value) => !value),
        },
          h(Chevron, { open }),
          h('span', { className: 'dshcr-reasoning-icon', 'aria-hidden': 'true' }, h(IconThinkOutlineRegular, null)),
          h('span', { className: 'dshcr-reasoning-title' }, props.running ? props.t('reasoning.running') : props.t('reasoning.title'))
        ),
        open
          ? h('div', { className: 'dshcr-reasoning-body' },
            h(MarkdownText, {
              text: props.text,
              streaming: props.running,
              labels: props.labels,
              variant: 'compact',
            }))
          : null
      )
    }

    /**
     * Replacement renderer for `assistant-step`: the opening stays visible, and
     * each long `##` section folds under a clickable heading.
     */
    function CollapsibleAssistantStep(props) {
      const node = props.node
      const data = node.data
      const blocks = data.blocks
      const streaming = data.status === 'running'
      const interrupted = data.status === 'interrupted'
      const t = props.t
      const labels = React.useMemo(() => markdownLabels(t), [t])

      const sectionStates = React.useState(null)
      const sectionState = sectionStates[0]
      const setSectionState = sectionStates[1]
      const states = sectionState ?? {}

      const visible = React.useMemo(() => {
        const out = []
        for (const block of blocks) {
          if (block === undefined || block === null) continue
          if (block.kind === 'tool-call') continue
          if (props.groupPart === 'reasoning' && block.kind !== 'reasoning') continue
          if (props.groupPart === 'response' && block.kind === 'reasoning') continue
          if ((block.kind === 'text' || block.kind === 'reasoning') && block.text.trim() === '') continue
          out.push(block)
        }
        return out
      }, [blocks, props.groupPart])

      const inlineReasoningFolded = props.turnProcess !== undefined
        && props.turnProcess.foldable
        && props.turnProcess.spec.answerStep === data.step
        && props.turnProcess.spec.inlineReasoning
        && !props.turnProcess.open

      const shown = inlineReasoningFolded ? visible.filter((block) => block.kind !== 'reasoning') : visible
      const textBlocks = shown.filter((block) => block.kind === 'text')
      const textSignature = textBlocks.map((block) => block.text).join('\u0000')
      const parsed = React.useMemo(
        () => textBlocks.map((block) => splitSections(block.text)),
        [textSignature]
      )

      if (shown.length === 0 && !interrupted) return null

      const foldableKeys = []
      parsed.forEach((parsedBlock, blockIndex) => {
        parsedBlock.sections.forEach((section, index) => {
          if (isFoldable(section.body)) foldableKeys.push(blockIndex + ':' + index)
        })
      })

      const sectionIsOpen = (key) => states[key] === true || (streaming && states[key] !== false)
      const anyOpen = foldableKeys.some((key) => sectionIsOpen(key))
      const toggleAll = () => {
        const next = !anyOpen
        setSectionState((previous) => {
          const out = { ...(previous ?? {}) }
          for (const key of foldableKeys) out[key] = next
          return out
        })
      }

      const bodyChildren = []
      let textCursor = 0
      let toolbarPlaced = false
      const showToolbar = foldableKeys.length >= 2 && !streaming

      const renderSection = (key, section, streamLast) => {
        const foldable = isFoldable(section.body)
        const open = foldable && sectionIsOpen(key)
        const body = section.body === ''
          ? null
          : h('div', { className: 'dshcr-section-body', key: 'body-' + key },
            h(MarkdownText, {
              text: section.body,
              streaming: streaming && streamLast,
              labels,
            }))
        if (!foldable) {
          return h('div', { className: 'dshcr-section', key: 'section-' + key },
            h('div', { className: 'dshcr-section-header', 'data-static': '' },
              h('span', { className: 'dshcr-section-spacer', 'aria-hidden': 'true' }),
              h('span', { className: 'dshcr-section-title' }, section.title)
            ),
            body
          )
        }
        const toggle = () => setSectionState((previous) => ({
          ...(previous ?? {}),
          [key]: !sectionIsOpen(key),
        }))
        return h('div', { className: 'dshcr-section', key: 'section-' + key },
          h('div', {
            className: 'dshcr-section-header',
            role: 'button',
            tabIndex: 0,
            'aria-expanded': open,
            onClick: () => {
              if (selectionActive()) return
              toggle()
            },
            onDoubleClick: () => {
              if (selectionActive()) toggle()
            },
            onKeyDown: (event) => {
              if (event.key !== 'Enter' && event.key !== ' ') return
              event.preventDefault()
              toggle()
            },
          },
            h(Chevron, { open }),
            h('span', { className: 'dshcr-section-title' }, section.title)
          ),
          open ? body : null
        )
      }

      for (let index = 0; index < shown.length; index += 1) {
        const block = shown[index]
        if (block.kind === 'text') {
          const parsedBlock = parsed[textCursor]
          const streamThis = streaming && textCursor === parsed.length - 1
          if (parsedBlock.lead !== '') {
            bodyChildren.push(h(MarkdownText, {
              key: 'lead-' + textCursor,
              text: parsedBlock.lead,
              streaming: streamThis,
              labels,
            }))
          }
          parsedBlock.sections.forEach((section, sectionIndex) => {
            if (!toolbarPlaced && showToolbar) {
              toolbarPlaced = true
              bodyChildren.push(h('div', { className: 'dshcr-toolbar', key: 'toolbar' },
                h('button', {
                  type: 'button',
                  className: 'dshcr-toggle-all',
                  onClick: toggleAll,
                }, anyOpen ? t('sections.collapseAll') : t('sections.expandAll'))))
            }
            bodyChildren.push(renderSection(
              textCursor + ':' + sectionIndex,
              section,
              sectionIndex === parsedBlock.sections.length - 1
            ))
          })
          textCursor += 1
          continue
        }
        if (block.kind === 'reasoning') {
          bodyChildren.push(h(ReasoningPart, {
            key: 'reasoning-' + index,
            text: block.text,
            running: streaming && index === shown.length - 1,
            labels,
            t,
          }))
          continue
        }
        if (block.kind === 'image') {
          const group = [block]
          let cursor = index + 1
          while (cursor < shown.length && shown[cursor].kind === 'image') {
            group.push(shown[cursor])
            cursor += 1
          }
          bodyChildren.push(h(React.Fragment, { key: 'images-' + index },
            props.renderSlot('conversation.chat.message.images', {
              images: group.map((item) => ({ attachment: item.attachment })),
              loadImage: props.loadImage,
              align: 'start',
            })))
          index = cursor - 1
          continue
        }
        bodyChildren.push(h(JsonBlock, {
          key: 'unknown-' + index,
          label: t('reply.unknownBlock'),
          payload: block.block,
          truncatedLabel: (total) => t('json.truncated', { total }),
        }))
      }

      if (interrupted && props.groupPart !== 'reasoning') {
        bodyChildren.push(h('span', { key: 'stopped', className: 'dshcr-stopped' }, t('reply.stopped')))
      }

      return h('div', {
        className: 'dshcr-root',
        'data-collapsible-reply': '',
        'data-streaming': streaming ? 'true' : undefined,
      }, bodyChildren)
    }

    function apply(ctx) {
      ctx.effect(() => {
        const selector = 'style[data-plugin-css="' + CSS_ID + '"]'
        if (document.querySelector(selector) !== null) return () => {}
        const tag = document.createElement('style')
        tag.dataset.plugin = PKG
        tag.dataset.pluginCss = CSS_ID
        tag.textContent = CSS
        document.head.appendChild(tag)
        return () => {
          tag.remove()
        }
      })

      ctx.effect(() => ctx.locale.register(NS, { en, zh }))

      ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({
        name: 'conversation.chat.node',
        key: 'assistant-step',
        priority: -1,
        locale: NS,
      }, CollapsibleAssistantStep))
    }

    return { inject: ['slots', 'locale'], apply }
  },
})
