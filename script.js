// Массив пациентов
let patients = [];

// Загрузка из localStorage при старте
const saved = localStorage.getItem('patients');
if (saved) {
    try { 
        patients = JSON.parse(saved); 
    } catch (e) { 
        patients = []; 
    }
}

function saveToStorage() {
    localStorage.setItem('patients', JSON.stringify(patients));
}

// --- Добавление ---
const addForm = document.getElementById('add-form');
const addMessage = document.getElementById('add-message');

addForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // Собираем данные из формы
    const fd = new FormData(addForm);
    const lastName = fd.get('lastName').trim();
    const firstName = fd.get('firstName').trim();
    const middleName = fd.get('middleName').trim();

    // Склеиваем ФИО в одну строку для удобства хранения и поиска
    const fullFio = `${lastName} ${firstName} ${middleName}`.trim();

    const patient = {
        fio: fullFio, // Сохраняем полное ФИО одной строкой
        specialty: fd.get('specialty').trim(),
        cabinet: fd.get('cabinet').trim(),
        time: fd.get('time')
    };

    patients.push(patient);
    saveToStorage();
    addForm.reset();
    
    addMessage.hidden = false;
    addMessage.textContent = 'Запись добавлена: ' + patient.fio;
    setTimeout(() => { addMessage.hidden = true; }, 2500);
});

// --- Экспорт в CSV ---
document.getElementById('download-csv').addEventListener('click', () => {
    if (patients.length === 0) {
        alert('Нет данных для экспорта');
        return;
    }

    const header = 'ФИО Пациента;Специальность;Кабинет;Время\n';
    const rows = patients.map(p => 
        `${p.fio};${p.specialty};${p.cabinet};${p.time}`
    ).join('\n');

    // BOM для корректного открытия кириллицы в Excel
    const bom = '\uFEFF';
    const blob = new Blob([bom + header + rows], { type: 'text/csv;charset=utf-8;' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = 'patients.csv';
    link.click();
    URL.revokeObjectURL(link.href);
});

// --- Поиск по ФИО и специальности + Вывод в таблицу ---
const searchForm = document.getElementById('search-form');
const resultsBox = document.getElementById('results');

searchForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const query = searchForm.elements.query.value.trim().toLowerCase();
    
    // Ищем и по ФИО, и по специальности
    const found = patients.filter(p => 
        p.fio.toLowerCase().includes(query) || 
        p.specialty.toLowerCase().includes(query)
    );

    resultsBox.innerHTML = '';

    if (found.length === 0) {
        resultsBox.innerHTML = '<p class="hint">Ничего не найдено</p>';
        return;
    }

    // Создаем таблицу
    const table = document.createElement('table');
    table.className = 'results-table';
    
    table.innerHTML = `
        <thead>
            <tr><th>ФИО</th><th>Специальность</th><th>Каб.</th><th>Время</th></tr>
        </thead>
        <tbody></tbody>
    `;

    const tbody = table.querySelector('tbody');

    found.forEach(p => {
        const tr = document.createElement('tr');
        
        // Используем textContent для безопасности
        const tdFio = document.createElement('td'); tdFio.textContent = p.fio;
        const tdSpec = document.createElement('td'); tdSpec.textContent = p.specialty;
        const tdCab = document.createElement('td'); tdCab.textContent = p.cabinet;
        const tdTime = document.createElement('td'); tdTime.textContent = p.time;

        tr.append(tdFio, tdSpec, tdCab, tdTime);
        tbody.append(tr);
    });

    resultsBox.append(table);
});