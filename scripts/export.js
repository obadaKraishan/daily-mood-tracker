document.getElementById('export-csv').addEventListener('click', () => {
    const csvContent = "data:text/csv;charset=utf-8," + moods.map(e => `${e.date},${e.mood},${e.note || ''}`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "mood_data.csv");
    document.body.appendChild(link);
    link.click();
});

document.getElementById('share-data').addEventListener('click', () => {
    const shareText = moods.map(e => `Date: ${e.date}, Mood: ${e.mood}, Note: ${e.note || ''}`).join("\n");
    const shareLink = `mailto:?subject=Mood Data&body=${encodeURIComponent(shareText)}`;
    window.location.href = shareLink;
});
