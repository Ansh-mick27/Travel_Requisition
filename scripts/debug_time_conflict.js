const parseTime = (dateStr, timeStr) => {
    try {
        const d = new Date(`${dateStr}T${timeStr}`);
        if (!isNaN(d.getTime())) return d;
        const d2 = new Date(`${dateStr} ${timeStr}`);
        if (!isNaN(d2.getTime())) return d2;
        return new Date();
    } catch (e) {
        return new Date();
    }
};

const run = () => {
    console.log('--- Debugging Time Parsing ---');

    const dateStr = "2025-12-11";
    const timeStr = "15:10:00"; // 3:10 PM from DB

    const parsed = parseTime(dateStr, timeStr);
    console.log(`Input: ${dateStr}T${timeStr}`);
    console.log(`Parsed toString:  ${parsed.toString()}`);
    console.log(`Parsed ISO:       ${parsed.toISOString()}`);

    // Check "Now"
    const now = new Date();
    console.log(`Now toString:     ${now.toString()}`);
    console.log(`Now ISO:          ${now.toISOString()}`);

    // Request Date - isToday check
    // In app: new Date(request.pickup_date).toDateString()
    const reqDate = new Date(dateStr);
    console.log(`ReqDate toString: ${reqDate.toString()}`);
    console.log(`ReqDate (toDateString): ${reqDate.toDateString()}`);
    console.log(`Now (toDateString):     ${now.toDateString()}`);

    const isToday = reqDate.toDateString() === now.toDateString();
    console.log(`isToday: ${isToday}`);

    // Logic Check
    let reqStart = parsed;
    if (isToday && reqStart < now) {
        console.log('Comparison: reqStart < now. TRUE. Updating to Now.');
        reqStart = now;
    } else {
        console.log('Comparison: reqStart >= now OR not today. FALSE.');
        console.log(`reqStart: ${reqStart.getTime()}`);
        console.log(`now:      ${now.getTime()}`);
        console.log(`Diff:     ${reqStart.getTime() - now.getTime()}`);
    }
}

run();
