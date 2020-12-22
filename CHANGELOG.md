# Changelog

## Unreleased

### 0.4.0

#### Added

- Add profiler hook to interop updates instantly between hux & hux profiler (#16)

---

## Released

### 0.3.0

#### Added

- Events now linked by an id so the profiler can group events together (#6)

#### Fixed
- Fixed `hydrate` response structure if profiler is not enabled
- Changed `Filter` id to optional to allow for filtering on root arrays
- Fixed special characters breaking `Filter`

### 0.2.0

#### Fixed

- `onUpdate` now only called if `query` is present in `hydrate` (#2)
- `triggerListeners` now called with correct data in `hydrate` (#2)
- correct response returned if `query` is not set (#2)
- Reduced overall package size (#5)

### 0.1.1
...
### 0.1.0
...
