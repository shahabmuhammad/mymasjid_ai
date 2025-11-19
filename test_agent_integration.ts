import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { Agent } from './lib/api/agent';

async function testAgent() {
    try {
        console.log("Testing Agent with prompt: 'Find masajid in Pakistan, Karachi'");
        const response = await Agent("Find masajid in Pakistan, Karachi");
        console.log("Agent Response:", JSON.stringify(response, null, 2));
    } catch (error) {
        console.error("Test Failed:", error);
    }
}

testAgent();
