const bossInfoLevels = document.getElementById('boss-levels-body');
const bossInfoMobs = document.getElementById('boss-mobs-list');
const bossInfoAbilities = document.getElementById('boss-abilities-list');
const bossInfoSpawnReasons = document.getElementById('boss-spawn-reasons-list');
const bossInfoRules = document.getElementById('boss-rule-list');

function RenderBossLevels(levels) {
    bossInfoLevels.innerHTML = '';

    if (!Array.isArray(levels) || levels.length === 0) {
        const row = document.createElement('tr');
        const cell = document.createElement('td');
        cell.colSpan = 3;
        cell.textContent = 'No boss levels found.';
        row.appendChild(cell);
        bossInfoLevels.appendChild(row);
        return;
    }

    levels.forEach(level => {
        const row = document.createElement('tr');

        const levelCell = document.createElement('td');
        levelCell.textContent = level.level;
        row.appendChild(levelCell);

        const prefixCell = document.createElement('td');
        prefixCell.textContent = level.prefix;
        row.appendChild(prefixCell);

        const chanceCell = document.createElement('td');
        chanceCell.textContent = level.spawnChance;
        row.appendChild(chanceCell);

        bossInfoLevels.appendChild(row);
    });
}

function RenderBossPills(container, values, emptyMessage) {
    container.innerHTML = '';

    if (!Array.isArray(values) || values.length === 0) {
        const pill = document.createElement('span');
        pill.className = 'boss-pill boss-pill-loading';
        pill.textContent = emptyMessage;
        container.appendChild(pill);
        return;
    }

    values.forEach(value => {
        const pill = document.createElement('span');
        pill.className = 'boss-pill';
        pill.textContent = value;
        container.appendChild(pill);
    });
}

function RenderBossRules(rules) {
    bossInfoRules.innerHTML = '';

    if (!Array.isArray(rules) || rules.length === 0) {
        const message = document.createElement('p');
        message.textContent = 'No boss rules found.';
        bossInfoRules.appendChild(message);
        return;
    }

    rules.forEach(rule => {
        const row = document.createElement('div');
        row.className = 'boss-rule-row';

        const label = document.createElement('strong');
        label.textContent = rule.label || 'Rule';
        row.appendChild(label);

        const value = document.createElement('span');
        value.textContent = rule.value || '';
        row.appendChild(value);

        bossInfoRules.appendChild(row);
    });
}

function ShowBossInfoError(message) {
    if (bossInfoLevels) {
        bossInfoLevels.innerHTML = `<tr><td colspan="3">${message}</td></tr>`;
    }

    [bossInfoMobs, bossInfoAbilities, bossInfoSpawnReasons].forEach(container => {
        if (!container) {
            return;
        }

        container.innerHTML = '';
        const pill = document.createElement('span');
        pill.className = 'boss-pill boss-pill-loading';
        pill.textContent = message;
        container.appendChild(pill);
    });

    if (bossInfoRules) {
        bossInfoRules.innerHTML = '';
        const text = document.createElement('p');
        text.textContent = message;
        bossInfoRules.appendChild(text);
    }
}

fetch('./data/boss-info.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load boss info.');
        }

        return response.json();
    })
    .then(data => {
        if (!data || !Array.isArray(data.levels)) {
            throw new Error('Invalid boss info data.');
        }

        if (bossInfoLevels) {
            RenderBossLevels(data.levels);
        }

        if (bossInfoMobs) {
            RenderBossPills(bossInfoMobs, data.eligibleMobs, 'No mobs listed.');
        }

        if (bossInfoAbilities) {
            RenderBossPills(bossInfoAbilities, data.enabledAbilities, 'No abilities listed.');
        }

        if (bossInfoSpawnReasons) {
            RenderBossPills(bossInfoSpawnReasons, data.spawnReasons, 'No spawn reasons listed.');
        }

        if (bossInfoRules) {
            RenderBossRules(data.rules);
        }
    })
    .catch(() => {
        ShowBossInfoError('Unable to load boss info right now.');
    });
