
const { createClient } = require('@supabase/supabase-js');

// Config
const SUPABASE_URL = 'https://fhdhweeenabekekmhudu.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_DmWEYKAmBo8CFTz8EXxwfQ_rH3jJGCX';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// LOGIC REPLICATION (The exact logic we put in the app)
const parseDateTime = (dateStr, timeStr) => {
    try {
        const [y, m, d] = dateStr.split('-').map(Number);
        const timeParts = timeStr.split(':');
        const hours = Number(timeParts[0]);
        const minutes = Number(timeParts[1]);
        const seconds = timeParts[2] ? Number(timeParts[2]) : 0;
        return new Date(y, m - 1, d, hours, minutes, seconds);
    } catch (e) {
        return new Date(`${dateStr}T${timeStr}`);
    }
};

const checkStatus = (trips) => {
    const now = new Date();
    // Count how many are "Active Now"
    const activeTrips = trips.filter(t => {
        let start = parseDateTime(t.pickup_date, t.pickup_time);
        const end = parseDateTime(t.pickup_date, t.drop_time);

        // Pragmatic Start
        const isToday = start.toDateString() === now.toDateString();
        if (isToday && start < now) start = now;

        return (now >= start && now <= end);
    });

    return activeTrips.length > 0 ? "BUSY" : "FREE";
};

async function runTest() {
    console.log("Running Instant Logic Verification...\n");
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    // Helper to format time as HH:MM:SS
    const formatTime = (d) => d.toTimeString().split(' ')[0];

    // DEFINING TEST CASES
    const testCases = [
        {
            name: "CASE 1: Past Trip (Ended 5 mins ago)",
            startTime: new Date(now.getTime() - 60 * 60000), // -60 mins
            endTime: new Date(now.getTime() - 5 * 60000),    // -5 mins
            expected: "FREE"
        },
        {
            name: "CASE 2: Current Trip (Started 5 mins ago, Ends in 30 mins)",
            startTime: new Date(now.getTime() - 5 * 60000),  // -5 mins
            endTime: new Date(now.getTime() + 30 * 60000),   // +30 mins
            expected: "BUSY"
        },
        {
            name: "CASE 3: Future Trip (Starts in 30 mins)",
            startTime: new Date(now.getTime() + 30 * 60000), // +30 mins
            endTime: new Date(now.getTime() + 90 * 60000),   // +90 mins
            expected: "FREE"
        }
    ];

    for (const test of testCases) {
        console.log(`--- ${test.name} ---`);
        console.log(`   Time Window: ${formatTime(test.startTime)} to ${formatTime(test.endTime)}`);
        console.log(`   Current Time: ${formatTime(now)}`);

        // MOCK DATA OBJECT (Simulating DB Row)
        const mockTrip = [{
            pickup_date: todayStr,
            pickup_time: formatTime(test.startTime),
            drop_time: formatTime(test.endTime)
        }];

        const result = checkStatus(mockTrip);
        console.log(`   Result: ${result}`);

        if (result === test.expected) {
            console.log("   ✅ PASSED");
        } else {
            console.log("   ❌ FAILED (Expected " + test.expected + ")");
        }
        console.log("");
    }
}

runTest();
