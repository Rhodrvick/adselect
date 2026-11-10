import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { generateRealisticProfile, getNextProxy, ensureProxiesReady, markProxyFailed } from './generator';

const BASE_URL = 'https://adselect.org';
const DB_PATH = path.join(__dirname, '../databse.json');

export interface DatabaseSchema {
    totalCreated: number;
    successList: Array<{
        username: string;
        email: string;
        createdAt: string;
        balance: number;
    }>;
    failedList: Array<{
        username: string;
        error: string;
        time: string;
    }>;
    isRunning: boolean;
}

function loadDb(): DatabaseSchema {
    if (fs.existsSync(DB_PATH)) {
        try {
            const parsed = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
            return {
                totalCreated: parsed.totalCreated || 0,
                successList: parsed.successList || [],
                failedList: parsed.failedList || [],
                isRunning: false
            };
        } catch {
        }
    }
    return { totalCreated: 0, successList: [], failedList: [], isRunning: false };
}

function saveDb(data: DatabaseSchema) {
    const { isRunning, ...toSave } = data;
    try {
        fs.writeFileSync(DB_PATH, JSON.stringify(toSave, null, 2));
    } catch {
    }
}

function pushError(username: string, error: string) {
    try {
        const db = loadDb();
        db.failedList.unshift({
            username,
            error: String(error).slice(0, 300),
            time: new Date().toISOString()
        });
        db.failedList = db.failedList.slice(0, 200);
        saveDb(db);
    } catch {
    }
}

let isRunning = false;

export function getEngineStatus() {
    const db = loadDb();
    db.isRunning = isRunning;
    return db;
}

function createSafeAgent(proxyUrl: string): HttpsProxyAgent<string> | undefined {
    try {
        const agent = new HttpsProxyAgent(proxyUrl, {
            timeout: 10000,
            rejectUnauthorized: false
        } as any);
        agent.on('error', () => {});
        return agent;
    } catch {
        return undefined;
    }
}

export async function startAutomationLoop(sponsor: string, targetCount: number) {
    if (isRunning) return;
    isRunning = true;

    let createdCount = 0;

    while (isRunning && (targetCount === 0 || createdCount < targetCount)) {
        try {
            await ensureProxiesReady();
            const profile = generateRealisticProfile(sponsor);

            let success = false;
            let lastError = '';

            for (let attempt = 0; attempt < 5 && !success && isRunning; attempt++) {
                const proxyUrl = getNextProxy();
                const agent = proxyUrl ? createSafeAgent(proxyUrl) : undefined;

                try {
                    console.log(`[*] Registering profile: ${profile.username} via proxy: ${proxyUrl || 'Direct'} (try ${attempt + 1})`);

                    const res = await axios.post(`${BASE_URL}/api/auth/register`, {
                        name: profile.name,
                        username: profile.username,
                        email: profile.email,
                        phone: profile.phone,
                        password: profile.password,
                        country: profile.country,
                        sponsor: profile.sponsor,
                        website: '',
                        sourceUrl: `${BASE_URL}/register?ref=${encodeURIComponent(profile.sponsor)}`
                    }, {
                        headers: {
                            'Content-Type': 'application/json',
                            'Origin': BASE_URL,
                            'Referer': `${BASE_URL}/register?ref=${profile.sponsor}`,
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
                        },
                        httpsAgent: agent,
                        httpAgent: agent,
                        timeout: 12000,
                        validateStatus: () => true,
                        maxRedirects: 3
                    });

                    if (res.status === 200 || res.status === 201) {
                        const db = loadDb();
                        const createdName = res.data?.username || res.data?.userid || profile.username;

                        db.totalCreated += 1;
                        db.successList.unshift({
                            username: String(createdName),
                            email: profile.email,
                            createdAt: new Date().toISOString(),
                            balance: Number(res.data?.signupBonus ?? 10)
                        });
                        saveDb(db);
                        createdCount++;
                        success = true;
                        console.log(`[+] Success! Created username: ${createdName}`);
                    } else if (res.data?.code === 'paid_required') {
                        lastError = 'Registration is in paid mode — free signup is closed.';
                        pushError(profile.username, lastError);
                        isRunning = false;
                        break;
                    } else {
                        lastError = res.data?.error || `HTTP ${res.status}`;
                        if (proxyUrl) markProxyFailed(proxyUrl);
                    }
                } catch (err: any) {
                    lastError = err.code || err.message || 'Network error';
                    if (proxyUrl) markProxyFailed(proxyUrl);
                    console.error(`[-] Attempt ${attempt + 1} failed for ${profile.username}:`, lastError);
                }
            }

            if (!success && lastError) {
                pushError(profile.username, lastError);
                console.error(`[-] Final failure for ${profile.username}:`, lastError);
            }
        } catch (loopErr: any) {
            console.error('[-] Loop error (recovered):', loopErr?.message || loopErr);
        }

        const randomCooldownMs = Math.floor(8000 + Math.random() * 14000);
        console.log(`[*] Mimicking human pause... Sleeping for ${(randomCooldownMs / 1000).toFixed(1)} seconds.`);
        await new Promise(resolve => setTimeout(resolve, randomCooldownMs));
    }

    isRunning = false;
}

export function stopAutomationLoop() {
    isRunning = false;
}
