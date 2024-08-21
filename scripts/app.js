document.addEventListener('DOMContentLoaded', () => {
    const moodForm = document.getElementById('mood-form');
    const moodHistory = document.getElementById('mood-history');
    const moodChartElement = document.getElementById('mood-chart').getContext('2d');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const averageMoodElement = document.getElementById('average-mood');

    const moodPieChartElement = document.getElementById('mood-pie-chart').getContext('2d');
    const moodLineChartElement = document.getElementById('mood-line-chart').getContext('2d');

    let moods = [];
    let isDarkMode = JSON.parse(localStorage.getItem('isDarkMode')) || false;

    // Load saved moods and update UI
    function loadMoods() {
        moods = JSON.parse(localStorage.getItem('moods')) || [];
        updateMoodHistory();
        updateMoodChart();
        displayAverageMood();
        updatePieChart();
        updateLineChart();
        displayStreak();
        initializeExportAndShare(moods);
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
            updatePieChart();
            updateLineChart();
            displayStreak();
            initializeExportAndShare(moods);
            moodForm.reset();
        }
    });

    // Update the mood history UI
    function updateMoodHistory() {
        moodHistory.innerHTML = '';
        moods.forEach((entry, index) => {
            const listItem = document.createElement('div');
            listItem.classList.add('border-b', 'py-2', 'flex', 'justify-between', 'items-center');
            listItem.innerHTML = `
                <span>${entry.date}: ${entry.mood}</span>
                <p>${entry.note ? ` - ${entry.note}` : ''}</p>
                <button onclick="editMood(${index})" class="text-blue-500 hover:text-blue-700">Edit</button>
                <button onclick="deleteMood(${index})" class="text-red-500 hover:text-red-700">Delete</button>
            `;
            moodHistory.appendChild(listItem);
        });
    }

    // Edit a mood
    window.editMood = function(index) {
        const mood = moods[index];
        document.getElementById('mood').value = mood.mood;
        document.getElementById('note').value = mood.note;
        moods.splice(index, 1);  // Remove the old mood entry
        saveMoods();
        updateMoodHistory();
        updateMoodChart();
        updatePieChart();
        updateLineChart();
        displayAverageMood();
        displayStreak();
        initializeExportAndShare(moods);
    };

    // Delete a mood
    window.deleteMood = function(index) {
        moods.splice(index, 1);
        saveMoods();
        updateMoodHistory();
        updateMoodChart();
        updatePieChart();
        updateLineChart();
        displayAverageMood();
        displayStreak();
        initializeExportAndShare(moods);
    };

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
        const labels = [];

        moods.forEach(entry => {
            moodCounts[entry.mood]++;
            totalScore += moodScores[entry.mood];
            labels.push(entry.date);
        });

        const averageMoodScore = totalScore / moods.length;

        new Chart(moodChartElement, {
            type: 'bar',  // Changed to bar chart
            data: {
                labels: labels,
                datasets: [{
                    label: 'Mood Frequency',
                    data: Object.values(moodCounts),
                    backgroundColor: [
                        '#4CAF50', '#F44336', '#FFC107', '#2196F3', '#FF5722', '#9E9E9E'
                    ],
                    borderColor: 'rgba(0, 123, 255, 1)',
                    borderWidth: 2,
                    fill: false
                }, {
                    label: 'Average Mood Score',
                    data: new Array(moods.length).fill(averageMoodScore),
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

    // Update the Pie chart for mood distribution
    function updatePieChart() {
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

        new Chart(moodPieChartElement, {
            type: 'pie',
            data: {
                labels: Object.keys(moodCounts),
                datasets: [{
                    data: Object.values(moodCounts),
                    backgroundColor: [
                        '#4CAF50', '#F44336', '#FFC107', '#2196F3', '#FF5722', '#9E9E9E'
                    ],
                    borderColor: '#fff',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true
            }
        });
    }

    // Update the Line chart for mood intensity over time
    function updateLineChart() {
        const moodScores = {
            happy: 5,
            excited: 4,
            neutral: 3,
            anxious: 2,
            sad: 1,
            angry: 0
        };

        const labels = [];
        const scores = [];

        moods.forEach(entry => {
            labels.push(entry.date);
            scores.push(moodScores[entry.mood]);
        });

        new Chart(moodLineChartElement, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Mood Intensity',
                    data: scores,
                    backgroundColor: 'rgba(0, 123, 255, 0.5)',
                    borderColor: 'rgba(0, 123, 255, 1)',
                    borderWidth: 2,
                    fill: false
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

    // Initialize export and share functionality
    function initializeExportAndShare(moods) {
        document.getElementById('export-csv').addEventListener('click', () => {
            if (moods.length) {
                const csvContent = "data:text/csv;charset=utf-8," + moods.map(e => `${e.date},${e.mood},${e.note || ''}`).join("\n");
                const encodedUri = encodeURI(csvContent);
                const link = document.createElement("a");
                link.setAttribute("href", encodedUri);
                link.setAttribute("download", "mood_data.csv");
                document.body.appendChild(link);
                link.click();
            } else {
                alert("No mood data available to export.");
            }
        });

        document.getElementById('share-data').addEventListener('click', () => {
            if (moods.length) {
                const shareText = moods.map(e => `Date: ${e.date}, Mood: ${e.mood}, Note: ${e.note || ''}`).join("\n");
                const shareLink = `mailto:?subject=Mood Data&body=${encodeURIComponent(shareText)}`;
                window.location.href = shareLink;
            } else {
                alert("No mood data available to share.");
            }
        });
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
