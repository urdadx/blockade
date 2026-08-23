# Install Blockade on Mozilla Firefox

Blockade is distributed for Firefox as a Manifest V2 extension.

## Temporary Installation

The GitHub release is not signed by Mozilla. Standard Firefox installations can load it temporarily for testing, but Firefox removes it when the browser restarts.

1. Download [`extension-0.0.1-firefox.zip`](https://github.com/urdadx/blockade/releases/download/v0.0.1/extension-0.0.1-firefox.zip).
2. Open `about:debugging#/runtime/this-firefox` in Firefox.
3. Select **Load Temporary Add-on**.
4. Select the downloaded ZIP file. If your Firefox version does not accept the ZIP, extract it and select its `manifest.json` file instead.
5. Open Blockade from the Extensions menu.

Repeat these steps after restarting Firefox.

## Permanent Installation

A permanent Firefox installation requires an extension signed by [Mozilla Add-ons](https://addons.mozilla.org/). The `v0.0.1` GitHub release does not include a signed `.xpi`, so it cannot be installed permanently in standard Firefox yet.

[Back to the main README](../../README.md)
