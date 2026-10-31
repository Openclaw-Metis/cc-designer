// 維護者回歸測試：node --test tests/artifact_tools.test.mjs
// 需要 Node 22 以上；瀏覽器案例需要 Chrome／Edge／Chromium，React 案例需要連到 unpkg.com。
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { copyFileSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, test } from 'node:test';
import { fileURLToPath } from 'node:url';

const REPO = join(dirname(fileURLToPath(import.meta.url)), '..');
const PACKAGE = join(REPO, 'cc-designer');
const INLINE = join(PACKAGE, 'scripts', 'inline_jsx.mjs');
const VERIFY = join(PACKAGE, 'scripts', 'verify_artifact.mjs');
const STARTERS = join(PACKAGE, 'assets', 'starters');
const RUNTIME_TAGS = readFileSync(join(PACKAGE, 'SKILL.md'), 'utf8').match(/<script src="https:\/\/unpkg\.com[^\n]*<\/script>/g).join('\n');
const SANDBOX = mkdtempSync(join(tmpdir(), 'cc-designer-test-'));
after(() => rmSync(SANDBOX, { recursive: true, force: true }));

let counter = 0;
function project(files) {
  counter += 1;
  const directory = join(SANDBOX, `case-${counter}`);
  mkdirSync(directory);
  for (const [name, content] of Object.entries(files)) writeFileSync(join(directory, name), content, 'utf8');
  return directory;
}

function run(script, args) {
  const result = spawnSync(process.execPath, [script, ...args], { encoding: 'utf8' });
  return { code: result.status, report: JSON.parse(result.stdout) };
}

const verifyStatic = (directory, name = 'index.html') => run(VERIFY, [join(directory, name), '--static-only']);
const verifyLive = (directory, name = 'index.html') => run(VERIFY, [join(directory, name)]);
const errorCodes = ({ report }) => report.static.errors.map((item) => item.code);
const warningCodes = ({ report }) => report.static.warnings.map((item) => item.code);
const page = (body, head = '') => `<!DOCTYPE html><html><head><meta charset="utf-8"><!-- 設計敘事：測試 -->${head}</head><body>${body}</body></html>`;
const DECK = page('<deck-stage><section data-screen-label="01 Title"><h1>Hello</h1></section></deck-stage>', '<script src="deck_stage.js"></script>');

function deckProject(html = DECK) {
  const directory = project({ 'index.html': html });
  copyFileSync(join(STARTERS, 'deck_stage.js'), join(directory, 'deck_stage.js'));
  return directory;
}

test('inline_jsx 依序內嵌 JSX 並跳脫 </script', () => {
  const directory = project({
    'index.src.html': page('<div id="root"></div><script type="text/babel" src="a.jsx"></script>\n<script src="plain.js"></script>\n<script type="text/babel" src="b.jsx"></script>'),
    'a.jsx': 'const a = "</script>"; const price = "$&";',
    'b.jsx': 'const b = 2;',
    'plain.js': '',
  });
  const { code, report } = run(INLINE, [join(directory, 'index.src.html'), join(directory, 'Built.html')]);
  assert.equal(code, 0);
  assert.deepEqual(report.inlined, ['a.jsx', 'b.jsx']);
  const built = readFileSync(join(directory, 'Built.html'), 'utf8');
  assert.ok(built.indexOf('data-source="a.jsx"') < built.indexOf('data-source="b.jsx"'));
  assert.ok(built.includes('<\\/script>"') && built.includes('"$&"'));
  assert.ok(built.includes('<script src="plain.js"></script>'));
  assert.equal(run(INLINE, [join(directory, 'index.src.html'), join(directory, 'Built.html')]).code, 0, '自己產生的檔案可重建');
});

test('inline_jsx 拒絕遠端、越界、缺檔與覆蓋手寫檔', () => {
  const directory = project({
    'remote.html': page('<script type="text/babel" src="https://example.test/a.jsx"></script>'),
    'escape.html': page('<script type="text/babel" src="../other/a.jsx"></script>'),
    'missing.html': page('<script type="text/babel" src="nope.jsx"></script>'),
    'ok.html': page('<p>ok</p>'),
    'hand.html': page('<p>hand</p>'),
  });
  const code = (source, output) => run(INLINE, [join(directory, source), join(directory, output)]).report.code;
  assert.equal(code('remote.html', 'o1.html'), 'remote_jsx');
  assert.equal(code('escape.html', 'o2.html'), 'jsx_outside_project');
  assert.equal(code('missing.html', 'o3.html'), 'jsx_missing');
  assert.equal(code('ok.html', 'hand.html'), 'refuse_overwrite');
  assert.equal(code('ok.html', 'ok.html'), 'source_is_output');
});

const STATIC_CASES = [
  ['external-jsx-src', page('<script type="text/babel" src="a.jsx"></script>')],
  ['unpinned-runtime', page('<script src="https://unpkg.com/react@18/umd/react.development.js"></script>')],
  ['unpinned-runtime', page('<script src="https://unpkg.com/react@18.3.1/umd/react.development.js"></script>')],
  ['babel-module', page('<script type="text/babel" data-type="module">const a=1</script>')],
  ['global-styles-name', page('<script type="text/babel">\nconst styles = {};\n</script>')],
  ['lorem-ipsum', page('<p>Lorem ipsum dolor</p>')],
  ['missing-local-asset', page('<img src="assets/nope.png" alt="x">')],
  ['local-absolute-path', page('<img src="C:/Users/me/a.png" alt="x">')],
  ['local-absolute-path', page('<img src="/assets/a.png" alt="x">')],
  ['external-asset', page('<img src="https://example.test/a.png" alt="x">')],
  ['editmode-block', page('<script>const a=/*EDITMODE-BEGIN*/{bad:1}/*EDITMODE-END*/;</script>')],
  ['editmode-block', page('<script>const a=/*EDITMODE-BEGIN*/{}/*EDITMODE-END*/;const b=/*EDITMODE-BEGIN*/{}/*EDITMODE-END*/;</script>')],
  ['tweaks-order', page("<script>parent.postMessage({type:'__edit_mode_available'},'*');addEventListener('message',e=>e.data.type==='__activate_edit_mode');if(window.parent!==window){}</script>")],
  ['tweaks-no-standalone', page("<script>addEventListener('message',e=>e.data.type==='__activate_edit_mode');parent.postMessage({type:'__edit_mode_available'},'*');</script>")],
];

for (const [expected, html] of STATIC_CASES) {
  test(`靜態規則擋下 ${expected}`, () => {
    const result = verifyStatic(project({ 'index.html': html }));
    assert.ok(errorCodes(result).includes(expected), JSON.stringify(result.report.static));
    assert.equal(result.report.status, 'FAIL');
    assert.equal(result.code, 1);
  });
}

test('靜態警告不阻擋，但會列出', () => {
  const html = page('<deck-stage><section><p>Hi</p></section></deck-stage>', '<script src="deck_stage.js"></script><style>body{font-family:Inter;font-size:16px;color:#123456}</style>');
  const directory = deckProject(html);
  writeFileSync(join(directory, 'DESIGN.md'), 'colors:\n  primary: "#000000"\n', 'utf8');
  const result = verifyStatic(directory);
  assert.deepEqual(errorCodes(result), []);
  assert.deepEqual(warningCodes(result).sort(), ['overused-font', 'small-slide-text', 'token-drift']);
});

test('合格的 Google Fonts 與本地資源不被誤報', () => {
  const head = '<link rel="preconnect" href="https://fonts.gstatic.com"><link href="https://fonts.googleapis.com/css2?family=Fraunces&display=swap" rel="stylesheet">';
  const result = verifyStatic(project({ 'index.html': page('<a href="https://example.test">outbound</a><h1>Hi</h1>', head) }));
  assert.deepEqual(errorCodes(result), []);
});

test('--static-only 回 UNVERIFIED，不得當成通過', () => {
  const result = verifyStatic(deckProject());
  assert.equal(result.report.status, 'UNVERIFIED');
  assert.equal(result.code, 2);
});

test('找不到瀏覽器時回 UNVERIFIED 與原因', () => {
  const directory = deckProject();
  const result = run(VERIFY, [join(directory, 'index.html'), '--browser', join(directory, 'no-such-browser.exe')]);
  assert.equal(result.report.status, 'UNVERIFIED');
  assert.match(result.report.runtime.reason, /browser_not_found/);
  assert.equal(result.code, 2);
});

test('瀏覽器：合格 deck 通過並回報 slide 數', () => {
  const result = verifyLive(deckProject());
  assert.equal(result.report.status, 'PASS', JSON.stringify(result.report));
  assert.equal(result.report.runtime.page.deckSlides, 1);
});

function starterProps() {
  const props = new Map();
  for (const name of readdirSync(STARTERS).filter((file) => file.endsWith('.jsx'))) {
    const source = readFileSync(join(STARTERS, name), 'utf8');
    for (const [, component, body] of source.matchAll(/^function ([A-Z]\w+)\(\{([\s\S]*?)\}\) \{$/gm)) {
      const params = body.replace(/\/\/.*$/gm, '').replace(/'[^']*'/g, "''").replace(/\[[^\]]*\]/g, '[]');
      props.set(component, new Set(params.split(',').map((part) => part.split('=')[0].trim()).filter(Boolean)));
    }
  }
  return props;
}

test('文件寫到的 starter props 都存在於 starter', () => {
  const props = starterProps();
  assert.ok(props.has('IOSDevice') && props.has('Stage') && props.has('DCArtboard'));
  const problems = [];
  for (const doc of ['starter-components.md', 'animations.md', 'prototypes.md', 'wireframes.md']) {
    const text = readFileSync(join(PACKAGE, 'references', doc), 'utf8');
    for (const [, component, attrs] of text.matchAll(/<([A-Z]\w+)\b([^>]*)>/g)) {
      if (!props.has(component)) continue;
      const names = attrs.replace(/\{[^}]*\}/g, '').replace(/"[^"]*"/g, '').match(/[A-Za-z]\w*/g) ?? [];
      for (const name of names) {
        if (!props.get(component).has(name)) problems.push(`${doc}: <${component} ${name}>`);
      }
    }
  }
  assert.deepEqual(problems, []);
});

test('瀏覽器：references/decks.md 的 notes 面板會跟著翻頁', () => {
  const decksDoc = readFileSync(join(PACKAGE, 'references', 'decks.md'), 'utf8');
  const panel = decksDoc.match(/```html\n(<script>\n  document\.addEventListener\('slidechange'[\s\S]*?)\n```/)[1];
  const notes = '<script type="application/json" id="speaker-notes">["第一頁講稿"]</script>';
  const body = '<aside id="notes-panel" hidden></aside><deck-stage><section data-screen-label="01 Title"><h1>Hello</h1></section></deck-stage>';
  const result = verifyLive(deckProject(page(body, `<script src="deck_stage.js"></script>${notes}${panel}`)));
  assert.equal(result.report.status, 'PASS', JSON.stringify(result.report));
});

test('瀏覽器：references/tweaks.md 的範例可原樣放進 deck 並通過', () => {
  const tweaksDoc = readFileSync(join(PACKAGE, 'references', 'tweaks.md'), 'utf8');
  const snippet = tweaksDoc.match(/```html\n(<script>\nconst TWEAK_DEFAULTS[\s\S]*?)\n```/)[1];
  const result = verifyLive(deckProject(page('<deck-stage><section data-screen-label="01 Title"><h1>Hello</h1></section></deck-stage>', `<script src="deck_stage.js"></script>${snippet}`)));
  assert.equal(result.report.status, 'PASS', JSON.stringify(result.report));
});

test('瀏覽器：未捕捉例外會 FAIL', () => {
  const result = verifyLive(deckProject(page('<deck-stage><section><h1>Hi</h1></section></deck-stage><script>missingFunction();</script>', '<script src="deck_stage.js"></script>')));
  assert.equal(result.report.status, 'FAIL');
  assert.match(result.report.runtime.errors.join('\n'), /missingFunction/);
});

test('瀏覽器：空白頁會 FAIL', () => {
  const result = verifyLive(project({ 'index.html': page('<div id="root"></div>') }));
  assert.equal(result.report.status, 'FAIL');
  assert.match(result.report.runtime.errors.join('\n'), /blank-render/);
});

test('瀏覽器：slide 被包住時會 FAIL', () => {
  const result = verifyLive(deckProject(page('<deck-stage><div><section><h1>Hi</h1></section></div></deck-stage>', '<script src="deck_stage.js"></script>')));
  assert.equal(result.report.status, 'FAIL');
});

test('瀏覽器：React 多檔 prototype 內嵌後可在 file:// 掛載', () => {
  const directory = project({
    'index.src.html': page(`<div id="root"></div>\n<script type="text/babel" src="ios_frame.jsx"></script>\n<script type="text/babel" src="app.jsx"></script>`, RUNTIME_TAGS),
    'app.jsx': 'function App() { return <IOSDevice navTitle="Home"><div data-screen-label="01 Home">Hello</div></IOSDevice>; }\nReactDOM.createRoot(document.getElementById("root")).render(<App />);',
  });
  copyFileSync(join(STARTERS, 'ios_frame.jsx'), join(directory, 'ios_frame.jsx'));

  const unbuilt = verifyLive(directory, 'index.src.html');
  assert.equal(unbuilt.report.status, 'FAIL');
  assert.ok(errorCodes(unbuilt).includes('external-jsx-src'));
  assert.match(unbuilt.report.runtime.errors.join('\n'), /CORS|blank-render/);

  assert.equal(run(INLINE, [join(directory, 'index.src.html'), join(directory, 'Prototype.html')]).code, 0);
  const built = verifyLive(directory, 'Prototype.html');
  assert.equal(built.report.status, 'PASS', JSON.stringify(built.report));
  assert.equal(built.report.runtime.page.rootChildren, 1);
  assert.equal(built.report.runtime.page.screenLabels, 1);
});
