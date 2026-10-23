import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

// Run the app's ESM .js files without changing the package's module type.
function runEcho(script) {
  const result = spawnSync(process.execPath, [
    "--experimental-default-type=module", "--input-type=module", "-e", script,
  ], { cwd: new URL("..", import.meta.url), encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
}

const configured = `
  process.env.NEXT_PUBLIC_REVERB_APP_KEY = 'public-test-key';
  process.env.NEXT_PUBLIC_REVERB_HOST = 'reverb.example.test';
  process.env.NEXT_PUBLIC_REVERB_PORT = '8080';
  process.env.NEXT_PUBLIC_REVERB_SCHEME = 'http';
`;

test("SSR import and getEcho do not require window even with configuration", () => {
  runEcho(`${configured}
    const { getEcho } = await import('./lib/echo.js');
    const assert = (await import('node:assert/strict')).default;
    assert.equal(getEcho(), null);
  `);
});

test("a browser without any required public setting does not connect", () => {
  for (const name of ["APP_KEY", "HOST", "PORT", "SCHEME"]) {
    runEcho(`${configured}
      globalThis.window = {};
      delete process.env.NEXT_PUBLIC_REVERB_${name};
      const { getEcho } = await import('./lib/echo.js');
      const assert = (await import('node:assert/strict')).default;
      assert.equal(getEcho(), null);
    `);
  }
});

test("nomination subscriptions include both event and subject IDs", () => {
  runEcho(`
    const { getNominationChannelName } = await import('./lib/echo.js');
    const assert = (await import('node:assert/strict')).default;
    assert.equal(getNominationChannelName(12, 34), 'events.12.nominations.34');
    assert.equal(getNominationChannelName(56, 34), 'events.56.nominations.34');
  `);
});

test("configured browsers share one Reverb connection with the requested transport", () => {
  for (const scheme of ["http", "https"]) {
    runEcho(`${configured}
      globalThis.window = {};
      process.env.NEXT_PUBLIC_REVERB_SCHEME = '${scheme}';
      const Pusher = (await import('pusher-js')).default;
      // Suppress only the network connection; keep real Echo/Pusher configuration.
      Pusher.prototype.connect = function () {};
      const { getEcho } = await import('./lib/echo.js');
      const assert = (await import('node:assert/strict')).default;
      const echo = getEcho();
      assert.ok(echo);
      assert.equal(getEcho(), echo);
      assert.equal(echo.connector.options.broadcaster, 'reverb');
      assert.equal(echo.connector.pusher.key, 'public-test-key');
      assert.equal(echo.connector.pusher.config.wsHost, 'reverb.example.test');
      assert.equal(echo.connector.pusher.config.wsPort, 8080);
      assert.equal(echo.connector.pusher.config.wssPort, 8080);
      assert.equal(echo.connector.pusher.config.useTLS, ${scheme === "https"});
      assert.deepEqual(echo.connector.pusher.config.enabledTransports, ['ws', 'wss']);
    `);
  }
});

test("private authorization uses the existing credentialed Axios client and reports success or error", () => {
  runEcho(`${configured}
    globalThis.window = {};
    const Pusher = (await import('pusher-js')).default;
    Pusher.prototype.connect = function () {};
    const api = (await import('./lib/api.js')).default;
    const assert = (await import('node:assert/strict')).default;
    const requests = [];
    const failure = new Error('Forbidden');
    api.defaults.adapter = async (config) => {
      requests.push(config);
      if (requests.length === 2) throw failure;
      return { data: { auth: 'signed-authorization' }, status: 200, statusText: 'OK', headers: {}, config };
    };
    const { getEcho } = await import('./lib/echo.js');
    const authorizer = getEcho().connector.options.authorizer({ name: 'private-events.12.nominations.34' });
    const success = await new Promise((resolve) => authorizer.authorize('123.456', (...args) => resolve(args)));
    assert.deepEqual(success, [false, { auth: 'signed-authorization' }]);
    const error = await new Promise((resolve) => authorizer.authorize('123.456', (...args) => resolve(args)));
    assert.deepEqual(error, [true, failure]);
    for (const request of requests) {
      assert.equal(request.url, '/api/broadcasting/auth');
      assert.equal(request.method, 'post');
      assert.equal(request.withCredentials, true);
      assert.equal(request.withXSRFToken, true);
      assert.deepEqual(JSON.parse(request.data), { socket_id: '123.456', channel_name: 'private-events.12.nominations.34' });
    }
  `);
});
