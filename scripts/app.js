document.addEventListener('DOMContentLoaded', () => {
    const moodForm = document.getElementById('mood-form');
    const moodHistory = document.getElementById('mood-history');
    const moodChartElement = document.getElementById('mood-chart').getContext('2d');
    const darkModeToggle = document.getElementById('dark-mode-toggle');

    let moods = [];
    let isDarkMode = JSON.parse(localStorage.getItem('isDarkMode')) || false;

    // Load saved moods and update UI
    function loadMoods() {
        moods = JSON.parse(localStorage.getItem('moods')) || [];
        updateMoodHistory();
        updateMoodChart();
    }

    // Add a new mood
    moodForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const mood = document.getElementById('mood').value;
        const note = document.getElementById('note').value;

        if (mood) {
            const newMood = { mood, note, date: new Date().toLocaleDateString() };
            moods.push(newMood);
            saveMoods();
            updateMoodHistory();
            updateMoodChart();
            moodForm.reset();
        }
    });

    // Update the mood history UI
    function updateMoodHistory() {
        moodHistory.innerHTML = '';
        moods.forEach((entry) => {
            const listItem = document.createElement('div');
            listItem.classList.add('border-b', 'py-2', 'flex', 'justify-between', 'items-center');
            listItem.innerHTML = `
                <span>${entry.date}: ${entry.mood}</span>
                <p>${entry.note ? ` - ${entry.note}` : ''}</p>
            `;
            moodHistory.appendChild(listItem);
        });
    }

    // Update the mood chart
    function updateMoodChart() {
        const moodCounts = {
            happy: 0,
            sad: 0,
            anxious: 0,
            excited: 0,
            angry: 0,
            neutral: 0
        };

        moods.forEach(entry => {
            moodCounts[entry.mood]++;
        });

        new Chart(moodChartElement, {
            type: 'bar',
            data: {
                labels: ['Happy', 'Sad', 'Anxious', 'Excited', 'Angry', 'Neutral'],
                datasets: [{
                    label: 'Mood Frequency',
                    data: [
                        moodCounts.happy,
                        moodCounts.sad,
                        moodCounts.anxious,
                        moodCounts.excited,
                        moodCounts.angry,
                        moodCounts.neutral
                    ],
                    backgroundColor: [
                        '#4CAF50',
                        '#F44336',
                        '#FFC107',
                        '#2196F3',
                        '#FF5722',
                        '#9E9E9E'
                    ],
                    borderColor: '#333',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Save moods to local storage
    function saveMoods() {
        localStorage.setItem('moods', JSON.stringify(moods));
    }

    // Toggle dark mode
    darkModeToggle.addEventListener('click', () => {
        isDarkMode = !isDarkMode;
        document.body.classList.toggle('dark-mode', isDarkMode);
        localStorage.setItem('isDarkMode', JSON.stringify(isDarkMode));
    });

    // Load initial settings and data
    loadMoods();
    if (isDarkMode) {
        document.body.classList.add('dark-mode');
    }
});
