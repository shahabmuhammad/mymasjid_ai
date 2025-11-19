import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Agent } from './lib/api/agent';

async function testSearchMasjid() {
    console.log("\n=== Test 1: Search masajid in Islamabad ===");
    try {
        const response1 = await Agent("Find masajid in Islamabad Pakistan");
        console.log("Agent Response:", JSON.stringify(response1, null, 2));
    } catch (error) {
        console.error("Test 1 Failed:", error);
    }

    console.log("\n\n=== Test 2: Get salah timings for Faisal Mosque ===");
    try {
        const response2 = await Agent("Give me salah timings for Faisal Mosque for November 19th");
        console.log("Agent Response:", JSON.stringify(response2, null, 2));
    } catch (error) {
        console.error("Test 2 Failed:", error);
    }
}

testSearchMasjid();
