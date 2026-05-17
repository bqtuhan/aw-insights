/**
 * Comprehensive Category Mapping Rule Set — the single source of truth
 * for classifying applications and domains across all platforms.
 *
 * PLATFORM COVERAGE:
 *   - **Desktop** (Windows / macOS / Linux): process names like "Code.exe",
 *     "Figma", "Xcode", "terminal" …
 *   - **Android** (aw-watcher-android): package names like "com.whatsapp"
 *     AND human‑readable labels like "WhatsApp".
 *   - **Web** (aw-watcher-web): full URLs like "https://github.com/ActivityWatch/…".
 *
 * EXTENDING RULES:
 *   To add a new rule, push an object `{ pattern: /your regex/i, category: '…' }`
 *   to the array below. Rules are matched in order — the **first** match wins.
 *   More specific patterns should appear before generic ones.
 *
 * @module modules/categories/rules
 */

import type { AppCategory, CategoryRule } from '@/types';

/**
 * The master rule set consumed by CategoryMapper.
 *
 * **Guidelines for contributions:**
 * 1. Use case‑insensitive regexes (`/… /i`).
 * 2. For desktop, match against the lowercased process name (e.g. "code.exe").
 * 3. For Android, match against the package name (e.g. "com.whatsapp")
 *    and / or the human label (e.g. "WhatsApp").
 * 4. For web, match against the full URL — include domain + common path prefixes.
 * 5. Put more specific patterns (e.g. "github.com" → Development) **before**
 *    generic ones (e.g. "github" → could be anything).
 */
export const RULE_SET: CategoryRule[] = [
  // ──────────────────────────────────────────────
  // DEVELOPMENT — IDEs, Editors, Terminals, Git, Dev Tools
  // ──────────────────────────────────────────────

  // Desktop IDEs & editors
  { pattern: /\b(vscode|code\.exe|code-insiders|visual studio code)\b/i, category: 'Development' },
  { pattern: /\b(intellij|idea\.exe|webstorm|pycharm|phpstorm|goland|rubymine|datagrip|clion|rider)\b/i, category: 'Development' },
  { pattern: /\b(sublime_text|sublimetext|subl\.exe)\b/i, category: 'Development' },
  { pattern: /\b(atom\.exe|atom)\b/i, category: 'Development' },
  { pattern: /\b(vim|gvim|neovim|nvim|macvim)\b/i, category: 'Development' },
  { pattern: /\b(emacs|spacemacs)\b/i, category: 'Development' },
  { pattern: /\b(notepad\+\+|notepadplus)\b/i, category: 'Development' },
  { pattern: /\b(xcode)\b/i, category: 'Development' },
  { pattern: /\b(zed|zed\.app)\b/i, category: 'Development' },
  { pattern: /\b(cursor)\b/i, category: 'Development' },

  // Terminals
  { pattern: /\b(terminal|iterm2?|warp|alacritty|kitty|wezterm|windows terminal|cmd\.exe|powershell|pwsh)\b/i, category: 'Development' },
  { pattern: /\b(gnome-terminal|konsole|xfce4-terminal|terminator|tilix|rxvt)\b/i, category: 'Development' },

  // Git & dev tools
  { pattern: /\b(sourcetree|gitkraken|gitgui|gitx|fork|tower)\b/i, category: 'Development' },
  { pattern: /\b(postman|insomnia|hoppscotch)\b/i, category: 'Development' },
  { pattern: /\b(docker desktop|docker\.exe)\b/i, category: 'Development' },
  { pattern: /\b(dbeaver|tableplus|mysql workbench|pgadmin|mongodb compass|redisinsight)\b/i, category: 'Development' },
  { pattern: /\b(studio 3t|robo 3t)\b/i, category: 'Development' },

  // Android packages — development
  { pattern: /\b(com\.termux|com\.oracle\.sqldeveloper|com\.github\.android)\b/i, category: 'Development' },

  // Web — dev platforms & docs
  { pattern: /github\.com/i, category: 'Development' },
  { pattern: /gitlab\.com/i, category: 'Development' },
  { pattern: /bitbucket\.org/i, category: 'Development' },
  { pattern: /stackoverflow\.com/i, category: 'Development' },
  { pattern: /dev\.to/i, category: 'Development' },
  { pattern: /(docs\.rs|rust-lang\.org)/i, category: 'Development' },
  { pattern: /pypi\.org/i, category: 'Development' },
  { pattern: /npmjs\.com/i, category: 'Development' },
  { pattern: /(localhost|127\.0\.0\.1|0\.0\.0\.0)(:\d+)?/i, category: 'Development' },

  // ──────────────────────────────────────────────
  // DESIGN — Figma, Adobe, Sketch, etc.
  // ──────────────────────────────────────────────

  { pattern: /\b(figma|figma\.exe)\b/i, category: 'Design' },
  { pattern: /\b(photoshop|photoshop\.exe|illustrator|indesign|after effects|premiere|lightroom|xd)\b/i, category: 'Design' },
  { pattern: /\b(adobe|creative cloud)\b/i, category: 'Design' },
  { pattern: /\b(sketch)\b/i, category: 'Design' },
  { pattern: /\b(affinity (designer|photo|publisher))\b/i, category: 'Design' },
  { pattern: /\b(gimp|inkscape|krita|blender)\b/i, category: 'Design' },
  { pattern: /\b(canvas?\.com|figma\.com)\b/i, category: 'Design' },
  { pattern: /\b(dribbble\.com|behance\.net)\b/i, category: 'Design' },

  // ──────────────────────────────────────────────
  // COMMUNICATION — Email, Chat, Video Calls
  // ──────────────────────────────────────────────

  // Desktop
  { pattern: /\b(slack|slack\.exe)\b/i, category: 'Communication' },
  { pattern: /\b(discord|discord\.exe)\b/i, category: 'Communication' },
  { pattern: /\b(microsoft teams|teams\.exe)\b/i, category: 'Communication' },
  { pattern: /\b(zoom|zoom\.exe|zoom meeting)\b/i, category: 'Communication' },
  { pattern: /\b(google meet|meet\.google)\b/i, category: 'Communication' },
  { pattern: /\b(skype|skype\.exe)\b/i, category: 'Communication' },
  { pattern: /\b(outlook|mail\.app|thunderbird|spark|airmail|apple mail)\b/i, category: 'Communication' },
  { pattern: /\b(gmail|mail\.google)\b/i, category: 'Communication' },
  { pattern: /\b(telegram|telegram desktop|telegram\.exe)\b/i, category: 'Communication' },
  { pattern: /\b(signal|signal\.exe)\b/i, category: 'Communication' },
  { pattern: /\b(whatsapp|whatsapp desktop|whatsapp\.exe)\b/i, category: 'Communication' },
  { pattern: /\b(messages|imessage)\b/i, category: 'Communication' },
  { pattern: /\b(messenger|facebook messenger)\b/i, category: 'Communication' },
  { pattern: /\b(wechat)\b/i, category: 'Communication' },
  { pattern: /\b(line)\b/i, category: 'Communication' },
  { pattern: /\b(viber)\b/i, category: 'Communication' },
  { pattern: /\b(element|riot)\b/i, category: 'Communication' },

  // Android packages — communication
  { pattern: /com\.(whatsapp|discord|slack|telegram\.messenger|signal|viber\.voip|facebook\.orca|messenger|skype\.raider|zoom\.us|teams)/i, category: 'Communication' },
  { pattern: /com\.(google\.android\.gm|outlook|yahoo\.mail|protonmail\.android|spark\.email|fastmail)/i, category: 'Communication' },
  { pattern: /com\.(linkedin\.android|twitter\.android|tweetdeck)/i, category: 'Communication' },
  { pattern: /com\.(reddit\.frontpage|joey\.reddit|slide\.reddits)/i, category: 'Communication' },

  // Web — email & messaging
  { pattern: /(mail\.google\.com|outlook\.office\.com|outlook\.live\.com|proton\.me)/i, category: 'Communication' },
  { pattern: /(web\.whatsapp\.com|web\.telegram\.org|discord\.com\/app)/i, category: 'Communication' },
  { pattern: /(teams\.microsoft\.com|zoom\.us\/j\/|meet\.google\.com)/i, category: 'Communication' },

  // ──────────────────────────────────────────────
  // BROWSING — General web browsing, search, news
  // ──────────────────────────────────────────────

  // Desktop browsers
  { pattern: /\b(google chrome|chrome\.exe|chromium|chromium-browser)\b/i, category: 'Browsing' },
  { pattern: /\b(firefox|firefox\.exe|firefox developer edition|firefox nightly)\b/i, category: 'Browsing' },
  { pattern: /\b(safari|safari\.app)\b/i, category: 'Browsing' },
  { pattern: /\b(edge|msedge|microsoft edge)\b/i, category: 'Browsing' },
  { pattern: /\b(brave|brave-browser|brave\.exe)\b/i, category: 'Browsing' },
  { pattern: /\b(opera|opera\.exe|vivaldi|arc|arc\.app)\b/i, category: 'Browsing' },

  // Android browsers
  { pattern: /com\.(android\.chrome|chrome\.beta|chrome\.dev|chromium|firefox|kiwi\.browser|brave\.browser|opera\.mini|opera\.browser|duckduckgo\.mobile\.android)/i, category: 'Browsing' },

  // Web — search engines & news
  { pattern: /(google\.com\/search|bing\.com\/search|duckduckgo\.com)/i, category: 'Browsing' },
  { pattern: /(wikipedia\.org|news\.ycombinator\.com)/i, category: 'Browsing' },
  { pattern: /(reddit\.com|old\.reddit\.com)/i, category: 'Browsing' },
  { pattern: /(news\.google\.com|bbc\.com|cnn\.com|reuters\.com|bloomberg\.com)/i, category: 'Browsing' },
  { pattern: /(medium\.com|substack\.com)/i, category: 'Browsing' },

  // ──────────────────────────────────────────────
  // PRODUCTIVITY — Notes, Docs, Tasks, Calendars
  // ──────────────────────────────────────────────

  // Desktop
  { pattern: /\b(obsidian|obsidian\.exe)\b/i, category: 'Productivity' },
  { pattern: /\b(notion|notion\.exe)\b/i, category: 'Productivity' },
  { pattern: /\b(evernote|evernote\.exe)\b/i, category: 'Productivity' },
  { pattern: /\b(onenote|onenote\.exe)\b/i, category: 'Productivity' },
  { pattern: /\b(logseq|logseq\.exe)\b/i, category: 'Productivity' },
  { pattern: /\b(roam research|roam)\b/i, category: 'Productivity' },
  { pattern: /\b(todoist|todoist\.exe|ticktick|things|omnifocus|reminders)\b/i, category: 'Productivity' },
  { pattern: /\b(microsoft (word|excel|powerpoint)|winword|excel\.exe|powerpnt)\b/i, category: 'Productivity' },
  { pattern: /\b(pages|numbers|keynote)\b/i, category: 'Productivity' },
  { pattern: /\b(libreoffice|openoffice|onlyoffice)\b/i, category: 'Productivity' },
  { pattern: /\b(google docs|google sheets|google slides|docs\.google)\b/i, category: 'Productivity' },
  { pattern: /\b(calendar|google calendar|outlook calendar|fantastical)\b/i, category: 'Productivity' },
  { pattern: /\b(linear|linear\.app|jira|asana|monday|clickup|trello)\b/i, category: 'Productivity' },
  { pattern: /\b(confluence)\b/i, category: 'Productivity' },
  { pattern: /\b(alfred|raycast|uebersicht)\b/i, category: 'Productivity' },
  { pattern: /\b(1password|bitwarden|lastpass|dashlane)\b/i, category: 'Productivity' },

  // Android packages — productivity
  { pattern: /com\.(notion\.notion|evernote|microsoft\.office\.onenote|todoist|ticktick|anydo|google\.android\.apps\.docs|google\.android\.apps\.sheets|google\.android\.calendar|google\.android\.keep|microsoft\.todo|todo\.ist)/i, category: 'Productivity' },
  { pattern: /com\.(trello|asana|slack\.projects)/i, category: 'Productivity' },
  { pattern: /com\.(bitwarden|lastpass|onepassword)/i, category: 'Productivity' },

  // Web — docs & productivity
  { pattern: /(docs\.google\.com|sheets\.google\.com|slides\.google\.com|notion\.so)/i, category: 'Productivity' },
  { pattern: /(linear\.app|jira\.atlassian\.com|asana\.com|trello\.com)/i, category: 'Productivity' },
  { pattern: /(office\.com|sharepoint\.com)/i, category: 'Productivity' },

  // ──────────────────────────────────────────────
  // ENTERTAINMENT — Games, Streaming, Social Media
  // ──────────────────────────────────────────────

  // Desktop
  { pattern: /\b(steam|steam\.exe|epic games|gog galaxy|battle\.net|ubisoft connect|origin|ea app)\b/i, category: 'Entertainment' },
  { pattern: /\b(minecraft|league of legends|valorant|fortnite|csgo|dota|overwatch|apex|warzone)\b/i, category: 'Entertainment' },
  { pattern: /\b(spotify|spotify\.exe)\b/i, category: 'Entertainment' },
  { pattern: /\b(apple music|itunes|music\.app)\b/i, category: 'Entertainment' },
  { pattern: /\b(youtube music|tidal|deezer|pandora|amazon music)\b/i, category: 'Entertainment' },
  { pattern: /\b(vlc|plex|kodi|netflix|disney\+|hulu|prime video|hbo)\b/i, category: 'Entertainment' },
  { pattern: /\b(youtube|youtube\.com)\b/i, category: 'Entertainment' },
  { pattern: /\b(twitch|twitch\.tv)\b/i, category: 'Entertainment' },
  { pattern: /\b(tiktok|tiktok\.com)\b/i, category: 'Entertainment' },
  { pattern: /\b(instagram|facebook|twitter|x\.com|threads|bluesky|mastodon)\b/i, category: 'Entertainment' },
  { pattern: /\b(snapchat|pinterest|tumblr|imgur)\b/i, category: 'Entertainment' },

  // Android packages — entertainment
  { pattern: /com\.(spotify\.music|apple\.android\.music|deezer\.android\.app|youtube\.music|google\.android\.apps\.youtube\.music|soundcloud\.android)/i, category: 'Entertainment' },
  { pattern: /com\.(google\.android\.youtube|netflix\.mediaclient|com\.hulu\.plus|com\.disney|com\.amazon\.avod|twitch\.tv\.app)/i, category: 'Entertainment' },
  { pattern: /com\.(instagram\.android|facebook\.katana|com\.twitter\.android|com\.snapchat\.android|com\.pinterest|com\.zhiliaoapp\.musically|com\.ss\.android\.ugc\.aweme|lens\.app)/i, category: 'Entertainment' },
  { pattern: /com\.(valvesoftware\.steamlink|supercell\.clashofclans|com\.nianticlabs\.pokemongo|com\.miHoYo)/i, category: 'Entertainment' },

  // Web — entertainment & social
  { pattern: /(youtube\.com\/watch|twitch\.tv\/|netflix\.com\/watch|hulu\.com|disneyplus\.com)/i, category: 'Entertainment' },
  { pattern: /(spotify\.com|music\.apple\.com|soundcloud\.com)/i, category: 'Entertainment' },
  { pattern: /(instagram\.com|facebook\.com|twitter\.com|x\.com|tiktok\.com|snapchat\.com)/i, category: 'Entertainment' },

  // ──────────────────────────────────────────────
  // PRODUCTIVITY — Custom & Emerging Apps
  // ──────────────────────────────────────────────

  // Manus app (productivity/work tool)
  { pattern: /\b(manus|tech\.butterfly\.app)\b/i, category: 'Productivity' },
  { pattern: /tech\.butterfly\.app/i, category: 'Productivity' },

  // ──────────────────────────────────────────────
  // SYSTEM — OS Settings, File Managers, Utilities
  // ──────────────────────────────────────────────

  // Desktop
  { pattern: /\b(system settings|system preferences|settings|control panel)\b/i, category: 'System' },
  { pattern: /\b(finder|file explorer|explorer\.exe|nautilus|dolphin|thunar)\b/i, category: 'System' },
  { pattern: /\b(task manager|activity monitor|system monitor|htop|btop)\b/i, category: 'System' },
  { pattern: /\b(calculator|calcurse|clock|weather)\b/i, category: 'System' },
  { pattern: /\b(screenshot|snip|snipaste|greenshot|sharex|flameshot)\b/i, category: 'System' },
  { pattern: /\b(launchpad|start menu|spotlight)\b/i, category: 'System' },
  { pattern: /\b(desktop|loginwindow|lock screen)\b/i, category: 'System' },
  { pattern: /\b(app store|microsoft store|software center|synaptic|gnome software|discover)\b/i, category: 'System' },

  // Android packages — system
  { pattern: /com\.(android\.settings|android\.launcher|android\.systemui|android\.phone|android\.contacts|android\.dialer|android\.mms|android\.deskclock|android\.calculator|android\.gallery3d|android\.camera|android\.fileexplorer)/i, category: 'System' },
  { pattern: /com\.(google\.android\.apps\.nexuslauncher|google\.android\.appstub|android\.vending|google\.android\.play\.store)/i, category: 'System' },
  { pattern: /com\.(samsung\.android|xiaomi|huawei|oppo|oneplus|miui|coloros|oxygenos)/i, category: 'System' },

  // ──────────────────────────────────────────────
  // DEFAULT — catch‑all for anything not matched above
  // ──────────────────────────────────────────────
  // (no rule needed — CategoryMapper returns 'Other' as fallback)
];