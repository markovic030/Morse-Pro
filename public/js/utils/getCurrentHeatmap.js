function getCurrentHeatmap() {
    return (gameState.trainingType === 'send') ? userStats.tx.heat : userStats.rx.heat;
}
