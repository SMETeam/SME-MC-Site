(() => {
  const API_URL = 'https://api.sme-mc.us';
  const IGNORED_USERS = new Set([
    // ur not admin lol
    'rain',
    'rainwav'
  ].map((name) => name.toLowerCase()));

  const COLOR_CODES = {
    '0': '#000000',
    '1': '#0000aa',
    '2': '#00aa00',
    '3': '#00aaaa',
    '4': '#aa0000',
    '5': '#aa00aa',
    '6': '#ffaa00',
    '7': '#aaaaaa',
    '8': '#555555',
    '9': '#5555ff',
    'a': '#55ff55',
    'b': '#55ffff',
    'c': '#ff5555',
    'd': '#ff55ff',
    'e': '#ffff55',
    'f': '#ffffff'
  };

  const adminContainer = document.querySelector('.main5_admin_div');
  const supporterContainer = document.querySelector('.main5_supporter_div');
  const recentSupporterContainer =
    document.querySelector('.main5_recent_supporter_div') || supporterContainer;
  const allSupporterContainer = document.querySelector('.main5_all_supporter_div');
  if (!adminContainer && !recentSupporterContainer && !allSupporterContainer) {
    return;
  }

  const staffteam = [
    {
      key: 'owner',
      label: '[Owner]',
      rankClass: 'main5_admins_description_rank_owner',
      cardClass: 'main5_admins_dev_type2'
    },
    {
      key: 'dev',
      label: '[Head Mod]',
      rankClass: 'main5_admins_description_rank_headmod',
      cardClass: 'main5_admins_dev_type1'
    },
    {
      key: 'mod',
      label: '[Mod]',
      rankClass: 'main5_admins_description_rank_mod',
      cardClass: 'main5_admins_dev_type1'
    },
    {
      key: 'helper',
      label: '[Helper]',
      rankClass: 'main5_admins_description_rank_helper',
      cardClass: 'main5_admins_dev_type1'
    }
  ];

  const supporters = [
    {
      key: 'sup',
      label: '[Supporter]',
      rankClass: 'main5_supporters_description_rank_supporter',
      max: 1,
      overridecolor: '3'
    },
    {
      key: 'supplus',
      label: '[Supporter+]',
      rankClass: 'main5_supporters_description_rank_supporter',
      max: 1,
      overridecolor: 'b'
    },
    {
      key: 'sup-higher',
      label: '',
      rankClass: 'main5_supporters_description_rank_supporter',
      max: 1,
      useMeta: true
    }
  ];

  const SUPPORTER_PRIORITY = {
    'sup': 1,
    'supplus': 2,
    'sup-higher': 3
  };

  // lowk had help for the like fixing of names

  function safeArray(value) {
    return Array.isArray(value) ? value : [];
  }

  function normalizeName(value) {
    return value ? value.trim().toLowerCase() : '';
  }

  function isIgnored(name) {
    const normalized = normalizeName(name);
    return normalized ? IGNORED_USERS.has(normalized) : false;
  }

  function pullcolorcodes(value) {
    return value ? value.replace(/(?:&|§)[0-9a-fk-or]/gi, '') : '';
  }

  function colorfromtag(value) {
    if (!value) {
      return null;
    }
    const matches = value.match(/(?:&|§)[0-9a-f]/gi);
    if (!matches || matches.length === 0) {
      return null;
    }
    const code = matches[matches.length - 1].slice(1).toLowerCase();
    return COLOR_CODES[code] || null;
  }

  function avatarUrl(username) {
    return `https://mc-heads.net/avatar/${encodeURIComponent(username)}`;
  }

  function clearChildren(element) {
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  function lookforsupporters(data) {
    const lookup = new Map();
    supporters.forEach((group) => {
      const entries = safeArray(data[group.key]);
      const priority = SUPPORTER_PRIORITY[group.key] || 0;
      entries.forEach((entry) => {
        const name = group.useMeta && entry && typeof entry === 'object' ? entry.name : entry;
        if (!name) {
          return;
        }
        const normalized = normalizeName(name);
        if (!normalized) {
          return;
        }
        const existing = lookup.get(normalized);
        if (!existing || priority >= existing.priority) {
          lookup.set(normalized, {
            name,
            config: group,
            meta: group.useMeta ? entry : null,
            priority
          });
        }
      });
    });
    return lookup;
  }

  function createstaffcard(name, config) {
    const card = document.createElement('div');
    card.className = `main5_admins_div ${config.cardClass}`;

    const img = document.createElement('img');
    img.className = 'main5_admins_img';
    img.alt = `${name} head`;
    img.src = avatarUrl(name);

    const descWrap = document.createElement('div');
    descWrap.className = 'main5_admins_description_div';

    const rank = document.createElement('a');
    rank.className = `main5_admins_description_rank ${config.rankClass}`;
    rank.textContent = config.label;

    const title = document.createElement('a');
    title.className = 'main5_admins_description_title';
    title.textContent = name;

    descWrap.appendChild(rank);
    descWrap.appendChild(title);

    card.appendChild(img);
    card.appendChild(descWrap);
    return card;
  }

  function createsupportercard(name, config, meta) {
    const card = document.createElement('div');
    card.className = 'main5_supporters_div';

    const img = document.createElement('img');
    img.className = 'main5_supporters_img';
    img.alt = `${name} head`;
    img.src = avatarUrl(name);

    const descWrap = document.createElement('div');
    descWrap.className = 'main5_supporters_description_div';

    const rank = document.createElement('a');
    rank.className = `main5_supporters_description_rank ${config.rankClass}`;
    rank.textContent = meta && meta.prefix ? pullcolorcodes(meta.prefix) : config.label;
    const prefixColor =
      meta && meta.prefix
        ? colorfromtag(meta.prefix)
        : (config.overridecolor ? COLOR_CODES[config.overridecolor] : null);

    if (prefixColor) {
      rank.style.color = prefixColor;
    }

    const title = document.createElement('a');
    title.className = 'main5_supporters_description_title';
    title.textContent = name;

    descWrap.appendChild(rank);
    descWrap.appendChild(title);

    card.appendChild(img);
    card.appendChild(descWrap);
    return card;
  }

  async function loadsmeapi() {
    try {
      const response = await fetch(API_URL, { cache: 'no-store' });
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();

      if (adminContainer) {
        clearChildren(adminContainer);
        staffteam.forEach((group) => {
          const members = safeArray(data[group.key]);
          members.forEach((name) => {
            if (isIgnored(name)) {
              return;
            }
            adminContainer.appendChild(createstaffcard(name, group));
          });
        });
      }

      if (supporterContainer && supporterContainer !== recentSupporterContainer) {
        clearChildren(supporterContainer);
        supporters.forEach((group) => {
          const members = safeArray(data[group.key]).slice(0, group.max);
          members.forEach((entry) => {
            if (group.useMeta) {
              const name = entry && typeof entry === 'object' ? entry.name : null;
              if (name && !isIgnored(name)) {
                supporterContainer.appendChild(createsupportercard(name, group, entry));
              }
            } else if (typeof entry === 'string' && !isIgnored(entry)) {
              supporterContainer.appendChild(createsupportercard(entry, group, null));
            }
          });
        });
      }

      const lookup = lookforsupporters(data);
      const recentSeen = new Set();
      const recentEntries = [];
      for (const name of safeArray(data.recent)) {
        const normalized = normalizeName(name);
        if (!normalized || recentSeen.has(normalized) || isIgnored(name)) {
          continue;
        }
        const supporter = lookup.get(normalized);
        if (!supporter) {
          continue;
        }
        recentSeen.add(normalized);
        recentEntries.push(supporter);
        if (recentEntries.length >= 3) {
          break;
        }
      }

      if (recentSupporterContainer) {
        clearChildren(recentSupporterContainer);
        recentEntries.forEach((supporter) => {
          recentSupporterContainer.appendChild(
            createsupportercard(supporter.name, supporter.config, supporter.meta)
          );
        });
      }

      if (allSupporterContainer) {
        clearChildren(allSupporterContainer);
        for (const [normalized, supporter] of lookup.entries()) {
          if (recentSeen.has(normalized) || isIgnored(supporter.name)) {
            continue;
          }
          allSupporterContainer.appendChild(
            createsupportercard(supporter.name, supporter.config, supporter.meta)
          );
        }
      }
    } catch (error) {
      console.warn('Failed to load SME data:', error);
    }
  }

  loadsmeapi();
})();
