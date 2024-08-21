function updateMoodChart() {
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
    const averageMood = getAverageMood(averageMoodScore);

    const ctx = document.getElementById('mood-chart').getContext('2d');
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: Object.keys(moodCounts),
            datasets: [{
                label: 'Mood Frequency',
                data: Object.values(moodCounts),
                backgroundColor: 'rgba(0, 123, 255, 0.5)',
                borderColor: 'rgba(0, 123, 255, 1)',
                borderWidth: 2,
                fill: false,
                lineTension: 0.1
            }, {
                label: 'Average Mood Score',
                data: new Array(Object.keys(moodCounts).length).fill(averageMoodScore),
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
                pointRadius: 0,
                type: 'line',
                borderDash: [10, 5],
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function getAverageMood(score) {
    if (score >= 4.5) return 'Happy';
    if (score >= 3.5) return 'Excited';
    if (score >= 2.5) return 'Neutral';
    if (score >= 1.5) return 'Anxious';
    if (score >= 0.5) return 'Sad';
    return 'Angry';
}
