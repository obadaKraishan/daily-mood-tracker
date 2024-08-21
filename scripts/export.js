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
