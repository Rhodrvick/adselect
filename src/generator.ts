import fs from 'fs';
import path from 'path';
import axios from 'axios';

const FIRST_NAMES = [
    'Grace', 'Brian', 'Faith', 'Kelvin', 'Mercy', 'Ian', 'Joy', 'Victor', 'Sharon', 'Collins',
    'Brenda', 'Dennis', 'Cynthia', 'Kevin', 'Eunice', 'Baraka', 'Diana', 'Erick', 'Gloria', 'Frank',
    'Aisha', 'Daniel', 'Naomi', 'Samuel', 'Ruth', 'Peter', 'Esther', 'Joseph', 'Lydia', 'David',
    'Ann', 'Michael', 'Beatrice', 'James', 'Caroline', 'Paul', 'Irene', 'Stephen', 'Winnie', 'George',
    'Joyce', 'Charles', 'Priscilla', 'Anthony', 'Catherine', 'Robert', 'Susan', 'Mark', 'Janet', 'Philip',
    'Alice', 'Andrew', 'Rose', 'Thomas', 'Margaret', 'John', 'Florence', 'Edward', 'Betty', 'Henry',
    'Sarah', 'Patrick', 'Helen', 'Francis', 'Mary', 'Simon', 'Dorothy', 'Martin', 'Jane', 'Benjamin',
    'Lilian', 'Nicholas', 'Agnes', 'Chris', 'Eva', 'Alex', 'Pauline', 'Ken', 'Judy', 'Moses',
    'Stella', 'Felix', 'Tabitha', 'Oscar', 'Violet', 'Derek', 'Purity', 'Lewis', 'Amanda', 'Brian',
    'Caroline', 'Edwin', 'Daisy', 'Gilbert', 'Gladys', 'Isaac', 'Hilda', 'Jackson', 'Ivy', 'Leonard',
    'Joan', 'Maurice', 'Karen', 'Oliver', 'Laura', 'Quincy', 'Monica', 'Raymond', 'Nancy', 'Terry',
    'Olive', 'Vincent', 'Peggy', 'Walter', 'Rita', 'Zachary', 'Sylvia', 'Allan', 'Tracy', 'Bernard',
    'Una', 'Clifford', 'Wendy', 'Duncan', 'Yvonne', 'Elijah', 'Zara', 'Fredrick', 'Abigail', 'Gordon',
    'Bella', 'Harrison', 'Chloe', 'Ivan', 'Elena', 'Joel', 'Fiona', 'Kyle', 'Gemma', 'Luke',
    'Hannah', 'Noah', 'Isla', 'Owen', 'Jade', 'Ryan', 'Katie', 'Sean', 'Leah', 'Tyler',
    'Mia', 'Adrian', 'Nina', 'Blake', 'Paula', 'Caleb', 'Quinn', 'Dylan', 'Rachel', 'Ethan',
    'Sofia', 'Finn', 'Tara', 'Grant', 'Uma', 'Hugo', 'Vera', 'Jake', 'Willow', 'Liam',
    'Amara', 'Kwame', 'Zuri', 'Jabari', 'Nia', 'Malik', 'Imani', 'Kofi', 'Amina', 'Tariq',
    'Sanaa', 'Omar', 'Layla', 'Hassan', 'Zahra', 'Idris', 'Fatima', 'Yusuf', 'Aaliyah', 'Jamal',
    'Sienna', 'Marcus', 'Ruby', 'Julian', 'Clara', 'Theo', 'Maya', 'Leo', 'Nora', 'Arthur'
];

const LAST_NAMES = [
    'Wanjiku', 'Ochieng', 'Kiprop', 'Mutua', 'Achieng', 'Kamau', 'Odhiambo', 'Chepkemoi', 'Kariuki', 'Naliaka',
    'Omondi', 'Kiptoo', 'Mwangi', 'Ndungu', 'Otieno', 'Karanja', 'Kilonzo', 'Chepchumba', 'Maina', 'Njeri',
    'Wambui', 'Onyango', 'Kipchumba', 'Muthoni', 'Okoth', 'Nyambura', 'Koech', 'Wairimu', 'Ouma', 'Waithera',
    'Kiplagat', 'Atieno', 'Cheruiyot', 'Wangari', 'Owino', 'Nyokabi', 'Rotich', 'Wanjiru', 'Okello', 'Mbugua',
    'Kimani', 'Auma', 'Langat', 'Njoroge', 'Owuor', 'Njoki', 'Sang', 'Wambugu', 'Oloo', 'Gathoni',
    'Barasa', 'Akoth', 'Korir', 'Gitau', 'Nyawira', 'Rono', 'Wanjala', 'Simiyu', 'Adhiambo', 'Kipkoech',
    'Wafula', 'Chebet', 'Njuguna', 'Odongo', 'Njenga', 'Were', 'Anyango', 'Kiprotich', 'Gichuru', 'Okumu',
    'Kipkemoi', 'Macharia', 'Musyoka', 'Akinyi', 'Cherop', 'Githinji', 'Kipkirui', 'Mburu', 'Mutiso', 'Awino',
    'Chepkoech', 'Kipngetich', 'Kipchirchir', 'Kiprono', 'Kipkemboi', 'Kipkorir', 'Smith', 'Johnson', 'Williams', 'Brown',
    'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson',
    'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White',
    'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King',
    'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker',
    'Hall', 'Rivera', 'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Gomez', 'Phillips', 'Evans', 'Turner'
];

const COUNTRIES = [
    'Afghanistan', 'Albania', 'Algeria', 'American Samoa', 'Andorra', 'Angola', 'Anguilla', 'Antarctica',
    'Antigua & Barbuda', 'Argentina', 'Armenia', 'Aruba', 'Australia', 'Austria', 'Azerbaijan', 'Bahamas',
    'Bahrain', 'Bangladesh', 'Barbados', 'Belarus', 'Belgium', 'Belize', 'Benin', 'Bermuda', 'Bhutan',
    'Bolivia', 'Bosnia & Herzegovina', 'Botswana', 'Brazil', 'British Virgin Islands', 'Brunei', 'Bulgaria',
    'Burkina Faso', 'Burundi', 'Cambodia', 'Cameroon', 'Canada', 'Cape Verde', 'Cayman Islands',
    'Central African Republic', 'Chad', 'Chile', 'China', 'Colombia', 'Comoros', 'Congo',
    'Congo (Democratic Republic)', 'Costa Rica', 'Croatia', 'Cuba', 'Cyprus', 'Czech Republic', 'Denmark',
    'Djibouti', 'Dominica', 'Dominican Republic', 'Ecuador', 'Egypt', 'El Salvador', 'Equatorial Guinea',
    'Eritrea', 'Estonia', 'Eswatini', 'Ethiopia', 'Fiji', 'Finland', 'France', 'Gabon', 'Gambia',
    'Georgia', 'Germany', 'Ghana', 'Gibraltar', 'Greece', 'Greenland', 'Grenada', 'Guam', 'Guatemala',
    'Guernsey', 'Guinea', 'Guinea-Bissau', 'Guyana', 'Haiti', 'Honduras', 'Hong Kong', 'Hungary',
    'Iceland', 'India', 'Indonesia', 'Iran', 'Iraq', 'Ireland', 'Isle of Man', 'Israel', 'Italy',
    'Jamaica', 'Japan', 'Jersey', 'Jordan', 'Kazakhstan', 'Kenya', 'Kiribati', 'Kuwait', 'Kyrgyzstan',
    'Laos', 'Latvia', 'Lebanon', 'Lesotho', 'Liberia', 'Libya', 'Liechtenstein', 'Lithuania', 'Luxembourg',
    'Macao', 'Madagascar', 'Malawi', 'Malaysia', 'Maldives', 'Mali', 'Malta', 'Marshall Islands',
    'Mauritania', 'Mauritius', 'Mexico', 'Micronesia', 'Moldova', 'Monaco', 'Mongolia', 'Montenegro',
    'Montserrat', 'Morocco', 'Mozambique', 'Myanmar', 'Namibia', 'Nauru', 'Nepal', 'Netherlands',
    'New Caledonia', 'New Zealand', 'Nicaragua', 'Niger', 'Nigeria', 'North Korea', 'North Macedonia',
    'Norway', 'Oman', 'Pakistan', 'Palau', 'Palestine', 'Panama', 'Papua New Guinea', 'Paraguay',
    'Peru', 'Philippines', 'Poland', 'Portugal', 'Puerto Rico', 'Qatar', 'Romania', 'Russia', 'Rwanda',
    'Saint Kitts & Nevis', 'Saint Lucia', 'Saint Vincent & the Grenadines', 'Samoa', 'San Marino',
    'Saudi Arabia', 'Senegal', 'Serbia', 'Seychelles', 'Sierra Leone', 'Singapore', 'Slovakia', 'Slovenia',
    'Solomon Islands', 'Somalia', 'South Africa', 'South Korea', 'South Sudan', 'Spain', 'Sri Lanka',
    'Sudan', 'Suriname', 'Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand',
    'Timor-Leste', 'Togo', 'Tonga', 'Trinidad & Tobago', 'Tunisia', 'Turkey', 'Turkmenistan', 'Tuvalu',
    'Uganda', 'Ukraine', 'United Arab Emirates', 'United Kingdom', 'United States', 'Uruguay', 'Uzbekistan',
    'Vanuatu', 'Venezuela', 'Vietnam', 'Yemen', 'Zambia', 'Zimbabwe'
];

const EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com', 'proton.me', 'mail.com', 'aol.com'];

const usedUsernames = new Set<string>();
const usedEmails = new Set<string>();

export interface Profile {
    name: string;
    username: string;
    email: string;
    country: string;
    phone: string;
    password: string;
    sponsor: string;
}

function slug(value: string): string {
    return value.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function pick<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

function randomDigits(len: number): string {
    let s = '';
    for (let i = 0; i < len; i++) s += Math.floor(Math.random() * 10);
    return s;
}

export function generateRealisticProfile(sponsor: string): Profile {
    let attempts = 0;
    let username = '';
    let email = '';
    let firstName = '';
    let lastName = '';

    do {
        firstName = pick(FIRST_NAMES);
        lastName = pick(LAST_NAMES);
        const firstSlug = slug(firstName);
        const lastSlug = slug(lastName);
        const style = Math.floor(Math.random() * 6);

        if (style === 0) username = `${firstSlug}${lastSlug}${randomDigits(3)}`;
        else if (style === 1) username = `${firstSlug}.${lastSlug}${randomDigits(2)}`;
        else if (style === 2) username = `${firstSlug}${randomDigits(4)}`;
        else if (style === 3) username = `${lastSlug}${firstSlug}${randomDigits(2)}`;
        else if (style === 4) username = `${firstSlug}_${lastSlug}${randomDigits(2)}`;
        else username = `${firstSlug}${lastSlug.charAt(0)}${randomDigits(4)}`;

        username = username.slice(0, 20);

        const domain = pick(EMAIL_DOMAINS);
        const emailStyle = Math.floor(Math.random() * 4);
        if (emailStyle === 0) email = `${firstSlug}.${lastSlug}${randomDigits(2)}@${domain}`;
        else if (emailStyle === 1) email = `${firstSlug}${randomDigits(3)}@${domain}`;
        else if (emailStyle === 2) email = `${firstSlug}_${lastSlug}@${domain}`;
        else email = `${firstSlug}${lastSlug}${randomDigits(3)}@${domain}`;

        attempts++;
    } while ((usedUsernames.has(username) || usedEmails.has(email)) && attempts < 40);

    usedUsernames.add(username);
    usedEmails.add(email);

    if (usedUsernames.size > 8000) usedUsernames.clear();
    if (usedEmails.size > 8000) usedEmails.clear();

    const phone = `${Math.floor(6 + Math.random() * 4)}${randomDigits(8)}`;
    const password = `${slug(firstName)}${slug(lastName)}${randomDigits(3)}!${2020 + Math.floor(Math.random() * 7)}`;
    const country = pick(COUNTRIES);

    return {
        name: `${firstName} ${lastName}`,
        username,
        email,
        country,
        phone,
        password,
        sponsor
    };
}

interface ProxyEntry {
    url: string;
    latency: number;
}

let liveProxies: ProxyEntry[] = [];
let lastFetch = 0;
let fetchInProgress = false;

const PROXY_SOURCES = [
    'https://raw.githubusercontent.com/monosans/proxy-list/main/proxies/http.txt',
    'https://raw.githubusercontent.com/proxmint/free-proxy-list/main/proxies/http.txt',
    'https://raw.githubusercontent.com/solproxy/sol-free-proxy-list/main/http.txt',
    'https://raw.githubusercontent.com/proxifly/free-proxy-list/main/proxies/http.txt',
    'https://cdn.jsdelivr.net/gh/proxyscrape/free-proxy-list@main/proxies/http/data.txt',
    'https://raw.githubusercontent.com/MrMarble/proxy-list/main/http.txt',
    'https://api.proxyscrape.com/v2/?request=displayproxies&protocol=http&timeout=5000&country=all&ssl=all&anonymity=all'
];

function normalizeProxyUrl(raw: string): string | null {
    let url = raw.trim();
    if (!url || url.startsWith('#')) return null;
    if (url.includes('://')) {
        try {
            const parsed = new URL(url);
            if (!parsed.hostname || !parsed.port) return null;
            return `http://${parsed.hostname}:${parsed.port}`;
        } catch {
            return null;
        }
    }
    if (/^\d{1,3}(\.\d{1,3}){3}:\d+$/.test(url)) {
        return `http://${url}`;
    }
    return null;
}

async function fetchLiveProxies(): Promise<void> {
    if (fetchInProgress) return;
    fetchInProgress = true;

    const collected: ProxyEntry[] = [];
    let rank = 0;

    for (const src of PROXY_SOURCES) {
        try {
            const res = await axios.get(src, { timeout: 10000, responseType: 'text' });
            const lines = String(res.data).split(/[\r\n]+/);
            for (const line of lines) {
                const normalized = normalizeProxyUrl(line);
                if (normalized) {
                    collected.push({ url: normalized, latency: 500 + rank * 50 });
                }
            }
            rank++;
        } catch {
        }
    }

    if (process.env.PROXY_LIST) {
        const extra = process.env.PROXY_LIST.split(',').map((p: string) => p.trim()).filter(Boolean);
        for (const u of extra) {
            const normalized = normalizeProxyUrl(u);
            if (normalized) collected.push({ url: normalized, latency: 100 });
        }
    }

    const proxyPath = path.join(__dirname, '../proxies.txt');
    if (fs.existsSync(proxyPath)) {
        try {
            const data = fs.readFileSync(proxyPath, 'utf8');
            const lines = data.split('\n').map((l: string) => l.trim()).filter(Boolean);
            for (const u of lines) {
                const normalized = normalizeProxyUrl(u);
                if (normalized) collected.push({ url: normalized, latency: 200 });
            }
        } catch {
        }
    }

    collected.sort((a, b) => a.latency - b.latency);
    const unique = new Map<string, ProxyEntry>();
    for (const p of collected) {
        if (!unique.has(p.url)) unique.set(p.url, p);
    }

    liveProxies = Array.from(unique.values()).slice(0, 200);
    lastFetch = Date.now();
    fetchInProgress = false;
    console.log(`[*] Loaded ${liveProxies.length} proxies`);
}

export async function ensureProxiesReady(): Promise<void> {
    if (Date.now() - lastFetch > 45000 || liveProxies.length < 10) {
        await fetchLiveProxies();
    }
}

export function getNextProxy(): string | undefined {
    if (liveProxies.length === 0) return undefined;
    const top = liveProxies.slice(0, Math.min(60, liveProxies.length));
    return top[Math.floor(Math.random() * top.length)]?.url;
}

export function markProxyFailed(proxyUrl: string): void {
    liveProxies = liveProxies.filter(p => p.url !== proxyUrl);
}

setInterval(() => {
    fetchLiveProxies().catch(() => {});
}, 45000);

fetchLiveProxies().catch(() => {});
