function getAdaptiveSubset(sourceArray, count, itemKey = null) {
    const heat = getCurrentHeatmap();
    
    // Create a shallow copy with weights
    const weightedItems = sourceArray.map(item => {
        const target = itemKey ? item[itemKey] : item;
        const errorWeight = calculateStringWeight(target, heat);
        const randomFactor = Math.random() * 10; 
        return { item, sortValue: errorWeight + randomFactor };
    });

    weightedItems.sort((a, b) => b.sortValue - a.sortValue);
    return weightedItems.slice(0, count).map(w => w.item);
}
