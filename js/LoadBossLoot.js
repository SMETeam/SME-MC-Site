const bosslootSpots = {
    'boss-tools': document.getElementById('boss-tools-grid'),
    'boss-potions': document.getElementById('boss-potions-grid'),
    'boss-armor': document.getElementById('boss-armor-grid')
};

const bossLootCounts = {
    'boss-tools': document.getElementById('boss-tools-count'),
    'boss-potions': document.getElementById('boss-potions-count'),
    'boss-armor': document.getElementById('boss-armor-count')
};

function FormatBossDropLevels(levels) {
    if (!Array.isArray(levels) || levels.length === 0) {
        return 'Drops from all boss levels!';
    }

    if (levels.length === 1) {
        return `Drops from boss level ${levels[0]}`;
    }

    return `Drops from boss levels ${levels.join(', ')}`;
}

function SetBossCount(categoryId, count) {
    const counter = bossLootCounts[categoryId];
    if (counter) {
        counter.textContent = `${count} items`;
    }
}

function CreateBossLootCard(item) {
    const card = document.createElement('div');
    card.className = 'loot-item';

    const image = document.createElement('img');
    image.src = item.image || '../img/construction.jpg';
    image.alt = item.name || 'Boss loot';
    image.onerror = () => {
        image.onerror = null;
        image.src = '../img/construction.jpg';
    };
    card.appendChild(image);

    const name = document.createElement('strong');
    name.textContent = item.name || 'Unknown loot';
    card.appendChild(name);

    const levels = document.createElement('small');
    levels.textContent = FormatBossDropLevels(item.dropLevels);
    if (!Array.isArray(item.dropLevels) || item.dropLevels.length === 0) {
        levels.className = 'loot-level-note';
    }
    card.appendChild(levels);

    const summary = document.createElement('p');
    summary.textContent = item.summary || ''; // make it blank or sm
    card.appendChild(summary);

    return card;
}

function ShowBossLootC(category) {
    const container = bosslootSpots[category.id];
    if (!container) {
        return;
    }

    container.innerHTML = '';

    if (!Array.isArray(category.items) || category.items.length === 0) {
        const emptyCard = document.createElement('div');
        emptyCard.className = 'loot-item loot-item-loading';

        const message = document.createElement('p');
        message.textContent = 'No boss loot found for this category.';
        emptyCard.appendChild(message);

        container.appendChild(emptyCard);
        SetBossCount(category.id, 0);
        return;
    }

    category.items.forEach(item => {
        container.appendChild(CreateBossLootCard(item));
    });

    SetBossCount(category.id, category.items.length);
}

function ShowBossLootError(message) {
    Object.entries(bosslootSpots).forEach(([categoryId, container]) => {
        if (!container) {
            return;
        }

        container.innerHTML = '';
        const card = document.createElement('div');
        card.className = 'loot-item loot-item-loading';

        const text = document.createElement('p');
        text.textContent = message;
        card.appendChild(text);

        container.appendChild(card);
        SetBossCount(categoryId, 0);
    });
}

fetch('./data/boss-loot.json')
    .then(response => {
        if (!response.ok) {
            throw new Error('Failed to load boss loot.');
        }

        return response.json();
    })
    .then(data => {
        if (!data || !Array.isArray(data.categories)) {
            throw new Error('Invalid boss loot data.');
        }

        data.categories.forEach(ShowBossLootC);
    })
    .catch(() => {
        ShowBossLootError('Unable to load boss loot right now.');
    });
