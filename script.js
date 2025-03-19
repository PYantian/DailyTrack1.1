let lastTime = null;

// 获取当前日期（格式：YYYY-MM-DD）
function getCurrentDate() {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// 从 localStorage 加载记录
function loadActivities(date) {
    const activities = JSON.parse(localStorage.getItem(date)) || [];
    const activityList = document.getElementById('activityList');
    activityList.innerHTML = ''; // 清空当前列表

    activities.forEach(activity => {
        const li = createEditableListItem(activity);
        activityList.appendChild(li);
    });

    // 设置 lastTime 为最后一条记录的结束时间
    if (activities.length > 0) {
        const lastActivity = activities[activities.length - 1];
        const lastActivityTime = lastActivity.split(' - ')[1].split(':')[0] + ":" + lastActivity.split(' - ')[1].split(':')[1];
        lastTime = new Date(`1970-01-01T${lastActivityTime}:00`);
    }
}

// 保存记录到 localStorage
function saveActivity(date, activityText) {
    const activities = JSON.parse(localStorage.getItem(date)) || [];
    activities.push(activityText);
    localStorage.setItem(date, JSON.stringify(activities));
}

// 添加活动
function addActivity(currentTime, activity) {
    const activityList = document.getElementById('activityList');

    // 格式化时间
    const formattedTime = formatTime(currentTime);
    const currentDate = getCurrentDate();
    loadActivities(currentDate);

    let activityText;
    if (!lastTime) {
        activityText = `${formattedTime} - ${formattedTime}: ${activity}`;
    } else {
        const formattedLastTime = formatTime(lastTime);
        activityText = `${formattedLastTime} - ${formattedTime}: ${activity}`;
    }

    const li = createEditableListItem(activityText);
    activityList.appendChild(li);
    saveActivity(currentDate, activityText);
}

// 计算持续时间
function calculateDuration(startTime, endTime) {
    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    const diffMs = end - start;
    const diffMinutes = Math.floor(diffMs / 60000);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    return `${hours}h ${minutes}m`;
}

// 格式化时间为 HH:MM
function formatTime(date) {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
}

// 创建可编辑的列表项
function createEditableListItem(text) {
    const li = document.createElement('li');

    const textSpan = document.createElement('span');
    textSpan.textContent = text;

    // 计算持续时间
    const timeParts = text.match(/(\d{2}:\d{2}) - (\d{2}:\d{2})/);
    let durationText = '';
    if (timeParts) {
        durationText = calculateDuration(timeParts[1], timeParts[2]);
    }

    const durationSpan = document.createElement('span');
    durationSpan.textContent = durationText;
    durationSpan.classList.add('duration');

    li.appendChild(textSpan);
    li.appendChild(durationSpan);

    // 使 textSpan 可编辑
    textSpan.addEventListener('click', () => {
        if (textSpan.querySelector('input')) return;

        const input = document.createElement('input');
        input.type = 'text';
        input.value = textSpan.textContent;
        textSpan.textContent = '';
        textSpan.appendChild(input);
        input.focus();

        // 按下回车键或失去焦点时保存修改
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveEditedText(textSpan, input);
            }
        });

        input.addEventListener('blur', () => {
            saveEditedText(textSpan, input);
        });
    });

    // 添加滑动删除功能
    addSwipeToDelete(li);

    return li;
}

function saveEditedText(textSpan, input) {
    const newText = input.value.trim();
    if (newText) {
        textSpan.textContent = newText;
        updateLocalStorage();
    } else {
        textSpan.textContent = input.value;
    }
}

// 添加滑动删除功能
function addSwipeToDelete(li) {
    let touchStartX = 0;
    let touchStartY = 0;
    let isSwiping = false;
    const swipeThreshold = 150;

    li.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        isSwiping = false;
    });

    li.addEventListener('touchmove', (e) => {
        const touch = e.touches[0];
        const diffX = touch.clientX - touchStartX;
        const diffY = touch.clientY - touchStartY;

        if (Math.abs(diffX) > swipeThreshold && Math.abs(diffX) > Math.abs(diffY)) {
            isSwiping = true;
            e.preventDefault();
        }
    });

    li.addEventListener('touchend', () => {
        if (isSwiping) {
            li.classList.add('swiped');
            setTimeout(() => deleteActivity(li), 300);
        }
    });
}

// 删除记录
function deleteActivity(li) {
    li.remove();
    updateLocalStorage();
}

// 更新 localStorage
function updateLocalStorage() {
    const currentDate = getCurrentDate();
    const activityList = document.getElementById('activityList');
    const activities = [];

    activityList.querySelectorAll('li span:first-child').forEach(span => {
        activities.push(span.textContent);
    });

    localStorage.setItem(currentDate, JSON.stringify(activities));
}

// 表单提交事件
document.getElementById('activityForm').addEventListener('submit', function(event) {
    event.preventDefault();

    const activity = document.getElementById('activity').value;
    const currentTime = new Date();

    if (activity) {
        addActivity(currentTime, activity);
        document.getElementById('activityForm').reset();
    }
});

// 页面加载时初始化
window.onload = function() {
    const currentDate = getCurrentDate();
    loadActivities(currentDate);
};
