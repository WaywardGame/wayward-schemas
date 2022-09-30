# Change Log

## 1.4.6
Wayward: Wheels & Wetlands update.

## 1.4.5
- Update syntax for links.

## 1.4.4
- Add support for falsy coalescing segment.

## 1.4.3
Wayward 2.11.0 update.

## 1.4.2
- Fixed the conditional segment displaying numeric comparisons as arguments.

## 1.4.1
- Fixed list segment being very fragile.

## 1.4.0
Wayward 2.10.0 update.
- Added interpolation syntax highlighting to language files. In case any mods add languages programmatically, `//#lang` and `//#endlang` comments can be used to enable interpolation syntax highlighting within strings.

## 1.3.1
Wayward 2.9.3 update.
- `launch_options.json` now allows comments.

## 1.3.0
Wayward 2.9.2 update.
- All Wayward JSON files now allow comments.

## 1.2.2
Wayward 2.9.0 update.

## 1.2.1
Wayward 2.8.5 update.
- `lang.json`
	- Fixed `shouldPluralize` still existing at all. (This actually got removed a while back.)
	- Added missing `alternateFontStyle` option.
	- Updated default entries list.

## 1.2.0
Wayward 2.8.0 update.
- `mod.json`
	- Updated `multiplayer` to an enum of `clientside`, `compatible`, or `serverside`.
	- Added `allowUnlockingMilestones` property.
	- Removed `compatibleMinorVersions` property, to be replaced with `waywardVersion`. This property is only required if you have scripts.
	- The `multiplayer`, `waywardVersion`, `allowUnlockingMilestones`, and `unloadable` properties now all require the `file` property to be present. The `file` property now requires the `waywardVersion` property to be present.
- `lang.json`
	- Fixed `uncountables` being referred to as `uncountableRules`.
	- Fixed being allowed to use `shouldPluralize` in a language extension.
	- Updated default entries list.
- All schemas:
	- Additional unknown properties are no longer allowed.

## 1.1.3
Wayward 2.7.3 update.
- `lang.json`
	- The count matcher in article rules now supports `{min: number, max?: number}` objects.

## 1.1.2
- Fixed schemas not being published with the rest of the extension? (Thanks VSCE??)

## 1.1.1
- Fix `null` dictionary entries not working.

## 1.1.0
Wayward 2.7 update.
- `mod.json` — Added `tags`
- `lang.json`
	- Added `pluralizationRules`
	- Updated default entries list

## 1.0.0
Initial release. 
- Schemas for `mod.json`, `lang/*.json`, `imageOverrides.json`, `customizations.json`