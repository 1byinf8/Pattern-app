/**
 * Daily Problem Picker App
 * Smart random selection with pattern avoidance, difficulty curve, and progress tracking
 */

// ===================== DATA MANAGEMENT =====================

const STORAGE_KEYS = {
    COMPLETED: 'dpp_completedProblems',
    SKIPPED: 'dpp_skippedProblems',
    LAST_PATTERN: 'dpp_lastPattern',
    CURRENT_PROBLEM: 'dpp_currentProblem',
    STREAK_DATA: 'dpp_streakData',
    NOTES: 'dpp_notes',
    LAST_COMPLETED: 'dpp_lastCompleted'
};

// Difficulty mapping for common LeetCode problems (based on actual LeetCode data)
const DIFFICULTY_MAP = {
    // Easy
    '1': 'Easy', '13': 'Easy', '14': 'Easy', '20': 'Easy', '21': 'Easy', '26': 'Easy', '27': 'Easy',
    '28': 'Easy', '35': 'Easy', '53': 'Easy', '58': 'Easy', '66': 'Easy', '67': 'Easy', '69': 'Easy',
    '70': 'Easy', '83': 'Easy', '88': 'Easy', '94': 'Easy', '100': 'Easy', '101': 'Easy', '104': 'Easy',
    '108': 'Easy', '110': 'Easy', '111': 'Easy', '112': 'Easy', '118': 'Easy', '119': 'Easy', '121': 'Easy',
    '125': 'Easy', '136': 'Easy', '141': 'Easy', '144': 'Easy', '145': 'Easy', '160': 'Easy', '167': 'Easy',
    '168': 'Easy', '169': 'Easy', '171': 'Easy', '175': 'Easy', '181': 'Easy', '182': 'Easy', '183': 'Easy',
    '190': 'Easy', '191': 'Easy', '193': 'Easy', '195': 'Easy', '196': 'Easy', '197': 'Easy', '202': 'Easy',
    '203': 'Easy', '204': 'Easy', '205': 'Easy', '206': 'Easy', '217': 'Easy', '219': 'Easy', '225': 'Easy',
    '226': 'Easy', '228': 'Easy', '231': 'Easy', '232': 'Easy', '234': 'Easy', '235': 'Easy', '237': 'Easy',
    '242': 'Easy', '243': 'Easy', '246': 'Easy', '252': 'Easy', '257': 'Easy', '258': 'Easy', '263': 'Easy',
    '266': 'Easy', '268': 'Easy', '270': 'Easy', '276': 'Easy', '278': 'Easy', '283': 'Easy', '290': 'Easy',
    '292': 'Easy', '293': 'Easy', '303': 'Easy', '326': 'Easy', '338': 'Easy', '339': 'Easy', '342': 'Easy',
    '344': 'Easy', '345': 'Easy', '346': 'Easy', '349': 'Easy', '350': 'Easy', '359': 'Easy', '367': 'Easy',
    '374': 'Easy', '383': 'Easy', '387': 'Easy', '389': 'Easy', '392': 'Easy', '401': 'Easy', '404': 'Easy',
    '405': 'Easy', '409': 'Easy', '412': 'Easy', '414': 'Easy', '415': 'Easy', '422': 'Easy', '434': 'Easy',
    '441': 'Easy', '443': 'Easy', '448': 'Easy', '455': 'Easy', '459': 'Easy', '461': 'Easy', '463': 'Easy',
    '476': 'Easy', '482': 'Easy', '485': 'Easy', '492': 'Easy', '496': 'Easy', '500': 'Easy', '501': 'Easy',
    '504': 'Easy', '506': 'Easy', '507': 'Easy', '509': 'Easy', '520': 'Easy', '521': 'Easy', '530': 'Easy',
    '541': 'Easy', '543': 'Easy', '551': 'Easy', '557': 'Easy', '559': 'Easy', '561': 'Easy', '563': 'Easy',
    '566': 'Easy', '572': 'Easy', '575': 'Easy', '581': 'Easy', '589': 'Easy', '590': 'Easy', '594': 'Easy',
    '598': 'Easy', '599': 'Easy', '605': 'Easy', '606': 'Easy', '617': 'Easy', '628': 'Easy', '637': 'Easy',
    '643': 'Easy', '645': 'Easy', '653': 'Easy', '657': 'Easy', '661': 'Easy', '671': 'Easy', '674': 'Easy',
    '680': 'Easy', '682': 'Easy', '693': 'Easy', '696': 'Easy', '697': 'Easy', '700': 'Easy', '703': 'Easy',
    '704': 'Easy', '705': 'Easy', '706': 'Easy', '709': 'Easy', '717': 'Easy', '720': 'Easy', '724': 'Easy',
    '728': 'Easy', '733': 'Easy', '734': 'Easy', '744': 'Easy', '746': 'Easy', '747': 'Easy', '748': 'Easy',
    '762': 'Easy', '766': 'Easy', '771': 'Easy', '783': 'Easy', '796': 'Easy', '804': 'Easy', '806': 'Easy',
    '812': 'Easy', '819': 'Easy', '821': 'Easy', '824': 'Easy', '830': 'Easy', '832': 'Easy', '836': 'Easy',
    '844': 'Easy', '852': 'Easy', '859': 'Easy', '860': 'Easy', '867': 'Easy', '868': 'Easy', '872': 'Easy',
    '876': 'Easy', '883': 'Easy', '884': 'Easy', '888': 'Easy', '892': 'Easy', '893': 'Easy', '896': 'Easy',
    '897': 'Easy', '905': 'Easy', '908': 'Easy', '914': 'Easy', '917': 'Easy', '922': 'Easy', '925': 'Easy',
    '929': 'Easy', '933': 'Easy', '937': 'Easy', '938': 'Easy', '941': 'Easy', '942': 'Easy', '944': 'Easy',
    '953': 'Easy', '961': 'Easy', '965': 'Easy', '970': 'Easy', '976': 'Easy', '977': 'Easy', '989': 'Easy',
    '993': 'Easy', '997': 'Easy', '999': 'Easy', '1002': 'Easy', '1005': 'Easy', '1009': 'Easy', '1010': 'Easy',
    '1013': 'Easy', '1018': 'Easy', '1021': 'Easy', '1022': 'Easy', '1025': 'Easy', '1029': 'Easy', '1037': 'Easy',
    '1046': 'Easy', '1047': 'Easy', '1051': 'Easy', '1056': 'Easy', '1064': 'Easy', '1071': 'Easy', '1078': 'Easy',
    '1086': 'Easy', '1089': 'Easy', '1099': 'Easy', '1108': 'Easy', '1119': 'Easy', '1122': 'Easy', '1128': 'Easy',
    '1137': 'Easy', '1154': 'Easy', '1160': 'Easy', '1165': 'Easy', '1170': 'Easy', '1175': 'Easy', '1184': 'Easy',
    '1189': 'Easy', '1200': 'Easy', '1207': 'Easy', '1217': 'Easy', '1221': 'Easy', '1232': 'Easy', '1237': 'Easy',
    '1260': 'Easy', '1266': 'Easy', '1275': 'Easy', '1281': 'Easy', '1287': 'Easy', '1290': 'Easy', '1295': 'Easy',
    '1299': 'Easy', '1304': 'Easy', '1309': 'Easy', '1313': 'Easy', '1317': 'Easy', '1331': 'Easy', '1332': 'Easy',
    '1337': 'Easy', '1342': 'Easy', '1346': 'Easy', '1351': 'Easy', '1356': 'Easy', '1360': 'Easy', '1365': 'Easy',
    '1370': 'Easy', '1374': 'Easy', '1380': 'Easy', '1385': 'Easy', '1389': 'Easy', '1394': 'Easy', '1399': 'Easy',
    '1403': 'Easy', '1408': 'Easy', '1413': 'Easy', '1417': 'Easy', '1422': 'Easy', '1431': 'Easy', '1436': 'Easy',
    '1437': 'Easy', '1441': 'Easy', '1446': 'Easy', '1450': 'Easy', '1455': 'Easy', '1460': 'Easy', '1464': 'Easy',
    '1469': 'Easy', '1470': 'Easy', '1474': 'Easy', '1475': 'Easy', '1480': 'Easy', '1486': 'Easy', '1491': 'Easy',
    '1502': 'Easy', '1507': 'Easy', '1512': 'Easy', '1518': 'Easy', '1528': 'Easy', '1534': 'Easy', '1539': 'Easy',
    '1544': 'Easy', '1550': 'Easy', '1556': 'Easy', '1560': 'Easy', '1566': 'Easy', '1572': 'Easy', '1576': 'Easy',
    '1582': 'Easy', '1588': 'Easy', '1598': 'Easy', '1603': 'Easy', '1608': 'Easy', '1614': 'Easy', '1619': 'Easy',
    '1624': 'Easy', '1629': 'Easy', '1636': 'Easy', '1640': 'Easy', '1646': 'Easy', '1652': 'Easy', '1656': 'Easy',
    '1662': 'Easy', '1668': 'Easy', '1672': 'Easy', '1678': 'Easy', '1684': 'Easy', '1688': 'Easy', '1694': 'Easy',
    '1700': 'Easy', '1704': 'Easy', '1710': 'Easy', '1716': 'Easy', '1720': 'Easy', '1725': 'Easy', '1732': 'Easy',
    '1736': 'Easy', '1742': 'Easy', '1748': 'Easy', '1752': 'Easy', '1758': 'Easy', '1763': 'Easy', '1768': 'Easy',
    '1773': 'Easy', '1779': 'Easy', '1784': 'Easy', '1790': 'Easy', '1796': 'Easy', '1800': 'Easy', '1805': 'Easy',
    '1812': 'Easy', '1816': 'Easy', '1822': 'Easy', '1827': 'Easy', '1832': 'Easy', '1837': 'Easy', '1844': 'Easy',
    '1848': 'Easy', '1854': 'Easy', '1859': 'Easy', '1863': 'Easy', '1869': 'Easy', '1876': 'Easy', '1880': 'Easy',
    '1886': 'Easy', '1893': 'Easy', '1897': 'Easy', '1903': 'Easy', '1909': 'Easy', '1913': 'Easy', '1920': 'Easy',
    '1925': 'Easy', '1929': 'Easy', '1935': 'Easy', '1941': 'Easy', '1945': 'Easy', '1952': 'Easy', '1957': 'Easy',
    '1961': 'Easy', '1967': 'Easy', '1971': 'Easy', '1974': 'Easy', '1979': 'Easy', '1984': 'Easy', '1991': 'Easy',
    '1995': 'Easy', '2000': 'Easy', '2006': 'Easy', '2011': 'Easy', '2016': 'Easy', '2022': 'Easy', '2027': 'Easy',
    '2032': 'Easy', '2037': 'Easy', '2042': 'Easy', '2047': 'Easy', '2053': 'Easy', '2057': 'Easy', '2062': 'Easy',
    '2068': 'Easy', '2073': 'Easy', '2078': 'Easy', '2085': 'Easy', '2089': 'Easy', '2094': 'Easy', '2099': 'Easy',
    '2103': 'Easy', '2108': 'Easy', '2114': 'Easy', '2119': 'Easy', '2124': 'Easy', '2129': 'Easy', '2133': 'Easy',
    '2138': 'Easy', '2144': 'Easy', '2148': 'Easy', '2154': 'Easy', '2160': 'Easy', '2164': 'Easy', '2169': 'Easy',
    '2176': 'Easy', '2180': 'Easy', '2185': 'Easy', '2190': 'Easy', '2194': 'Easy', '2200': 'Easy', '2206': 'Easy',
    '2210': 'Easy', '2215': 'Easy', '2220': 'Easy', '2224': 'Easy', '2231': 'Easy', '2235': 'Easy', '2239': 'Easy',
    '2243': 'Easy', '2248': 'Easy', '2255': 'Easy', '2259': 'Easy', '2264': 'Easy', '2269': 'Easy', '2273': 'Easy',
    '2278': 'Easy', '2283': 'Easy', '2287': 'Easy', '2293': 'Easy', '2299': 'Easy', '2303': 'Easy', '2309': 'Easy',
    '2315': 'Easy', '2319': 'Easy', '2325': 'Easy', '2331': 'Easy', '2335': 'Easy', '2341': 'Easy', '2347': 'Easy',
    '2351': 'Easy', '2357': 'Easy', '2363': 'Easy', '2367': 'Easy', '2373': 'Easy', '2379': 'Easy', '2383': 'Easy',
    '2389': 'Easy', '2395': 'Easy', '2399': 'Easy', '2404': 'Easy', '2409': 'Easy', '2413': 'Easy', '2418': 'Easy',
    '2423': 'Easy', '2427': 'Easy', '2432': 'Easy', '2437': 'Easy', '2441': 'Easy', '2446': 'Easy', '2451': 'Easy',
    '2455': 'Easy', '2460': 'Easy', '2465': 'Easy', '2469': 'Easy', '2475': 'Easy', '2481': 'Easy', '2485': 'Easy',
    '2490': 'Easy', '2496': 'Easy', '2500': 'Easy', '2506': 'Easy', '2511': 'Easy', '2515': 'Easy', '2520': 'Easy',
    '2525': 'Easy', '2529': 'Easy', '2535': 'Easy', '2540': 'Easy', '2544': 'Easy', '2549': 'Easy', '2553': 'Easy',
    '2558': 'Easy', '2562': 'Easy', '2566': 'Easy', '2570': 'Easy', '2574': 'Easy', '2578': 'Easy', '2582': 'Easy',
    '2586': 'Easy', '2591': 'Easy', '2595': 'Easy', '2600': 'Easy', '2605': 'Easy', '2609': 'Easy', '2614': 'Easy',

    // Hard problems
    '4': 'Hard', '10': 'Hard', '23': 'Hard', '25': 'Hard', '30': 'Hard', '32': 'Hard', '37': 'Hard',
    '41': 'Hard', '42': 'Hard', '44': 'Hard', '51': 'Hard', '52': 'Hard', '57': 'Hard', '65': 'Hard',
    '68': 'Hard', '72': 'Hard', '76': 'Hard', '84': 'Hard', '85': 'Hard', '87': 'Hard', '97': 'Hard',
    '99': 'Hard', '115': 'Hard', '123': 'Hard', '124': 'Hard', '126': 'Hard', '127': 'Hard', '128': 'Hard',
    '132': 'Hard', '135': 'Hard', '140': 'Hard', '149': 'Hard', '154': 'Hard', '158': 'Hard', '164': 'Hard',
    '174': 'Hard', '188': 'Hard', '212': 'Hard', '214': 'Hard', '218': 'Hard', '224': 'Hard', '233': 'Hard',
    '239': 'Hard', '248': 'Hard', '265': 'Hard', '269': 'Hard', '272': 'Hard', '273': 'Hard', '282': 'Hard',
    '295': 'Hard', '297': 'Hard', '301': 'Hard', '302': 'Hard', '305': 'Hard', '308': 'Hard', '312': 'Hard',
    '315': 'Hard', '316': 'Hard', '317': 'Hard', '321': 'Hard', '327': 'Hard', '329': 'Hard', '330': 'Hard',
    '332': 'Hard', '335': 'Hard', '336': 'Hard', '340': 'Hard', '352': 'Hard', '354': 'Hard', '358': 'Hard',
    '363': 'Hard', '381': 'Hard', '391': 'Hard', '403': 'Hard', '407': 'Hard', '410': 'Hard', '411': 'Hard',
    '420': 'Hard', '432': 'Hard', '440': 'Hard', '446': 'Hard', '458': 'Hard', '460': 'Hard', '466': 'Hard',
    '472': 'Hard', '480': 'Hard', '483': 'Hard', '488': 'Hard', '493': 'Hard', '499': 'Hard', '502': 'Hard',
    '514': 'Hard', '517': 'Hard', '527': 'Hard', '546': 'Hard', '552': 'Hard', '564': 'Hard', '568': 'Hard',
    '587': 'Hard', '591': 'Hard', '600': 'Hard', '629': 'Hard', '630': 'Hard', '632': 'Hard', '639': 'Hard',
    '644': 'Hard', '656': 'Hard', '664': 'Hard', '668': 'Hard', '675': 'Hard', '679': 'Hard', '685': 'Hard',
    '689': 'Hard', '691': 'Hard', '699': 'Hard', '715': 'Hard', '726': 'Hard', '730': 'Hard', '732': 'Hard',
    '736': 'Hard', '741': 'Hard', '745': 'Hard', '749': 'Hard', '753': 'Hard', '757': 'Hard', '761': 'Hard',
    '765': 'Hard', '768': 'Hard', '770': 'Hard', '772': 'Hard', '773': 'Hard', '778': 'Hard', '780': 'Hard',
    '782': 'Hard', '786': 'Hard', '793': 'Hard', '798': 'Hard', '801': 'Hard', '803': 'Hard', '805': 'Hard',
    '810': 'Hard', '815': 'Hard', '818': 'Hard', '827': 'Hard', '829': 'Hard', '834': 'Hard', '839': 'Hard',
    '843': 'Hard', '847': 'Hard', '850': 'Hard', '854': 'Hard', '857': 'Hard', '862': 'Hard', '864': 'Hard',
    '871': 'Hard', '878': 'Hard', '879': 'Hard', '882': 'Hard', '887': 'Hard', '891': 'Hard', '895': 'Hard',
    '899': 'Hard', '902': 'Hard', '906': 'Hard', '913': 'Hard', '920': 'Hard', '927': 'Hard', '928': 'Hard',
    '936': 'Hard', '940': 'Hard', '943': 'Hard', '952': 'Hard', '956': 'Hard', '960': 'Hard', '964': 'Hard',
    '968': 'Hard', '972': 'Hard', '975': 'Hard', '980': 'Hard', '982': 'Hard', '987': 'Hard', '992': 'Hard',
    '995': 'Hard', '996': 'Hard', '1000': 'Hard', '1012': 'Hard', '1028': 'Hard', '1032': 'Hard', '1036': 'Hard',
    '1044': 'Hard', '1092': 'Hard', '1106': 'Hard', '1125': 'Hard', '1129': 'Hard', '1135': 'Hard', '1136': 'Hard',
    '1153': 'Hard', '1168': 'Hard', '1187': 'Hard', '1192': 'Hard', '1203': 'Hard', '1220': 'Hard', '1235': 'Hard',
    '1240': 'Hard', '1255': 'Hard', '1259': 'Hard', '1269': 'Hard', '1274': 'Hard', '1278': 'Hard', '1293': 'Hard',
    '1312': 'Hard', '1316': 'Hard', '1326': 'Hard', '1335': 'Hard', '1340': 'Hard', '1359': 'Hard', '1368': 'Hard',
    '1397': 'Hard', '1402': 'Hard', '1406': 'Hard', '1416': 'Hard', '1425': 'Hard', '1434': 'Hard', '1439': 'Hard',
    '1449': 'Hard', '1453': 'Hard', '1458': 'Hard', '1463': 'Hard', '1473': 'Hard', '1483': 'Hard', '1489': 'Hard',
    '1494': 'Hard', '1499': 'Hard', '1505': 'Hard', '1510': 'Hard', '1515': 'Hard', '1520': 'Hard', '1526': 'Hard',
    '1531': 'Hard', '1537': 'Hard', '1542': 'Hard', '1547': 'Hard', '1553': 'Hard', '1559': 'Hard', '1563': 'Hard',
    '1568': 'Hard', '1579': 'Hard', '1585': 'Hard', '1591': 'Hard', '1595': 'Hard', '1601': 'Hard', '1606': 'Hard',
    '1611': 'Hard', '1617': 'Hard', '1622': 'Hard', '1627': 'Hard', '1632': 'Hard', '1639': 'Hard', '1643': 'Hard',
    '1649': 'Hard', '1655': 'Hard', '1659': 'Hard', '1665': 'Hard', '1671': 'Hard', '1675': 'Hard', '1681': 'Hard',
    '1687': 'Hard', '1691': 'Hard', '1697': 'Hard', '1703': 'Hard', '1707': 'Hard', '1713': 'Hard', '1719': 'Hard',
    '1723': 'Hard', '1728': 'Hard', '1735': 'Hard', '1739': 'Hard', '1745': 'Hard', '1751': 'Hard', '1755': 'Hard',
    '1761': 'Hard', '1766': 'Hard', '1771': 'Hard', '1776': 'Hard', '1782': 'Hard', '1787': 'Hard', '1793': 'Hard',
    '1799': 'Hard', '1803': 'Hard', '1808': 'Hard', '1815': 'Hard', '1819': 'Hard', '1825': 'Hard', '1830': 'Hard',
    '1835': 'Hard', '1840': 'Hard', '1847': 'Hard', '1851': 'Hard', '1857': 'Hard', '1862': 'Hard', '1866': 'Hard',
    '1872': 'Hard', '1879': 'Hard', '1883': 'Hard', '1889': 'Hard', '1896': 'Hard', '1900': 'Hard', '1906': 'Hard',
    '1912': 'Hard', '1916': 'Hard', '1923': 'Hard', '1928': 'Hard', '1932': 'Hard', '1938': 'Hard', '1944': 'Hard',
    '1948': 'Hard', '1955': 'Hard', '1960': 'Hard', '1964': 'Hard', '1970': 'Hard', '1976': 'Hard', '1982': 'Hard',
    '1987': 'Hard', '1994': 'Hard', '1998': 'Hard', '2003': 'Hard', '2009': 'Hard', '2014': 'Hard', '2019': 'Hard',
    '2025': 'Hard', '2030': 'Hard', '2035': 'Hard', '2040': 'Hard', '2045': 'Hard', '2050': 'Hard', '2056': 'Hard',
    '2060': 'Hard', '2065': 'Hard', '2071': 'Hard', '2076': 'Hard', '2081': 'Hard', '2088': 'Hard', '2092': 'Hard',
    '2097': 'Hard', '2102': 'Hard', '2106': 'Hard', '2111': 'Hard', '2117': 'Hard', '2122': 'Hard', '2127': 'Hard',
    '2132': 'Hard', '2136': 'Hard', '2141': 'Hard', '2147': 'Hard', '2151': 'Hard', '2157': 'Hard', '2163': 'Hard',
    '2167': 'Hard', '2172': 'Hard', '2179': 'Hard', '2183': 'Hard', '2188': 'Hard', '2193': 'Hard', '2197': 'Hard',
    '2203': 'Hard', '2209': 'Hard', '2213': 'Hard', '2218': 'Hard', '2223': 'Hard', '2227': 'Hard', '2234': 'Hard',
    '2238': 'Hard', '2242': 'Hard', '2246': 'Hard', '2251': 'Hard', '2258': 'Hard', '2262': 'Hard', '2267': 'Hard',
    '2272': 'Hard', '2276': 'Hard', '2281': 'Hard', '2286': 'Hard', '2290': 'Hard', '2296': 'Hard', '2302': 'Hard',
    '2306': 'Hard', '2312': 'Hard', '2318': 'Hard', '2322': 'Hard', '2328': 'Hard', '2334': 'Hard', '2338': 'Hard',
    '2344': 'Hard', '2350': 'Hard', '2354': 'Hard', '2360': 'Hard', '2366': 'Hard', '2370': 'Hard', '2376': 'Hard',
    '2382': 'Hard', '2386': 'Hard', '2392': 'Hard', '2398': 'Hard', '2402': 'Hard', '2407': 'Hard', '2412': 'Hard',
    '2416': 'Hard', '2421': 'Hard', '2426': 'Hard', '2430': 'Hard', '2435': 'Hard', '2440': 'Hard', '2444': 'Hard',
    '2449': 'Hard', '2454': 'Hard', '2458': 'Hard', '2463': 'Hard', '2468': 'Hard', '2472': 'Hard', '2478': 'Hard',
    '2484': 'Hard', '2488': 'Hard', '2493': 'Hard', '2499': 'Hard', '2503': 'Hard', '2509': 'Hard', '2513': 'Hard',
    '2518': 'Hard', '2528': 'Hard', '2532': 'Hard', '2538': 'Hard', '2543': 'Hard', '2547': 'Hard', '2552': 'Hard',
    '2556': 'Hard', '2561': 'Hard', '2565': 'Hard', '2569': 'Hard', '2573': 'Hard', '2577': 'Hard', '2581': 'Hard',
    '2585': 'Hard', '2589': 'Hard', '2594': 'Hard', '2598': 'Hard', '2603': 'Hard', '2608': 'Hard', '2612': 'Hard',
    '2617': 'Hard'
};

let problems = [];
let currentProblem = null;
let undoTimeout = null;

// ===================== STORAGE FUNCTIONS =====================

function loadFromStorage(key, defaultValue = null) {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : defaultValue;
    } catch (e) {
        console.error('Error loading from storage:', e);
        return defaultValue;
    }
}

function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
        console.error('Error saving to storage:', e);
    }
}

function getCompletedProblems() {
    return loadFromStorage(STORAGE_KEYS.COMPLETED, []);
}

function saveCompletedProblem(problem, notes = '') {
    const completed = getCompletedProblems();
    completed.push({
        ...problem,
        notes: notes,
        solvedAt: new Date().toISOString()
    });
    saveToStorage(STORAGE_KEYS.COMPLETED, completed);
    saveToStorage(STORAGE_KEYS.LAST_COMPLETED, problem);
}

function getSkippedProblems() {
    return loadFromStorage(STORAGE_KEYS.SKIPPED, []);
}

function addSkippedProblem(problemNo) {
    const skipped = getSkippedProblems();
    if (!skipped.includes(problemNo)) {
        skipped.push(problemNo);
        saveToStorage(STORAGE_KEYS.SKIPPED, skipped);
    }
}

function getLastPattern() {
    return loadFromStorage(STORAGE_KEYS.LAST_PATTERN, null);
}

function setLastPattern(pattern) {
    saveToStorage(STORAGE_KEYS.LAST_PATTERN, pattern);
}

// ===================== DIFFICULTY FUNCTIONS =====================

function getProblemDifficulty(problemNo) {
    return DIFFICULTY_MAP[problemNo] || 'Medium';
}

function getDifficultyWeight(difficulty) {
    return { 'Easy': 1, 'Medium': 2, 'Hard': 3 }[difficulty] || 2;
}

// ===================== DIFFICULTY CURVE =====================

function getDifficultyCurve() {
    const completed = getCompletedProblems();
    const today = new Date().toDateString();
    const weekAgo = new Date(Date.now() - 7 * 86400000);

    // Today's solves
    const todaySolves = completed.filter(p => new Date(p.solvedAt).toDateString() === today);
    const todayDifficulties = todaySolves.map(p => getProblemDifficulty(p.problemNo));

    // This week's solves
    const weekSolves = completed.filter(p => new Date(p.solvedAt) >= weekAgo);
    const weekDifficulties = weekSolves.map(p => getProblemDifficulty(p.problemNo));

    // Calculate average difficulty
    const avgDifficulty = (diffs) => {
        if (diffs.length === 0) return 0;
        const sum = diffs.reduce((a, d) => a + getDifficultyWeight(d), 0);
        return sum / diffs.length;
    };

    const dayAvg = avgDifficulty(todayDifficulties);
    const weekAvg = avgDifficulty(weekDifficulties);

    // Determine next target difficulty based on progression
    const targetDifficulty = getTargetDifficulty(todaySolves.length, dayAvg);

    return {
        dayProgress: todaySolves.length,
        dayAvg: dayAvg,
        weekAvg: weekAvg,
        targetDifficulty: targetDifficulty
    };
}

function getTargetDifficulty(solvedToday, currentAvg) {
    // Difficulty curve: Start with easier, progressively harder
    // First problem: prefer Easy
    // After 2-3: prefer Medium
    // After 5+: include Hard

    if (solvedToday === 0) return 'Easy';
    if (solvedToday < 3) return currentAvg < 1.5 ? 'Medium' : 'Easy';
    if (solvedToday < 5) return currentAvg < 2 ? 'Medium' : 'Easy';
    return currentAvg < 2.5 ? 'Hard' : 'Medium';
}

// ===================== STREAK CALCULATION =====================

function getStreakData() {
    return loadFromStorage(STORAGE_KEYS.STREAK_DATA, { lastSolveDate: null, streak: 0 });
}

function updateStreak() {
    const streakData = getStreakData();
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (streakData.lastSolveDate === today) {
        return streakData.streak;
    } else if (streakData.lastSolveDate === yesterday) {
        streakData.streak += 1;
    } else if (streakData.lastSolveDate !== today) {
        streakData.streak = 1;
    }

    streakData.lastSolveDate = today;
    saveToStorage(STORAGE_KEYS.STREAK_DATA, streakData);
    return streakData.streak;
}

// ===================== SMART RANDOM PICKER =====================

function getUniquePatterns() {
    const patterns = new Set();
    problems.forEach(p => patterns.add(p.pattern));
    return Array.from(patterns);
}

function getCompletedProblemIds() {
    return new Set(getCompletedProblems().map(p => p.problemNo));
}

function pickRandomProblem() {
    const completedIds = getCompletedProblemIds();
    const skippedIds = new Set(getSkippedProblems());
    const lastPattern = getLastPattern();
    const curve = getDifficultyCurve();

    // Get unsolved, non-skipped problems
    let unsolvedProblems = problems.filter(p =>
        !completedIds.has(p.problemNo) && !skippedIds.has(p.problemNo)
    );

    if (unsolvedProblems.length === 0) {
        // All problems solved or skipped, allow skipped ones
        unsolvedProblems = problems.filter(p => !completedIds.has(p.problemNo));
    }

    if (unsolvedProblems.length === 0) {
        // All problems solved! Pick any random one
        return problems[Math.floor(Math.random() * problems.length)];
    }

    // Get patterns that have unsolved problems
    const patternsWithUnsolved = new Set(unsolvedProblems.map(p => p.pattern));

    // Filter out last pattern (smart picker)
    let availablePatterns = Array.from(patternsWithUnsolved).filter(p => p !== lastPattern);

    if (availablePatterns.length === 0) {
        availablePatterns = Array.from(patternsWithUnsolved);
    }

    // Pick random pattern
    const selectedPattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];

    // Get unsolved problems in selected pattern
    let patternProblems = unsolvedProblems.filter(p => p.pattern === selectedPattern);

    // Apply difficulty curve - prefer target difficulty
    const targetDiff = curve.targetDifficulty;
    const problemsWithTargetDiff = patternProblems.filter(p =>
        getProblemDifficulty(p.problemNo) === targetDiff
    );

    // Use target difficulty problems if available, otherwise use all
    if (problemsWithTargetDiff.length > 0) {
        patternProblems = problemsWithTargetDiff;
    }

    return patternProblems[Math.floor(Math.random() * patternProblems.length)];
}

// ===================== UI UPDATES =====================

function updateProblemDisplay(problem) {
    currentProblem = problem;
    saveToStorage(STORAGE_KEYS.CURRENT_PROBLEM, problem);

    // Update problem info
    document.getElementById('problem-number').textContent = `#${problem.problemNo}`;
    document.getElementById('problem-name').textContent = problem.problemName;
    document.getElementById('pattern-name').textContent = problem.pattern;

    // Update difficulty
    const difficulty = getProblemDifficulty(problem.problemNo);
    const difficultyEl = document.getElementById('difficulty-name');
    difficultyEl.textContent = difficulty;
    difficultyEl.className = 'difficulty-name ' + difficulty.toLowerCase();

    // Update LeetCode link
    const leetcodeLink = document.getElementById('leetcode-link');
    leetcodeLink.href = `https://leetcode.com/problems/${problem.problemName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}/`;

    // Reset hints
    document.getElementById('hint-btn').classList.remove('revealed');
    document.getElementById('pattern-reveal').classList.remove('visible');
    document.getElementById('difficulty-hint-btn').classList.remove('revealed');
    document.getElementById('difficulty-reveal').classList.remove('visible');

    // Clear notes
    document.getElementById('notes-input').value = '';

    // Hide undo bar
    hideUndoBar();

    // Update difficulty curve display
    updateDifficultyCurve();
    updateSolvedTodayCount();
}

function updateSolvedTodayCount() {
    const completed = getCompletedProblems();
    const today = new Date().toDateString();
    const solvedToday = completed.filter(p => new Date(p.solvedAt).toDateString() === today).length;
    document.getElementById('solved-count').textContent = `${solvedToday} solved today`;
}

function updateDifficultyCurve() {
    const curve = getDifficultyCurve();
    console.log('updateDifficultyCurve - curve:', curve);

    // Map numeric average to difficulty label
    const getDiffLabel = (avg) => {
        if (avg <= 0) return '-';
        if (avg < 1.5) return 'E';
        if (avg < 2.5) return 'M';
        return 'H';
    };

    const dayLabel = getDiffLabel(curve.dayAvg);
    const weekLabel = getDiffLabel(curve.weekAvg);

    const curveEl = document.getElementById('difficulty-curve');
    if (curveEl) {
        curveEl.textContent = `Day: ${dayLabel} (${curve.dayProgress}) | Week: ${weekLabel}`;
    }
}

function updateMiniStats() {
    const completed = getCompletedProblems();
    console.log('updateMiniStats - completed problems:', completed.length, completed);
    const patternsSet = new Set(completed.map(p => p.pattern));
    const streakData = getStreakData();

    const totalEl = document.getElementById('total-solved');
    const patternsEl = document.getElementById('patterns-touched');
    const streakEl = document.getElementById('streak-count');

    if (totalEl) totalEl.textContent = completed.length;
    if (patternsEl) patternsEl.textContent = patternsSet.size;
    if (streakEl) streakEl.textContent = streakData.streak;
}

function updateReportSection() {
    const completed = getCompletedProblems();
    const allPatterns = getUniquePatterns();

    // Calculate pattern stats
    const patternStats = {};
    allPatterns.forEach(pattern => {
        patternStats[pattern] = {
            total: problems.filter(p => p.pattern === pattern).length,
            solved: 0
        };
    });

    completed.forEach(p => {
        if (patternStats[p.pattern]) {
            patternStats[p.pattern].solved++;
        }
    });

    // Count complete patterns
    let completePatterns = 0;
    Object.values(patternStats).forEach(stats => {
        if (stats.solved >= stats.total) completePatterns++;
    });

    // Update summary
    document.getElementById('report-total').textContent = completed.length;
    document.getElementById('report-patterns').textContent = `${completePatterns}/${allPatterns.length}`;

    // Update pattern progress
    const progressContainer = document.getElementById('pattern-progress');
    progressContainer.innerHTML = '';

    const sortedPatterns = Object.entries(patternStats).sort((a, b) => {
        const numA = parseInt(a[0].match(/\d+/) || 0);
        const numB = parseInt(b[0].match(/\d+/) || 0);
        return numA - numB;
    });

    sortedPatterns.forEach(([pattern, stats]) => {
        const percentage = Math.round((stats.solved / stats.total) * 100);
        const isComplete = stats.solved >= stats.total;

        const item = document.createElement('div');
        item.className = 'pattern-item';
        item.innerHTML = `
            <div class="pattern-info">
                <div class="pattern-item-name">${pattern}</div>
                <div class="pattern-bar">
                    <div class="pattern-bar-fill ${isComplete ? 'complete' : ''}" style="width: ${percentage}%"></div>
                </div>
            </div>
            <span class="pattern-stat">${stats.solved}/${stats.total}</span>
        `;
        progressContainer.appendChild(item);
    });

    // Update history
    const historyContainer = document.getElementById('history-list');

    if (completed.length === 0) {
        historyContainer.innerHTML = `
            <div class="history-empty">
                No problems solved yet. Start your journey!
            </div>
        `;
        return;
    }

    const sortedHistory = [...completed].reverse().slice(0, 50);
    historyContainer.innerHTML = '';

    sortedHistory.forEach(problem => {
        const date = new Date(problem.solvedAt);
        const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
        const timeStr = date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });

        const item = document.createElement('div');
        item.className = 'history-item';
        item.innerHTML = `
            <span class="history-number">#${problem.problemNo}</span>
            <div class="history-details">
                <div class="history-name">${problem.problemName}</div>
                <div class="history-meta">${problem.pattern} | ${dateStr} at ${timeStr}</div>
                ${problem.notes ? `<div class="history-notes">${problem.notes}</div>` : ''}
            </div>
        `;
        historyContainer.appendChild(item);
    });
}

// ===================== UNDO FUNCTIONALITY =====================

function showUndoBar() {
    document.getElementById('undo-bar').classList.add('visible');

    // Auto-hide after 10 seconds
    if (undoTimeout) clearTimeout(undoTimeout);
    undoTimeout = setTimeout(hideUndoBar, 10000);
}

function hideUndoBar() {
    document.getElementById('undo-bar').classList.remove('visible');
    if (undoTimeout) {
        clearTimeout(undoTimeout);
        undoTimeout = null;
    }
}

function handleUndo() {
    const completed = getCompletedProblems();
    if (completed.length === 0) return;

    // Remove last completed
    const lastProblem = completed.pop();
    saveToStorage(STORAGE_KEYS.COMPLETED, completed);

    // Restore the problem
    updateProblemDisplay(lastProblem);

    // Update stats
    updateMiniStats();
    updateReportSection();

    hideUndoBar();
}

// ===================== EVENT HANDLERS =====================

function handleComplete() {
    if (!currentProblem) return;

    const notes = document.getElementById('notes-input').value.trim();

    // Save completed problem with notes
    saveCompletedProblem(currentProblem, notes);
    setLastPattern(currentProblem.pattern);
    updateStreak();

    // Pick next problem
    const nextProblem = pickRandomProblem();
    updateProblemDisplay(nextProblem);

    // Update stats
    updateMiniStats();
    updateReportSection();

    // Show undo bar
    showUndoBar();

    // Visual feedback
    const btn = document.getElementById('complete-btn');
    btn.textContent = 'SAVED!';
    btn.style.background = '#047857';
    setTimeout(() => {
        btn.textContent = 'MARK COMPLETE & NEXT';
        btn.style.background = '';
    }, 800);
}

function handleSkip() {
    if (!currentProblem) return;

    // Add to skipped list
    addSkippedProblem(currentProblem.problemNo);

    // Pick next problem
    const nextProblem = pickRandomProblem();
    updateProblemDisplay(nextProblem);

    // Visual feedback
    const btn = document.getElementById('skip-btn');
    btn.textContent = 'SKIPPED!';
    setTimeout(() => {
        btn.textContent = 'SKIP FOR NOW';
    }, 600);
}

function handleHintReveal() {
    document.getElementById('hint-btn').classList.add('revealed');
    document.getElementById('pattern-reveal').classList.add('visible');
}

function handleDifficultyReveal() {
    document.getElementById('difficulty-hint-btn').classList.add('revealed');
    document.getElementById('difficulty-reveal').classList.add('visible');
}

function handleTabSwitch(tab) {
    // Check interview unlock status
    if (tab === 'interview' && !isInterviewUnlocked()) {
        showInterviewLocked();
        return;
    }

    document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tab);
    });

    document.getElementById('practice-section').classList.toggle('active', tab === 'practice');
    document.getElementById('report-section').classList.toggle('active', tab === 'report');
    document.getElementById('interview-section').classList.toggle('active', tab === 'interview');

    if (tab === 'report') {
        updateReportSection();
    }
    if (tab === 'interview') {
        initInterviewSection();
    }
}

// ===================== INTERVIEW MODE =====================

const INTERVIEW_STORAGE = {
    STATE: 'dpp_interviewState',
    CURRENT: 'dpp_interviewCurrent'
};

let interviewState = {
    active: false,
    currentQuestion: 0,
    questions: [],
    startTime: null,
    timeRemaining: 2 * 60 * 60, // 2 hours in seconds
    questionsCompleted: 0
};

let interviewTimer = null;
let currentInterview = null;
let monacoEditor = null;
let isFullscreen = false;
let isInterviewForceUnlocked = false; // For testing

function isInterviewUnlocked() {
    if (isInterviewForceUnlocked) return true; // Manual override for testing
    const day = new Date().getDay();
    // 0 = Sunday, 6 = Saturday
    return day === 0 || day === 6;
}

function showInterviewLocked() {
    document.getElementById('interview-start').style.display = 'none';
    document.getElementById('interview-active').style.display = 'none';
    document.getElementById('interview-complete').style.display = 'none';
    document.getElementById('interview-locked').style.display = 'flex';

    document.querySelectorAll('.nav-tab').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === 'interview');
    });
    document.getElementById('practice-section').classList.remove('active');
    document.getElementById('report-section').classList.remove('active');
    document.getElementById('interview-section').classList.add('active');

    // Add unlock test button handler
    document.getElementById('unlock-test-btn').addEventListener('click', forceUnlockInterview);
}

function initInterviewSection() {
    // Check for existing interview in progress
    const savedState = loadFromStorage(INTERVIEW_STORAGE.STATE);

    if (savedState && savedState.active) {
        interviewState = savedState;
        currentInterview = loadFromStorage(INTERVIEW_STORAGE.CURRENT);
        resumeInterview();
        return;
    }

    // Show start screen
    document.getElementById('interview-start').style.display = 'flex';
    document.getElementById('interview-active').style.display = 'none';
    document.getElementById('interview-complete').style.display = 'none';
    document.getElementById('interview-locked').style.display = 'none';

    // Load week's patterns
    loadWeekPatterns();
}

function loadWeekPatterns() {
    const completed = getCompletedProblems();
    const weekAgo = new Date(Date.now() - 7 * 86400000);

    const weekSolves = completed.filter(p => new Date(p.solvedAt) >= weekAgo);
    const patternsSet = new Set(weekSolves.map(p => p.pattern));
    const patterns = Array.from(patternsSet);

    const container = document.getElementById('patterns-list');

    if (patterns.length === 0) {
        container.innerHTML = '<span style="color: var(--text-light);">No patterns practiced this week yet. Start practicing!</span>';
        document.getElementById('start-interview-btn').disabled = true;
        return;
    }

    container.innerHTML = patterns.map(p => `<span class="pattern-tag">${p}</span>`).join('');
    document.getElementById('start-interview-btn').disabled = false;
}

function getWeekPatterns() {
    const completed = getCompletedProblems();
    const weekAgo = new Date(Date.now() - 7 * 86400000);

    const weekSolves = completed.filter(p => new Date(p.solvedAt) >= weekAgo);
    return Array.from(new Set(weekSolves.map(p => p.pattern)));
}

async function startInterview() {
    const patterns = getWeekPatterns();

    if (patterns.length === 0) {
        alert('Please practice some problems during the week first!');
        return;
    }

    // Initialize interview state
    interviewState = {
        active: true,
        currentQuestion: 1,
        questions: [],
        startTime: Date.now(),
        timeRemaining: 2 * 60 * 60,
        questionsCompleted: 0
    };

    currentInterview = {
        patterns: patterns,
        problems: [],
        conversations: [],
        codes: []
    };

    saveToStorage(INTERVIEW_STORAGE.STATE, interviewState);
    saveToStorage(INTERVIEW_STORAGE.CURRENT, currentInterview);

    // Show active interview UI
    document.getElementById('interview-start').style.display = 'none';
    document.getElementById('interview-active').style.display = 'flex';

    // Start timer
    startInterviewTimer();

    // Generate first problem
    await generateProblem(1);
}

function resumeInterview() {
    document.getElementById('interview-start').style.display = 'none';
    document.getElementById('interview-active').style.display = 'flex';

    // Resume timer
    startInterviewTimer();

    // Update UI
    updateInterviewProgress();

    // Display current problem
    if (currentInterview.problems[interviewState.currentQuestion - 1]) {
        displayProblem(currentInterview.problems[interviewState.currentQuestion - 1]);
    } else {
        generateProblem(interviewState.currentQuestion);
    }
}

function startInterviewTimer() {
    updateTimerDisplay();

    interviewTimer = setInterval(() => {
        interviewState.timeRemaining--;
        updateTimerDisplay();

        if (interviewState.timeRemaining <= 0) {
            endInterview();
        }

        // Save state periodically
        if (interviewState.timeRemaining % 30 === 0) {
            saveToStorage(INTERVIEW_STORAGE.STATE, interviewState);
        }
    }, 1000);
}

function updateTimerDisplay() {
    const hours = Math.floor(interviewState.timeRemaining / 3600);
    const minutes = Math.floor((interviewState.timeRemaining % 3600) / 60);
    const seconds = interviewState.timeRemaining % 60;

    const timerEl = document.getElementById('interview-timer');
    timerEl.textContent = `${hours}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

    // Warning state when < 15 minutes
    if (interviewState.timeRemaining < 15 * 60) {
        timerEl.classList.add('warning');
    }
}

function updateInterviewProgress() {
    document.getElementById('current-q').textContent = interviewState.currentQuestion;

    document.querySelectorAll('.progress-dots .dot').forEach((dot, i) => {
        dot.classList.remove('active', 'complete');
        if (i + 1 < interviewState.currentQuestion) {
            dot.classList.add('complete');
        } else if (i + 1 === interviewState.currentQuestion) {
            dot.classList.add('active');
        }
    });
}

async function generateProblem(questionNumber) {
    // Show loading
    document.getElementById('problem-loading').style.display = 'flex';
    document.getElementById('interview-problem-content').style.display = 'none';

    // Determine difficulty based on question number
    const difficulties = ['Easy', 'Medium', 'Medium', 'Hard'];
    const difficulty = difficulties[questionNumber - 1] || 'Medium';

    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'generate_problem',
                data: {
                    patterns: currentInterview.patterns,
                    difficulty: difficulty,
                    questionNumber: questionNumber
                }
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const problem = await response.json();

        // Store problem
        currentInterview.problems[questionNumber - 1] = problem;
        currentInterview.conversations[questionNumber - 1] = [];
        currentInterview.codes[questionNumber - 1] = '';
        saveToStorage(INTERVIEW_STORAGE.CURRENT, currentInterview);

        displayProblem(problem);

    } catch (error) {
        console.error('Error generating problem:', error);
        document.getElementById('problem-loading').innerHTML = `
            <span>Error generating problem. Please try again.</span>
            <button onclick="generateProblem(${questionNumber})" style="margin-top: 12px; padding: 8px 16px; cursor: pointer;">Retry</button>
        `;
    }
}

function displayProblem(problem) {
    document.getElementById('problem-loading').style.display = 'none';
    document.getElementById('interview-problem-content').style.display = 'block';

    document.getElementById('ip-title').textContent = problem.title;
    document.getElementById('ip-description').textContent = problem.description;

    // Examples
    const examplesHtml = (problem.examples || []).map((ex, i) => `
        <div class="example-item">
            <div class="example-label">Example ${i + 1}:</div>
            <div><strong>Input:</strong> ${ex.input}</div>
            <div><strong>Output:</strong> ${ex.output}</div>
            ${ex.explanation ? `<div><em>${ex.explanation}</em></div>` : ''}
        </div>
    `).join('');
    document.getElementById('ip-examples').innerHTML = examplesHtml;

    // Constraints
    const constraintsHtml = `<ul>${(problem.constraints || []).map(c => `<li>${c}</li>`).join('')}</ul>`;
    document.getElementById('ip-constraints').innerHTML = constraintsHtml;

    // Clear code editor
    document.getElementById('code-editor').value = currentInterview.codes[interviewState.currentQuestion - 1] || '';

    // Hide AI panel
    document.getElementById('ai-panel').style.display = 'none';

    updateInterviewProgress();
}

async function submitCode() {
    const code = getEditorCode().trim();

    if (!code) {
        alert('Please write your solution first!');
        return;
    }

    // Save code
    currentInterview.codes[interviewState.currentQuestion - 1] = code;
    saveToStorage(INTERVIEW_STORAGE.CURRENT, currentInterview);

    // Disable submit button
    const submitBtn = document.getElementById('submit-code-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'REVIEWING...';

    const problem = currentInterview.problems[interviewState.currentQuestion - 1];
    const conversation = currentInterview.conversations[interviewState.currentQuestion - 1];

    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'review_code',
                data: {
                    problem: problem,
                    code: code,
                    conversation: conversation
                }
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const review = await response.json();

        // Show AI panel
        showAIPanel(review);

    } catch (error) {
        console.error('Error reviewing code:', error);
        alert('Error reviewing code. Please try again.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'SUBMIT FOR REVIEW';
    }
}

function showAIPanel(review) {
    const panel = document.getElementById('ai-panel');
    const chat = document.getElementById('ai-chat');

    panel.style.display = 'flex';

    // Build feedback message
    let message = review.feedback;

    if (review.issues && review.issues.length > 0) {
        message += '\n\nIssues found:\n' + review.issues.map(i => `• ${i}`).join('\n');
    }

    if (review.followUpQuestion) {
        message += '\n\n' + review.followUpQuestion;
    }

    // Add to conversation
    const qIndex = interviewState.currentQuestion - 1;
    currentInterview.conversations[qIndex].push({
        role: 'AI',
        content: message
    });
    saveToStorage(INTERVIEW_STORAGE.CURRENT, currentInterview);

    // Update chat display
    updateChatDisplay();

    // Show/hide next button
    if (review.isSatisfied) {
        document.getElementById('next-question-btn').style.display = 'block';
        document.getElementById('ai-input-area').style.display = 'none';
    } else {
        document.getElementById('next-question-btn').style.display = 'none';
        document.getElementById('ai-input-area').style.display = 'flex';
    }
}

function updateChatDisplay() {
    const chat = document.getElementById('ai-chat');
    const conversation = currentInterview.conversations[interviewState.currentQuestion - 1];

    chat.innerHTML = conversation.map(msg => `
        <div class="chat-message ${msg.role.toLowerCase()}">
            ${msg.content.replace(/\n/g, '<br>')}
        </div>
    `).join('');

    // Scroll to bottom
    chat.scrollTop = chat.scrollHeight;
}

async function sendFollowUpAnswer() {
    const input = document.getElementById('ai-input');
    const answer = input.value.trim();

    if (!answer) return;

    // Add user message
    const qIndex = interviewState.currentQuestion - 1;
    currentInterview.conversations[qIndex].push({
        role: 'User',
        content: answer
    });
    saveToStorage(INTERVIEW_STORAGE.CURRENT, currentInterview);

    // Clear input
    input.value = '';

    // Update display
    updateChatDisplay();

    // Get AI response
    const problem = currentInterview.problems[qIndex];
    const code = currentInterview.codes[qIndex];
    const conversation = currentInterview.conversations[qIndex];

    try {
        const response = await fetch('/api/gemini', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                action: 'answer_followup',
                data: {
                    problem: problem,
                    code: code,
                    conversation: conversation,
                    answer: answer
                }
            })
        });

        if (!response.ok) {
            throw new Error('API request failed');
        }

        const result = await response.json();

        // Build AI response
        let aiMessage = result.feedback;
        if (result.followUpQuestion) {
            aiMessage += '\n\n' + result.followUpQuestion;
        }

        currentInterview.conversations[qIndex].push({
            role: 'AI',
            content: aiMessage
        });
        saveToStorage(INTERVIEW_STORAGE.CURRENT, currentInterview);

        updateChatDisplay();

        // Check if satisfied
        if (result.isSatisfied) {
            document.getElementById('next-question-btn').style.display = 'block';
            document.getElementById('ai-input-area').style.display = 'none';
        }

    } catch (error) {
        console.error('Error sending follow-up:', error);
    }
}

function moveToNextQuestion() {
    interviewState.questionsCompleted++;

    if (interviewState.currentQuestion >= 4) {
        // Interview complete
        endInterview();
        return;
    }

    interviewState.currentQuestion++;
    saveToStorage(INTERVIEW_STORAGE.STATE, interviewState);

    // Hide AI panel
    document.getElementById('ai-panel').style.display = 'none';

    // Generate next problem
    generateProblem(interviewState.currentQuestion);
}

function endInterview() {
    // Stop timer
    if (interviewTimer) {
        clearInterval(interviewTimer);
        interviewTimer = null;
    }

    // Calculate time used
    const timeUsed = 2 * 60 * 60 - interviewState.timeRemaining;
    const hours = Math.floor(timeUsed / 3600);
    const minutes = Math.floor((timeUsed % 3600) / 60);

    // Update complete screen
    document.getElementById('cs-questions').textContent = `${interviewState.questionsCompleted}/4`;
    document.getElementById('cs-time').textContent = `${hours}:${String(minutes).padStart(2, '0')}`;

    // Show complete screen
    document.getElementById('interview-active').style.display = 'none';
    document.getElementById('interview-complete').style.display = 'flex';

    // Clear interview state
    interviewState.active = false;
    saveToStorage(INTERVIEW_STORAGE.STATE, interviewState);
}

function closeAIPanel() {
    document.getElementById('ai-panel').style.display = 'none';
}

function backToPractice() {
    handleTabSwitch('practice');
}

function forceUnlockInterview() {
    isInterviewForceUnlocked = true;
    handleTabSwitch('interview');
}

function toggleFullscreen() {
    const workspace = document.getElementById('interview-workspace');
    isFullscreen = !isFullscreen;
    workspace.classList.toggle('fullscreen', isFullscreen);

    // Update button icon
    const btn = document.getElementById('fullscreen-btn');
    if (isFullscreen) {
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"/>
        </svg>`;
    } else {
        btn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
        </svg>`;
    }

    // Resize Monaco editor if it exists
    if (monacoEditor) {
        setTimeout(() => monacoEditor.layout(), 100);
    }
}

function initMonacoEditor() {
    // Configure Monaco AMD loader
    require.config({ paths: { 'vs': 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs' } });

    require(['vs/editor/editor.main'], function () {
        // Define custom theme to match app style
        monaco.editor.defineTheme('catppuccin', {
            base: 'vs-dark',
            inherit: true,
            rules: [
                { token: 'comment', foreground: '6c7086', fontStyle: 'italic' },
                { token: 'keyword', foreground: 'cba6f7' },
                { token: 'string', foreground: 'a6e3a1' },
                { token: 'number', foreground: 'fab387' },
                { token: 'function', foreground: '89b4fa' },
            ],
            colors: {
                'editor.background': '#1e1e2e',
                'editor.foreground': '#cdd6f4',
                'editorLineNumber.foreground': '#6c7086',
                'editorCursor.foreground': '#f5e0dc',
                'editor.selectionBackground': '#45475a',
            }
        });

        monacoEditor = monaco.editor.create(document.getElementById('monaco-container'), {
            value: '# Write your solution here\n\ndef solution():\n    pass',
            language: 'python',
            theme: 'catppuccin',
            fontSize: 14,
            fontFamily: "'Fira Code', monospace",
            minimap: { enabled: false },
            lineNumbers: 'on',
            roundedSelection: true,
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 4,
            insertSpaces: true,
            wordWrap: 'on',
            padding: { top: 16, bottom: 16 },
        });

        // Save code on change
        monacoEditor.onDidChangeModelContent(() => {
            if (currentInterview && interviewState.active) {
                currentInterview.codes[interviewState.currentQuestion - 1] = monacoEditor.getValue();
                saveToStorage(INTERVIEW_STORAGE.CURRENT, currentInterview);
            }
        });

        // Language-specific templates
        const codeTemplates = {
            'python': `# Write your solution here

def solution():
    pass
`,
            'javascript': `// Write your solution here

function solution() {
    
}
`,
            'java': `// Write your solution here

class Solution {
    public void solve() {
        
    }
}
`,
            'cpp': `// Write your solution here
#include <bits/stdc++.h>
using namespace std;

class Solution {
public:
    void solve() {
        
    }
};
`
        };

        // Handle language change
        document.getElementById('language-select').addEventListener('change', (e) => {
            const langMap = {
                'python': 'python',
                'javascript': 'javascript',
                'java': 'java',
                'cpp': 'cpp'
            };
            const lang = e.target.value;
            monaco.editor.setModelLanguage(monacoEditor.getModel(), langMap[lang] || 'python');

            // If editor has default template or is empty, update to new language template
            const currentCode = monacoEditor.getValue().trim();
            const isDefaultTemplate = Object.values(codeTemplates).some(
                t => currentCode === t.trim() || currentCode === ''
            );
            if (isDefaultTemplate) {
                monacoEditor.setValue(codeTemplates[lang] || codeTemplates['python']);
            }
        });

        // Set C++ as default since user prefers it
        const langSelect = document.getElementById('language-select');
        langSelect.value = 'cpp';
        monacoEditor.setValue(codeTemplates['cpp']);
        monaco.editor.setModelLanguage(monacoEditor.getModel(), 'cpp');
    });
}

function getEditorCode() {
    return monacoEditor ? monacoEditor.getValue() : '';
}

function setEditorCode(code) {
    if (monacoEditor) {
        monacoEditor.setValue(code || '');
    }
}

// ===================== INITIALIZATION =====================

async function loadProblems() {
    try {
        const response = await fetch('pattern.json');
        const data = await response.json();
        problems = data.problems;
        return true;
    } catch (error) {
        console.error('Error loading problems:', error);
        return false;
    }
}

async function init() {
    const loaded = await loadProblems();

    if (!loaded || problems.length === 0) {
        document.getElementById('problem-name').textContent = 'Error loading problems';
        return;
    }

    // Check for saved current problem
    const savedProblem = loadFromStorage(STORAGE_KEYS.CURRENT_PROBLEM);

    if (savedProblem) {
        updateProblemDisplay(savedProblem);
    } else {
        const problem = pickRandomProblem();
        updateProblemDisplay(problem);
    }

    updateMiniStats();

    // Update interview tab visibility
    const interviewTab = document.getElementById('interview-tab');
    if (!isInterviewUnlocked()) {
        interviewTab.classList.add('locked');
    }

    // Event listeners - Practice
    document.getElementById('complete-btn').addEventListener('click', handleComplete);
    document.getElementById('skip-btn').addEventListener('click', handleSkip);
    document.getElementById('hint-btn').addEventListener('click', handleHintReveal);
    document.getElementById('difficulty-hint-btn').addEventListener('click', handleDifficultyReveal);
    document.getElementById('undo-btn').addEventListener('click', handleUndo);

    // Event listeners - Navigation
    document.querySelectorAll('.nav-tab').forEach(tab => {
        tab.addEventListener('click', () => handleTabSwitch(tab.dataset.tab));
    });

    // Event listeners - Interview
    document.getElementById('start-interview-btn').addEventListener('click', startInterview);
    document.getElementById('submit-code-btn').addEventListener('click', submitCode);
    document.getElementById('ai-send-btn').addEventListener('click', sendFollowUpAnswer);
    document.getElementById('next-question-btn').addEventListener('click', moveToNextQuestion);
    document.getElementById('close-ai-btn').addEventListener('click', closeAIPanel);
    document.getElementById('back-to-practice-btn').addEventListener('click', backToPractice);
    document.getElementById('fullscreen-btn').addEventListener('click', toggleFullscreen);

    // Enter key for AI input
    document.getElementById('ai-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendFollowUpAnswer();
        }
    });

    // Initialize Monaco Editor
    initMonacoEditor();
}

document.addEventListener('DOMContentLoaded', init);

