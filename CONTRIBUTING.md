# Contributing

Contributions and compatibility reports are welcome. Before opening a change, search existing issues
and describe the switch model, hardware revision, integration version, Home Assistant version, and the
behavior you expect.

1. Fork the repository and create a focused branch.
2. Run `npm ci`.
3. Make the change in `src/`; never edit the generated `dist/` bundle manually.
4. Add or update tests under `test/`.
5. Run `npm run check` before opening a pull request.

Pull requests should contain a concise rationale, testing evidence, and screenshots or a short recording
for visible UI changes. Do not include switch credentials, public IP addresses, cookies, or unredacted
diagnostic dumps.
