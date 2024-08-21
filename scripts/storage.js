function saveMoods() {
    const streak = calculateStreak();
    localStorage.setItem('moods', JSON.stringify(moods));
    localStorage.setItem('moodStreak', streak);
}

function calculateStreak() {
    const today = new Date().toLocaleDateString();
    const lastLog = moods.length ? new Date(moods[moods.length - 1].date).toLocaleDateString() : null;

    if (!lastLog || today !== lastLog) {
        return 1;
    }

    const streak = parseInt(localStorage.getItem('moodStreak')) || 1;
    return streak + 1;
}

function loadStreak() {
    return localStorage.getItem('moodStreak') || 0;
}

function displayStreak() {
    const streak = loadStreak();
    const streakElement = document.createElement('div');
    streakElement.classList.add('text-center', 'p-4', 'bg-green-100', 'rounded');
    streakElement.innerHTML = `<strong>Current Streak:</strong> ${streak} days`;
    document.querySelector('main').prepend(streakElement);
}
