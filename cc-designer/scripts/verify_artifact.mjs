#!/usr/bin/env node
// cc-designer 成品驗證：靜態規則 + headless 瀏覽器實際載入。只讀成品，不修改任何檔案。
//
// 用法：node verify_artifact.mjs <artifact.html> [--design-md <path>] [--browser <path>]
//         [--viewport 1440x900] [--settle-ms 1500] [--screenshot <out.png>] [--static-only]
// 結束碼：0 PASS、1 FAIL、2 UNVERIFIED（沒有實際看過 console，不可宣稱驗證通過）。
import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, extname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

const PINNED_RUNTIME = [
  {
    name: 'react',
    pattern: /\breact(?:@|\.|\/umd\/react\.)/i,
    exclude: /react-dom/i,
    src: 'https://unpkg.com/react@18.3.1/umd/react.development.js',
    integrity: 'sha384-hD6/rw4ppMLGNu3tX5cjIb+uRZ7UkRJ6BPkLpg4hAu/6onKUg4lLsHAs9EBPT82L',
  },
  {
    name: 'react-dom',
    pattern: /react-dom/i,
    src: 'https://unpkg.com/react-dom@18.3.1/umd/react-dom.development.js',
    integrity: 'sha384-u6aeetuaXnQ38mYT8rp6sbXaQe3NL9t+IBXmnYxwkUI2Hw4bsp2Wvmx4yRQF1uAm',
  },
  {
    name: 'babel',
    pattern: /babel(?:\.min)?\.js|@babel\/standalone/i,
    src: 'https://unpkg.com/@babel/standalone@7.29.0/babel.min.js',
    integrity: 'sha384-m08KidiNqLdpJqLq95G/LEi8Qvjl/xUYll3QILypMoQ65QorJ9Lvtp2RXYGBFj1y',
  },
];
const ALLOWED_EXTERNAL_HOSTS = new Set(['unpkg.com', 'fonts.googleapis.com', 'fonts.gstatic.com', 'api.fontshare.com', 'cdn.fontshare.com']);
const DESIGN_MD_NAMES = ['DESIGN.md', 'design.md', 'design-system.md', 'brand.md'];
const OVERUSED_FONTS = /font-family\s*:\s*["']?(Inter|Roboto|Arial|Helvetica|system-ui)\b/gi;
const BROWSER_PATHS = {
  win32: [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  ],
  darwin: [
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
  ],
};
const BROWSER_COMMANDS = ['google-chrome', 'google-chrome-stable', 'chromium', 'chromium-browser', 'microsoft-edge'];
// Babel 在瀏覽器內轉譯必定出現這句，屬預期輸出。
const EXPECTED_MESSAGES = [/in-browser Babel transformer/i];

function parseArgs(argv) {
  const options = { settleMs: 1500, viewport: '1440x900', staticOnly: false };
  const valueFlags = { '--design-md': 'designMd', '--browser': 'browser', '--viewport': 'viewport', '--settle-ms': 'settleMs', '--screenshot': 'screenshot' };
  const positional = [];
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === '--static-only') options.staticOnly = true;
    else if (valueFlags[argv[i]]) options[valueFlags[argv[i]]] = argv[++i];
    else positional.push(argv[i]);
  }
  return { artifact: positional[0], options };
}

function attribute(attrs, name) {
  const match = new RegExp(`\\b${name}=(["'])(.*?)\\1`, 'i').exec(attrs);
  return match ? match[2] : null;
}

function parseScripts(html) {
  return [...html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)].map((match) => ({ attrs: match[1], body: match[2] }));
}

function stripNonMarkup(html) {
  return html.replace(/<script\b[\s\S]*?<\/script>/gi, '').replace(/<style\b[\s\S]*?<\/style>/gi, '').replace(/<!--[\s\S]*?-->/g, '');
}

function styleBlocks(html) {
  return [...html.matchAll(/<style\b[^>]*>([\s\S]*?)<\/style>/gi)].map((match) => match[1]).join('\n');
}

function checkRuntimeScripts(scripts, report) {
  for (const { attrs } of scripts) {
    const src = attribute(attrs, 'src');
    const isBabel = /\btype=(["'])text\/babel\1/i.test(attrs);
    if (isBabel && src) {
      report.error('external-jsx-src', `${src} 用 src 載入：雙擊開啟時瀏覽器會擋下，畫面空白。請用 inline_jsx.mjs 內嵌後驗證交付檔。`);
    }
    if (isBabel && /\bdata-type=(["'])module\1/i.test(attrs)) report.error('babel-module', 'Babel script 不可標 module。');
    if (/\btype=(["'])module\1/i.test(attrs) && src && extname(src) === '.jsx') report.error('babel-module', `${src} 不可用 type="module" 載入。`);
    if (!src) continue;
    const runtime = PINNED_RUNTIME.find((item) => item.pattern.test(src) && !(item.exclude && item.exclude.test(src)));
    if (runtime && (src !== runtime.src || attribute(attrs, 'integrity') !== runtime.integrity)) {
      report.error('unpinned-runtime', `${runtime.name} 必須使用 SKILL.md 的精確 script tag（pinned 版本 + integrity）：${src}`);
    }
  }
}

function checkAssetPath(value, artifactDir, report) {
  if (/^(#|data:|blob:|mailto:|tel:|javascript:)/i.test(value)) return;
  if (/^(https?:)?\/\//i.test(value)) {
    const host = new URL(value, 'https://placeholder.invalid').hostname;
    if (!ALLOWED_EXTERNAL_HOSTS.has(host)) report.error('external-asset', `外部資源需複製進作品資料夾：${value}`);
    return;
  }
  if (/^([a-z]:[\\/]|file:|\/)/i.test(value)) {
    report.error('local-absolute-path', `不可使用絕對路徑，作品才能搬移：${value}`);
    return;
  }
  const file = resolve(artifactDir, decodeURIComponent(value.split(/[?#]/)[0]));
  if (!existsSync(file)) report.error('missing-local-asset', `找不到本地資源：${value}`);
}

function checkAssets(html, scripts, artifactDir, report) {
  for (const { attrs } of scripts) {
    const src = attribute(attrs, 'src');
    if (src) checkAssetPath(src, artifactDir, report);
  }
  for (const match of stripNonMarkup(html).matchAll(/<(img|link|source|video|audio|iframe)\b([^>]*)>/gi)) {
    const [, tag, attrs] = match;
    const rel = attribute(attrs, 'rel');
    if (tag.toLowerCase() === 'link' && rel && /preconnect|dns-prefetch/i.test(rel)) continue;
    const value = attribute(attrs, 'src') ?? attribute(attrs, 'href');
    if (value) checkAssetPath(value, artifactDir, report);
  }
}

function checkTweaks(html, scriptText, report) {
  const blocks = [...html.matchAll(/\/\*EDITMODE-BEGIN\*\/([\s\S]*?)\/\*EDITMODE-END\*\//g)];
  if (blocks.length > 1) report.error('editmode-block', '整份檔案只能有一個 EDITMODE block。');
  for (const [, json] of blocks) {
    try {
      JSON.parse(json);
    } catch {
      report.error('editmode-block', 'EDITMODE block 內必須是合法 JSON。');
    }
  }
  const available = scriptText.indexOf('__edit_mode_available');
  const listener = scriptText.indexOf('__activate_edit_mode');
  if (available === -1 && listener === -1) return;
  if (available !== -1 && (listener === -1 || available < listener)) {
    report.error('tweaks-order', '必須先註冊 __activate_edit_mode listener，再送 __edit_mode_available。');
  }
  if (!/window\.parent\s*[!=]==?\s*window|window\s*[!=]==?\s*window\.parent/.test(scriptText)) {
    report.error('tweaks-no-standalone', '雙擊開啟時沒有 host 會送 activate 訊息，Tweaks 永遠打不開。請加 references/tweaks.md 的獨立入口。');
  }
}

function findDesignMd(artifactDir, explicitPath) {
  if (explicitPath) return existsSync(explicitPath) ? explicitPath : null;
  let directory = artifactDir;
  for (let level = 0; level <= 3; level += 1) {
    const hit = DESIGN_MD_NAMES.map((name) => join(directory, name)).find((path) => existsSync(path));
    if (hit) return hit;
    directory = dirname(directory);
  }
  return null;
}

function checkDesignTokens(html, designMdPath, report) {
  if (!designMdPath) return;
  const hexPattern = /#[0-9a-f]{6}\b/gi;
  const known = new Set((readFileSync(designMdPath, 'utf8').match(hexPattern) ?? []).map((hex) => hex.toLowerCase()));
  const drifted = new Set((styleBlocks(html).match(hexPattern) ?? []).map((hex) => hex.toLowerCase()).filter((hex) => !known.has(hex)));
  if (drifted.size) report.warn('token-drift', `HTML 的色值在 ${designMdPath} 找不到對應：${[...drifted].slice(0, 8).join(', ')}`);
}

function checkTypography(html, designMdPath, report) {
  const css = styleBlocks(html);
  const allowed = designMdPath ? readFileSync(designMdPath, 'utf8') : '';
  for (const [, font] of css.matchAll(OVERUSED_FONTS)) {
    if (!allowed.includes(font)) report.warn('overused-font', `${font} 是過度使用的主字型；改用有授權且可載入的字型。`);
  }
  if (html.includes('<deck-stage')) {
    const tooSmall = [...css.matchAll(/font-size\s*:\s*(\d+(?:\.\d+)?)px/gi)].map((match) => Number(match[1])).filter((size) => size < 24);
    if (tooSmall.length) report.warn('small-slide-text', `slide 文字低於 24px：${[...new Set(tooSmall)].join(', ')}px`);
  }
}

function checkSourceSize(artifactDir, report) {
  for (const name of readdirSync(artifactDir)) {
    if (!['.html', '.jsx', '.js'].includes(extname(name))) continue;
    const content = readFileSync(join(artifactDir, name), 'utf8');
    if (content.includes('generated by inline_jsx.mjs')) continue;
    const lines = content.split('\n').length;
    if (lines > 1000) report.warn('oversize-source', `${name} 有 ${lines} 行，請拆檔。`);
  }
}

function collectStaticFindings(artifactPath, options) {
  const artifactDir = dirname(artifactPath);
  const html = readFileSync(artifactPath, 'utf8');
  const scripts = parseScripts(html);
  const scriptText = scripts.map((script) => script.body).join('\n');
  const findings = { errors: [], warnings: [] };
  const add = (bucket) => (code, message) => {
    if (!bucket.some((item) => item.code === code && item.message === message)) bucket.push({ code, message });
  };
  const report = { error: add(findings.errors), warn: add(findings.warnings) };

  checkRuntimeScripts(scripts, report);
  checkAssets(html, scripts, artifactDir, report);
  checkTweaks(html, scriptText, report);
  if (/^\s*(?:const|let|var)\s+styles\s*=/m.test(scriptText)) report.error('global-styles-name', '全域 `styles` 會被同名變數靜默蓋掉，改用 <component>Styles。');
  if (/lorem ipsum/i.test(html)) report.error('lorem-ipsum', '不可使用 Lorem ipsum，改用接近真實的文字。');
  if (/scrollIntoView/.test(scriptText)) report.warn('scroll-into-view', 'iframe 預覽環境會受 scrollIntoView 干擾；不確定環境時改用 scrollTo。');
  if (!/<!--[\s\S]*?-->[\s\S]*<\/head>|<!--[\s\S]*?-->[\s\S]*<body/i.test(html)) report.warn('missing-design-comment', '檔案頂端缺少設計敘事與假設註解。');

  const designMdPath = findDesignMd(artifactDir, options.designMd);
  checkDesignTokens(html, designMdPath, report);
  checkTypography(html, designMdPath, report);
  checkSourceSize(artifactDir, report);
  return findings;
}

function findBrowser(explicitPath) {
  if (explicitPath) return existsSync(explicitPath) ? explicitPath : null;
  const known = (BROWSER_PATHS[process.platform] ?? []).find((path) => existsSync(path));
  if (known) return known;
  const locator = process.platform === 'win32' ? 'where' : 'which';
  for (const command of BROWSER_COMMANDS) {
    const result = spawnSync(locator, [command], { encoding: 'utf8' });
    const found = result.status === 0 ? result.stdout.split(/\r?\n/)[0].trim() : '';
    if (found) return found;
  }
  return null;
}

const sleep = (ms) => new Promise((done) => setTimeout(done, ms));

async function waitForDebugPort(userDataDir) {
  const portFile = join(userDataDir, 'DevToolsActivePort');
  for (let attempt = 0; attempt < 100; attempt += 1) {
    if (existsSync(portFile) && statSync(portFile).size > 0) return readFileSync(portFile, 'utf8').split('\n')[0].trim();
    await sleep(100);
  }
  return null;
}

function connectToPage(url) {
  const socket = new WebSocket(url);
  const pending = new Map();
  const listeners = [];
  let nextId = 0;
  socket.onmessage = (event) => {
    const message = JSON.parse(event.data);
    if (message.id && pending.has(message.id)) {
      pending.get(message.id)(message.result ?? { error: message.error });
      pending.delete(message.id);
    } else if (message.method) {
      listeners.forEach((listener) => listener(message));
    }
  };
  return new Promise((ready, failed) => {
    socket.onerror = () => failed(new Error('websocket_failed'));
    socket.onopen = () => ready({
      send: (method, params = {}) => new Promise((done) => {
        nextId += 1;
        pending.set(nextId, done);
        socket.send(JSON.stringify({ id: nextId, method, params }));
      }),
      on: (listener) => listeners.push(listener),
      close: () => socket.close(),
    });
  });
}

function recordEvent(message, result) {
  const push = (bucket, text) => {
    const clipped = String(text).slice(0, 400);
    if (!EXPECTED_MESSAGES.some((pattern) => pattern.test(clipped))) bucket.push(clipped);
  };
  if (message.method === 'Runtime.exceptionThrown') {
    const details = message.params.exceptionDetails;
    push(result.errors, details.exception?.description?.split('\n')[0] ?? details.text);
  } else if (message.method === 'Runtime.consoleAPICalled') {
    const text = message.params.args.map((arg) => arg.value ?? arg.description ?? '').join(' ');
    if (message.params.type === 'error') push(result.errors, text);
    if (message.params.type === 'warning') push(result.warnings, text);
  } else if (message.method === 'Log.entryAdded') {
    const { level, text } = message.params.entry;
    if (level === 'error') push(result.errors, text);
    if (level === 'warning') push(result.warnings, text);
  }
}

const PAGE_PROBE = `(() => {
  const root = document.getElementById('root');
  const deck = document.querySelector('deck-stage');
  const media = document.querySelectorAll('img,svg,canvas,video').length;
  return {
    title: document.title,
    rendered: document.body.innerText.trim().length + media > 0,
    rootChildren: root ? root.childElementCount : null,
    screenLabels: document.querySelectorAll('[data-screen-label]').length,
    deckSlides: deck ? deck.querySelectorAll(':scope > section').length : null,
    deckForeignChildren: deck ? [...deck.children].filter((el) => !['SECTION', 'SCRIPT', 'STYLE', 'TEMPLATE'].includes(el.tagName)).length : null,
  };
})()`;

async function inspectPage(page, artifactPath, options, result) {
  const [width, height] = options.viewport.split('x').map(Number);
  let markLoaded;
  const loaded = new Promise((done) => { markLoaded = done; });
  page.on((message) => {
    recordEvent(message, result);
    if (message.method === 'Page.loadEventFired') markLoaded();
  });
  for (const domain of ['Page.enable', 'Runtime.enable', 'Log.enable']) await page.send(domain);
  await page.send('Emulation.setDeviceMetricsOverride', { width, height, deviceScaleFactor: 1, mobile: false });
  await page.send('Page.navigate', { url: pathToFileURL(artifactPath).href });
  await Promise.race([loaded, sleep(20000)]);
  await sleep(Number(options.settleMs));

  const probe = await page.send('Runtime.evaluate', { expression: PAGE_PROBE, returnByValue: true });
  result.page = probe.result?.value ?? null;
  if (options.screenshot && result.page) {
    const shot = await page.send('Page.captureScreenshot', { format: 'png' });
    writeFileSync(resolve(options.screenshot), Buffer.from(shot.data, 'base64'));
    result.screenshot = resolve(options.screenshot);
  }
}

function judgeRender(result) {
  const { page } = result;
  if (!page) result.errors.push('無法讀取頁面狀態。');
  else if (!page.rendered || page.rootChildren === 0) result.errors.push('blank-render：頁面載入後沒有可見內容。');
  else if (page.deckForeignChildren) result.errors.push('deck-stage 的直系子元素只能是 section；slide 被其他元素包住時無法翻頁。');
  result.status = result.errors.length ? 'FAIL' : 'PASS';
}

// 結束完整 process tree：瀏覽器會再開 renderer 與 GPU 子程序，只結束主程序可能留下殘留。
function stopProcessTree(child) {
  if (process.platform === 'win32') {
    spawnSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' });
    return;
  }
  try {
    process.kill(-child.pid, 'SIGKILL');
  } catch {
    child.kill('SIGKILL');
  }
}

async function runBrowserCheck(artifactPath, options) {
  if (typeof WebSocket === 'undefined') return { status: 'UNVERIFIED', reason: 'node_without_websocket：需要 Node 22 以上。' };
  const browser = findBrowser(options.browser);
  if (!browser) return { status: 'UNVERIFIED', reason: 'browser_not_found：找不到 Chrome、Edge 或 Chromium。' };

  const userDataDir = mkdtempSync(join(tmpdir(), 'cc-designer-verify-'));
  // 不加 --allow-file-access-from-files：驗證要重現使用者雙擊開啟的限制。
  const processHandle = spawn(browser, ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${userDataDir}`, '--no-first-run', '--no-default-browser-check', 'about:blank'], { stdio: 'ignore', detached: process.platform !== 'win32' });
  const result = { status: 'UNVERIFIED', browser, errors: [], warnings: [], page: null };
  try {
    const port = await waitForDebugPort(userDataDir);
    if (!port) return { ...result, reason: 'browser_start_failed：瀏覽器未開啟除錯埠。' };
    const targets = await (await fetch(`http://127.0.0.1:${port}/json/list`)).json();
    const page = await connectToPage(targets.find((target) => target.type === 'page').webSocketDebuggerUrl);
    await inspectPage(page, artifactPath, options, result);
    page.close();
    judgeRender(result);
    return result;
  } catch (error) {
    return { ...result, reason: `browser_check_failed：${error.message}` };
  } finally {
    stopProcessTree(processHandle);
    await sleep(300);
    rmSync(userDataDir, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
  }
}

function overallStatus(staticFindings, runtime) {
  if (staticFindings.errors.length || runtime.status === 'FAIL') return 'FAIL';
  return runtime.status === 'PASS' ? 'PASS' : 'UNVERIFIED';
}

const NEXT_ACTION = {
  PASS: '機械驗證通過；warnings 寫進 caveats，再做視覺與內容人工 QA。',
  FAIL: '修完 errors 後重跑；FAIL 時不可交付。',
  UNVERIFIED: '沒有實際看過 console。改用可讀 console 的瀏覽器工具驗證；都沒有時在 caveats 寫明「console 未驗證」，不可宣稱無錯誤。',
};

async function main(argv) {
  const { artifact, options } = parseArgs(argv);
  if (!artifact || !existsSync(artifact) || !/\.html?$/i.test(artifact)) {
    console.log(JSON.stringify({ status: 'FAIL', code: 'usage', message: '需要既有的 .html 成品路徑。' }, null, 2));
    process.exit(1);
  }
  const artifactPath = resolve(artifact);
  const staticFindings = collectStaticFindings(artifactPath, options);
  const runtime = options.staticOnly
    ? { status: 'UNVERIFIED', reason: 'static_only：本次未開啟瀏覽器。' }
    : await runBrowserCheck(artifactPath, options);
  const status = overallStatus(staticFindings, runtime);
  console.log(JSON.stringify({ status, artifact: artifactPath, static: staticFindings, runtime, next_action: NEXT_ACTION[status] }, null, 2));
  process.exit({ PASS: 0, FAIL: 1, UNVERIFIED: 2 }[status]);
}

await main(process.argv.slice(2));
