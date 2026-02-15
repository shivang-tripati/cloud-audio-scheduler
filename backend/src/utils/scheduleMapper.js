function flattenScheduleTargets(schedule) {
    const targets = schedule.targets || [];

    let target_type = 'ALL';
    let target_values = [];

    if (targets.length > 0) {
        target_type = targets[0].target_type;

        if (target_type !== 'ALL') {
            target_values = targets.map(t => t.target_value);
        }
    }

    return {
        ...schedule,
        target_type,
        target_values,
        targets: undefined // remove raw targets
    };
}

module.exports = { flattenScheduleTargets };
