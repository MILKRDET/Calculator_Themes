let currentInput = '';
let previousInput = '';
let operation = null;
let resetScreen = false;
let calculationHistory = [];
let historyVisible = true;

const resultDisplay = document.getElementById('result');
const historyDisplay = document.getElementById('history');
const historyList = document.getElementById('history-list');
const historyContent = document.querySelector('.history-content');

// เปลี่ยนธีม
document.querySelectorAll('.btn-theme').forEach(btn => {
    btn.addEventListener('click', () => {
        document.body.className = '';
        document.body.classList.add(btn.dataset.theme);
    });
});

// เพิ่มค่าลงในการแสดงผล
function appendValue(value) {
    if (resetScreen) {
        currentInput = '';
        resetScreen = false;
    }
    
    if (value === '.' && currentInput.includes('.')) return;
    
    currentInput += value;
    resultDisplay.value = currentInput;
}

// เคลียร์ทั้งหมด
function clearAll() {
    currentInput = '';
    previousInput = '';
    operation = null;
    resultDisplay.value = '0';
    historyDisplay.textContent = '';
}

// ลบตัวเลขทีละตัว
function backspace() {
    currentInput = currentInput.slice(0, -1);
    resultDisplay.value = currentInput || '0';
}

// คำนวณ
function calculate(operator) {
    if (operator === '=' && currentInput === '') return;
    
    // การคำนวณแบบวิทยาศาสตร์
    const scientificFunctions = {
        'sqrt(': 'Math.sqrt',
        'sin(': 'Math.sin',
        'cos(': 'Math.cos',
        'tan(': 'Math.tan',
        'log(': 'Math.log10'
    };
    
    if (scientificFunctions[operator]) {
        currentInput = `${scientificFunctions[operator]}(${currentInput})`;
        evaluateExpression();
        return;
    }
    
    if (operator === 'pow(') {
        previousInput = currentInput;
        currentInput = '';
        operation = '^';
        historyDisplay.textContent = `${previousInput} ${operation}`;
        resetScreen = true;
        return;
    }
    
    if (operator === '%') {
        currentInput = `${parseFloat(currentInput) / 100}`;
        resultDisplay.value = currentInput;
        return;
    }
    
    if (currentInput === '' && previousInput !== '' && operation !== null) {
        operation = operator;
        historyDisplay.textContent = `${previousInput} ${operation}`;
        return;
    }
    
    if (currentInput === '' && previousInput === '') return;
    
    if (previousInput === '') {
        previousInput = currentInput;
        currentInput = '';
    } else if (currentInput !== '') {
        const result = operate(previousInput, currentInput, operation);
        addToHistory(`${previousInput} ${operation} ${currentInput} = ${result}`);
        previousInput = result;
        currentInput = '';
        resultDisplay.value = result;
    }
    
    operation = operator === '=' ? null : operator;
    historyDisplay.textContent = `${previousInput} ${operation || ''}`;
    resetScreen = true;
}

// ประมวลผลนิพจน์
function evaluateExpression() {
    try {
        const result = eval(currentInput);
        addToHistory(`${currentInput} = ${result}`);
        currentInput = result.toString();
        resultDisplay.value = currentInput;
    } catch (error) {
        resultDisplay.value = 'Error';
        currentInput = '';
    }
}

// ดำเนินการคำนวณ
function operate(a, b, op) {
    a = parseFloat(a);
    b = parseFloat(b);
    
    const operations = {
        '+': (a, b) => a + b,
        '-': (a, b) => a - b,
        '*': (a, b) => a * b,
        '/': (a, b) => a / b,
        '^': (a, b) => Math.pow(a, b)
    };
    
    return operations[op] ? operations[op](a, b) : b;
}

// เพิ่มลงในประวัติ
function addToHistory(calculation) {
    calculationHistory.unshift(calculation);
    updateHistoryList();
    
    if (!historyVisible) {
        toggleHistory();
    }
}

// อัพเดทรายการประวัติ
function updateHistoryList() {
    historyList.innerHTML = '';
    calculationHistory.slice(0, 10).forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        li.addEventListener('click', () => {
            const parts = item.split(' = ');
            currentInput = parts[0];
            resultDisplay.value = currentInput;
        });
        historyList.appendChild(li);
    });
}

// เคลียร์ประวัติ
function clearHistory() {
    calculationHistory = [];
    updateHistoryList();
}

// สลับการแสดงประวัติ
function toggleHistory() {
    historyVisible = !historyVisible;
    historyContent.classList.toggle('show');
    document.querySelector('.btn-toggle-history').textContent = 
        historyVisible ? '▲' : '▼';
}

// รองรับการป้อนข้อมูลจากคีย์บอร์ด
document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') appendValue(e.key);
    else if (e.key === '.') appendValue('.');
    else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') calculate(e.key);
    else if (e.key === 'Enter' || e.key === '=') calculate('=');
    else if (e.key === 'Escape') clearAll();
    else if (e.key === 'Backspace') backspace();
    else if (e.key === '%') calculate('%');
});

// เริ่มต้น
clearAll();
toggleHistory(); // ซ่อนประวัติเริ่มต้น