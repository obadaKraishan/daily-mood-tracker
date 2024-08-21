document.addEventListener('DOMContentLoaded', () => {
    const moodForm = document.getElementById('mood-form');
    const moodHistory = document.getElementById('mood-history');
    const moodChartElement = document.getElementById('mood-chart').getContext('2d');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const averageMoodElement = document.getElementById('average-mood');

    let moods = [];
    let isDarkMode = JSON.parse(localStorage.getItem('isDarkMode')) || false;

    // Load saved moods and update UI
    function loadMoods() {
        moods = JSON.parse(localStorage.getItem('moods')) || [];
        updateMoodHistory();
        updateMoodChart();
        displayAverageMood();
        displayStreak();
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
            displayAverageMood();
            displayStreak();
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
        if (!moods.length) return; // If no data, don't render the chart

        const moodCounts = {
            happy: 0,
            sad: 0,
            anxious: 0,
            excited: 0,
            angry: 0,
            neutral: 0
        };

        const moodScores = {
            happy: 5,
            excited: 4,
            neutral: 3,
            anxious: 2,
            sad: 1,
            angry: 0
        };

        let totalScore = 0;

        moods.forEach(entry => {
            moodCounts[entry.mood]++;
            totalScore += moodScores[entry.mood];
        });

        const averageMoodScore = totalScore / moods.length;

        new Chart(moodChartElement, {
            type: 'line',
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
                    backgroundColor: 'rgba(0, 123, 255, 0.5)',
                    borderColor: 'rgba(0, 123, 255, 1)',
                    borderWidth: 2,
                    fill: false,
                    lineTension: 0.1
                }, {
                    label: 'Average Mood Score',
                    data: new Array(6).fill(averageMoodScore),
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderWidth: 1,
                    pointRadius: 0,
                    type: 'line',
                    borderDash: [10, 5],
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

    // Display the average mood
    function displayAverageMood() {
        if (!moods.length) {
            averageMoodElement.textContent = 'No data available';
            return;
        }

        const moodScores = {
            happy: 5,
            excited: 4,
            neutral: 3,
            anxious: 2,
            sad: 1,
            angry: 0
        };

        let totalScore = 0;

        moods.forEach(entry => {
            totalScore += moodScores[entry.mood];
        });

        const averageMoodScore = totalScore / moods.length;
        const averageMood = getAverageMood(averageMoodScore);

        averageMoodElement.textContent = `Your average mood is: ${averageMood}`;
    }

    // Get the average mood based on score
    function getAverageMood(score) {
        if (score >= 4.5) return 'Happy';
        if (score >= 3.5) return 'Excited';
        if (score >= 2.5) return 'Neutral';
        if (score >= 1.5) return 'Anxious';
        if (score >= 0.5) return 'Sad';
        return 'Angry';
    }

    // Save moods to local storage
    function saveMoods() {
        const streak = calculateStreak();
        localStorage.setItem('moods', JSON.stringify(moods));
        localStorage.setItem('moodStreak', streak);
    }

    // Calculate the current streak
    function calculateStreak() {
        const today = new Date().toLocaleDateString();
        const lastLog = moods.length ? new Date(moods[moods.length - 1].date).toLocaleDateString() : null;

        if (!lastLog || today !== lastLog) {
            return 1;
        }

        const streak = parseInt(localStorage.getItem('moodStreak')) || 1;
        return streak + 1;
    }

    // Load the current streak
    function loadStreak() {
        return localStorage.getItem('moodStreak') || 0;
    }

    // Display the current streak
    function displayStreak() {
        const streak = loadStreak();
        const streakElement = document.getElementById('streak-section');
        streakElement.innerHTML = `<strong>Current Streak:</strong> ${streak} days`;
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
