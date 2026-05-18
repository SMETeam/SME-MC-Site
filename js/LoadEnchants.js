const enchantcount = document.getElementById('enchant-ammount');
const enchanttable = document.getElementById('enchants-table-body');

function FixNames(name) {
    if (!name) return '';
    return name
        .split('_')
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
}

function LoadEnchants(enchants) {
    enchantcount.textContent = enchants.length;
    enchanttable.innerHTML = '';

    enchants.forEach(enchant => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = FixNames(enchant.name);
        row.appendChild(nameCell);

        const info = document.createElement('td');
        info.textContent = enchant.description || '';
        row.appendChild(info);

        const levels = document.createElement('td');
        levels.textContent = Array.isArray(enchant.levels) ?
            enchant.levels.join(', ') :
            '';
        row.appendChild(levels);

        enchanttable.appendChild(row);
    });
}

function LoadingError(message) {
    enchantcount.textContent = '0';
    enchanttable.innerHTML = '';
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 3;
    cell.textContent = message;
    row.appendChild(cell);
    enchanttable.appendChild(row);
}

fetch('./data/enchants.json')
.then(response => {
    if (!response.ok) {
        throw new Error('Failed to load enchants.');
    }
    return response.json();
})
.then(data => {
    if (!Array.isArray(data)) {
        throw new Error('Invalid enchants data.');
    }
    LoadEnchants(data);
})
.catch(() => {
    LoadingError('Unable to load enchants right now.');
});