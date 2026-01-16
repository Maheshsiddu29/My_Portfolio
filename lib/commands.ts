import { profile } from '@/lib/resume'

export type OutputChunk =
  | { kind: 'text'; lines: string[] }
  | { kind: 'section'; title: string; lines: string[] }
  | { kind: 'links'; title: string; links: { label: string; href: string }[] }

export type CommandResult = {
  chunks: OutputChunk[]
  openUrl?: string
}

function section(title: string, lines: string[]): OutputChunk {
  return { kind: 'section', title, lines }
}

function text(lines: string[]): OutputChunk {
  return { kind: 'text', lines }
}

function links(title: string, items: { label: string; href: string }[]): OutputChunk {
  return { kind: 'links', title, links: items }
}

function formatList(items: string[], bullet = '• '): string[] {
  return items.map((x) => `${bullet}${x}`)
}

export function runCommand(raw: string): CommandResult {
  const input = raw.trim()
  if (!input) return { chunks: [] }

  // sudo passthrough: `sudo about` -> `about`
  const tokens = input.split(/\s+/)
  let cmd = tokens[0].toLowerCase()
  let args = tokens.slice(1)
  if (cmd === 'sudo' && args.length) {
    cmd = args[0].toLowerCase()
    args = args.slice(1)
  }

  switch (cmd) {
    case 'help':
      return {
        chunks: [
          section('commands', [
            'help                      show this menu',
            'clear                     clear the screen',
            'whoami                    quick intro',
            'sudo about                full profile',
            'skills                    skill groups',
            'experience                work timeline',
            'education                 academic background',
            'projects                  list projects',
            'cat projects/<id>         open a project (e.g., cat projects/medi-vault)',
            'open github|linkedin      open links',
            'contact                   contact details',
            'resume                    open/download resume'
          ]),
          text(['', 'Hints:', '• Use ↑/↓ for history', '• Ctrl+L clears', '• Try: sudo about'])
        ]
      }

    case 'clear':
      return { chunks: [text(['__CLEAR__'])] }

    case 'whoami':
      return {
        chunks: [
          section('whoami', [
            `${profile.name} — ${profile.tagline}`,
            `${profile.location}`,
            '',
            'Type `sudo about` for the full profile.'
          ])
        ]
      }

    case 'about':
      return {
        chunks: [
          section('about', [
            `${profile.name}`,
            `${profile.tagline}`,
            `${profile.location}`
          ]),
          section('focus', [
            'Blockchain engineering • ZK authentication • smart contracts • distributed systems • XR/3D product work'
          ]),
          section('quick facts', [
            `Email: ${profile.email}`,
            `Phone: ${profile.phone}`
          ]),
          links('links', [
            { label: 'GitHub', href: profile.links.github },
            { label: 'LinkedIn', href: profile.links.linkedin }
          ])
        ]
      }

    case 'skills': {
      const s = profile.skills
      return {
        chunks: [
          section('XR & Frontend', formatList(s.xr_frontend)),
          section('Cloud & DevOps', formatList(s.cloud_devops)),
          section('Software Engineering', formatList(s.software_eng)),
          section('Blockchain & Security', formatList(s.blockchain_security)),
          section('Languages', formatList(s.languages))
        ]
      }
    }

    case 'experience':
      return {
        chunks: [
          ...profile.experience.map((e) =>
            section(`${e.company} — ${e.role} (${e.dates})`, [
              `${e.location}`,
              ...formatList(e.bullets)
            ])
          )
        ]
      }

    case 'education':
      return {
        chunks: [
          ...profile.education.map((ed) =>
            section(`${ed.school}`, [
              `${ed.degree}${ed.date ? ' • ' + ed.date : ''}`,
              ed.location
            ])
          )
        ]
      }

    case 'projects':
    case 'ls': {
      const lines = profile.projects.map((p) => `projects/${p.id}  —  ${p.name} (${p.dates})`)
      return {
        chunks: [
          section('projects', [
            ...lines,
            '',
            'Open one with: cat projects/<id>'
          ])
        ]
      }
    }

    case 'cat': {
      const target = args.join(' ').trim()
      if (!target.startsWith('projects/')) {
        return { chunks: [text([`cat: ${target || '(missing path)'}: No such file`])] }
      }
      const id = target.replace(/^projects\//, '')
      const p = profile.projects.find((x) => x.id === id)
      if (!p) return { chunks: [text([`cat: ${target}: No such file`])] }

      const linkItems = Object.entries(p.links)
        .filter(([, v]) => v)
        .map(([k, v]) => ({ label: k.toUpperCase(), href: String(v) }))

      return {
        chunks: [
          section(p.name, [`${p.dates}`, ...formatList(p.bullets)]),
          ...(linkItems.length ? [links('project links', linkItems)] : [])
        ]
      }
    }

    case 'contact':
      return {
        chunks: [
          section('contact', [
            `Email: ${profile.email}`,
            `Phone: ${profile.phone}`,
            `Location: ${profile.location}`
          ]),
          links('online', [
            { label: 'GitHub', href: profile.links.github },
            { label: 'LinkedIn', href: profile.links.linkedin }
          ])
        ]
      }

    case 'open': {
      const what = (args[0] || '').toLowerCase()
      if (what === 'github') return { chunks: [text(['Opening GitHub…'])], openUrl: profile.links.github }
      if (what === 'linkedin') return { chunks: [text(['Opening LinkedIn…'])], openUrl: profile.links.linkedin }
      return { chunks: [text([`open: unknown target '${what}'. try: open github`])] }
    }

    case 'resume': {
      return {
        chunks: [
          section('resume', [
            'Opening resume…',
            'If the download doesn’t start, the file might be missing in /public.'
          ])
        ],
        openUrl: profile.links.resumePath
      }
    }

    default:
      return {
        chunks: [
          text([
            `${cmd}: command not found`,
            `try: help`
          ])
        ]
      }
  }
}
