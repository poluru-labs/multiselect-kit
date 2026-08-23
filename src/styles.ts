export const STYLES = /* css */ `
:host {
  --ms-font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
  --ms-font-size: 14px;
  --ms-line-height: 1.4;
  --ms-radius: 10px;
  --ms-chip-radius: 999px;
  --ms-control-min-height: 42px;
  --ms-control-padding: 6px 8px;
  --ms-control-bg: #fff;
  --ms-control-border: 1px solid #d7dce3;
  --ms-control-shadow: 0 1px 2px rgb(16 24 40 / 0.04);
  --ms-text: #1c2430;
  --ms-muted: #667085;
  --ms-accent: #2563eb;
  --ms-accent-soft: #eff4ff;
  --ms-danger: #b42318;
  --ms-chip-bg: #f2f4f7;
  --ms-chip-text: #1c2430;
  --ms-option-hover: #f5f7fa;
  --ms-option-active: #eef3ff;
  --ms-list-bg: #fff;
  --ms-list-border: 1px solid #e4e7ec;
  --ms-list-shadow: 0 12px 32px rgb(16 24 40 / 0.14);
  --ms-focus-ring: 0 0 0 3px rgb(37 99 235 / 0.28);
  --ms-z-index: 40;
  --ms-disabled-opacity: 0.6;

  display: block;
  position: relative;
  font-family: var(--ms-font-family);
  font-size: var(--ms-font-size);
  line-height: var(--ms-line-height);
  color: var(--ms-text);
  box-sizing: border-box;
}

:host *,
:host *::before,
:host *::after {
  box-sizing: border-box;
}

:host([disabled]) {
  opacity: var(--ms-disabled-opacity);
  pointer-events: none;
}

:host([disabled]) .ms__control {
  background: #f8fafc;
}

.ms__sr,
.ms__live {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.ms__label {
  display: inline-block;
  margin-bottom: 6px;
  font-weight: 600;
  color: var(--ms-text);
}

.ms__label:empty {
  display: none;
}

.ms__control {
  display: flex;
  align-items: center;
  gap: 6px;
  min-height: var(--ms-control-min-height);
  padding: var(--ms-control-padding);
  background: var(--ms-control-bg);
  border: var(--ms-control-border);
  border-radius: var(--ms-radius);
  box-shadow: var(--ms-control-shadow);
  cursor: text;
}

.ms__control.is-open,
.ms__control:focus-within {
  border-color: var(--ms-accent);
  box-shadow: var(--ms-focus-ring);
}

.ms__chips {
  display: flex;
  flex: 1 1 auto;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  min-width: 0;
}

.ms__chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  max-width: 100%;
  padding: 3px 4px 3px 10px;
  border: 0;
  border-radius: var(--ms-chip-radius);
  background: var(--ms-chip-bg);
  color: var(--ms-chip-text);
  font: inherit;
  line-height: 1.2;
}

.ms__chip-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ms__chip-remove {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 0;
  border-radius: 999px;
  background: transparent;
  color: var(--ms-muted);
  cursor: pointer;
  font: inherit;
}

.ms__chip-remove:hover,
.ms__chip-remove:focus-visible {
  background: #e4e7ec;
  color: var(--ms-text);
  outline: none;
}

.ms__input {
  flex: 1 1 8rem;
  min-width: 8rem;
  width: 100%;
  border: 0;
  background: transparent;
  color: inherit;
  font: inherit;
  outline: none;
}

.ms__input:disabled {
  cursor: not-allowed;
}

.ms__placeholder {
  color: var(--ms-muted);
  pointer-events: none;
}

.ms__actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex: 0 0 auto;
}

.ms__icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: var(--ms-muted);
  cursor: pointer;
}

.ms__icon-btn:hover,
.ms__icon-btn:focus-visible {
  background: var(--ms-option-hover);
  color: var(--ms-text);
  outline: none;
}

.ms__chevron {
  transition: transform 0.16s ease;
}

.ms__control.is-open .ms__chevron {
  transform: rotate(180deg);
}

.ms__listbox {
  position: absolute;
  z-index: var(--ms-z-index);
  left: 0;
  right: 0;
  top: calc(100% + 6px);
  display: none;
  max-height: 280px;
  overflow: auto;
  padding: 6px;
  background: var(--ms-list-bg);
  border: var(--ms-list-border);
  border-radius: 12px;
  box-shadow: var(--ms-list-shadow);
}

.ms__listbox.is-open {
  display: block;
}

.ms__toolbar {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 6px 8px;
  border-bottom: 1px solid #eef1f5;
  margin-bottom: 4px;
}

.ms__toolbar button {
  border: 0;
  background: transparent;
  color: var(--ms-accent);
  font: inherit;
  font-weight: 600;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 6px;
}

.ms__toolbar button:hover,
.ms__toolbar button:focus-visible {
  background: var(--ms-accent-soft);
  outline: none;
}

.ms__toolbar button:disabled {
  color: var(--ms-muted);
  cursor: not-allowed;
  background: transparent;
}

.ms__group-label {
  padding: 8px 10px 4px;
  color: var(--ms-muted);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.ms__option {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  width: 100%;
  padding: 8px 10px;
  border: 0;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font: inherit;
  text-align: left;
  cursor: pointer;
}

.ms__option:hover,
.ms__option.is-active {
  background: var(--ms-option-hover);
}

.ms__option.is-active {
  background: var(--ms-option-active);
}

.ms__option.is-selected {
  font-weight: 600;
}

.ms__option.is-disabled {
  color: var(--ms-muted);
  cursor: not-allowed;
  opacity: 0.7;
}

.ms__check {
  width: 16px;
  height: 16px;
  margin-top: 2px;
  border: 1.5px solid #c8d0db;
  border-radius: 4px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #fff;
}

.ms__option.is-selected .ms__check {
  background: var(--ms-accent);
  border-color: var(--ms-accent);
  color: #fff;
}

.ms__option-copy {
  min-width: 0;
  flex: 1 1 auto;
}

.ms__option-desc {
  display: block;
  color: var(--ms-muted);
  font-size: 12px;
  font-weight: 400;
}

.ms__status {
  padding: 18px 12px;
  color: var(--ms-muted);
  text-align: center;
}

.ms__spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  margin-right: 8px;
  border: 2px solid #d7dce3;
  border-top-color: var(--ms-accent);
  border-radius: 50%;
  animation: ms-spin 0.7s linear infinite;
  vertical-align: -3px;
}

@keyframes ms-spin {
  to { transform: rotate(360deg); }
}

svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 1.8;
  stroke-linecap: round;
  stroke-linejoin: round;
}
`;
