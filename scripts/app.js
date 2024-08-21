document.addEventListener('DOMContentLoaded', () => {
    const moodForm = document.getElementById('mood-form');
    const moodHistory = document.getElementById('mood-history');
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    const averageMoodElement = document.getElementById('average-mood');

    const moodChartElement = document.getElementById('mood-chart');
    const moodPieChartElement = document.getElementById('mood-pie-chart');
    const moodLineChartElement = document.getElementById('mood-line-chart');
    const moodHeatmapChartElement = document.getElementById('mood-heatmap-chart');
    const moodRadarChartElement = document.getElementById('mood-radar-chart');
    const moodHistogramChartElement = document.getElementById('mood-histogram-chart');

    let moods = [];
    let isDarkMode = JSON.parse(localStorage.getItem('isDarkMode')) || false;

    // Load saved moods and update UI
    function loadMoods() {
        moods = JSON.parse(localStorage.getItem('moods')) || [];
        updateMoodHistory();
        if (moodChartElement) updateMoodChart();
        if (moodPieChartElement) updatePieChart();
        if (moodLineChartElement) updateLineChart();
        if (moodHeatmapChartElement) updateHeatmapChart();
        if (moodRadarChartElement) updateRadarChart();
        if (moodHistogramChartElement) updateHistogramChart();
        displayAverageMood();
        displayStreak();
        initializeExportAndShare(moods);
    }

    // Heatmap Chart
    function updateHeatmapChart() {
        if (!moodHeatmapChartElement) return;
        const ctx = moodHeatmapChartElement.getContext('2d');

        // Calculate daily mood frequencies
        const days = Array.from({ length: 31 }, (_, i) => i + 1);
        const moodFrequencies = days.map(day => {
            return moods.filter(mood => new Date(mood.date).getDate() === day).length;
        });

        new Chart(ctx, {
            type: 'matrix',
            data: {
                datasets: [{
                    label: 'Mood Frequency',
                    data: moodFrequencies.map((count, index) => ({
                        x: index + 1,
                        y: 1,
                        v: count
                    })),
                    backgroundColor: context => {
                        const value = context.dataset.data[context.dataIndex].v;
                        return value ? `rgba(0, 123, 255, ${value / Math.max(...moodFrequencies)})` : 'rgba(0,0,0,0)';
                    },
                    width: context => context.chart.chartArea.width / 31 - 1,
                    height: context => context.chart.chartArea.height / 2,
                }]
            },
            options: {
                scales: {
                    x: {
                        type: 'category',
                        labels: days,
                    },
                    y: {
                        display: false
                    }
                },
                plugins: {
                    datalabels: {
                        display: true,
                        color: '#fff'
                    }
                }
            }
        });
    }

    // Radar Chart for Emotional Balance
    function updateRadarChart() {
        if (!moodRadarChartElement) return;
        const ctx = moodRadarChartElement.getContext('2d');

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

        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: Object.keys(moodCounts),
                datasets: [{
                    label: 'Emotional Balance',
                    data: Object.values(moodCounts),
                    backgroundColor: 'rgba(54, 162, 235, 0.2)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    pointBackgroundColor: 'rgba(54, 162, 235, 1)',
                }]
            },
            options: {
                responsive: true,
                scales: {
                    r: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Histogram for Mood Distribution
    function updateHistogramChart() {
        if (!moodHistogramChartElement) return;
        const ctx = moodHistogramChartElement.getContext('2d');

        const moodTimes = moods.map(mood => {
            const date = new Date(mood.date);
            return date.getHours();
        });

        const bins = Array.from({ length: 24 }, () => 0);
        moodTimes.forEach(hour => bins[hour]++);

        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: Array.from({ length: 24 }, (_, i) => `${i}:00`),
                datasets: [{
                    label: 'Mood Frequency by Hour',
                    data: bins,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: {
                    x: {
                        beginAtZero: true
                    },
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
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
            if (moodChartElement) updateMoodChart();
            if (moodPieChartElement) updatePieChart();
            if (moodLineChartElement) updateLineChart();
            if (moodHeatmapChartElement) updateHeatmapChart();
            if (moodRadarChartElement) updateRadarChart();
            if (moodHistogramChartElement) updateHistogramChart();
            displayAverageMood();
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
        if (moodChartElement) updateMoodChart();
        if (moodPieChartElement) updatePieChart();
        if (moodLineChartElement) updateLineChart();
        if (moodHeatmapChartElement) updateHeatmapChart();
        if (moodRadarChartElement) updateRadarChart();
        if (moodHistogramChartElement) updateHistogramChart();
        displayAverageMood();
        displayStreak();
        initializeExportAndShare(moods);
    };

    // Delete a mood
    window.deleteMood = function(index) {
        moods.splice(index, 1);
        saveMoods();
        updateMoodHistory();
        if (moodChartElement) updateMoodChart();
        if (moodPieChartElement) updatePieChart();
        if (moodLineChartElement) updateLineChart();
        if (moodHeatmapChartElement) updateHeatmapChart();
        if (moodRadarChartElement) updateRadarChart();
        if (moodHistogramChartElement) updateHistogramChart();
        displayAverageMood();
        displayStreak();
        initializeExportAndShare(moods);
    };

    // Update the mood chart
    function updateMoodChart() {
        if (!moodChartElement) return;
        const ctx = moodChartElement.getContext('2d');

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

        new Chart(ctx, {
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
        if (!moodPieChartElement) return;
        const ctx = moodPieChartElement.getContext('2d');

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

        new Chart(ctx, {
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
        if (!moodLineChartElement) return;
        const ctx = moodLineChartElement.getContext('2d');

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

        new Chart(ctx, {
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
