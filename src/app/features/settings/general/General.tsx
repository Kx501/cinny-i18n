import React, {
  ChangeEventHandler,
  FormEventHandler,
  KeyboardEventHandler,
  MouseEventHandler,
  useEffect,
  useState,
  useRef,
} from 'react';
import dayjs from 'dayjs';
import {
  as,
  Box,
  Button,
  Chip,
  config,
  Header,
  Icon,
  IconButton,
  Icons,
  Input,
  Menu,
  MenuItem,
  PopOut,
  RectCords,
  Scroll,
  Switch,
  Text,
  toRem,
} from 'folds';
import { isKeyHotkey } from 'is-hotkey';
import FocusTrap from 'focus-trap-react';
import { Page, PageContent, PageHeader } from '../../../components/page';
import { SequenceCard } from '../../../components/sequence-card';
import { useSetting } from '../../../state/hooks/settings';
import { DateFormat, MessageLayout, MessageSpacing, settingsAtom } from '../../../state/settings';
import { SettingTile } from '../../../components/setting-tile';
import { KeySymbol } from '../../../utils/key-symbol';
import { isMacOS } from '../../../utils/user-agent';
import {
  DarkTheme,
  LightTheme,
  Theme,
  ThemeKind,
  useSystemThemeKind,
  useThemeNames,
  useThemes,
} from '../../../hooks/useTheme';
import { stopPropagation } from '../../../utils/keyboard';
import { useMessageLayoutItems } from '../../../hooks/useMessageLayout';
import { useMessageSpacingItems } from '../../../hooks/useMessageSpacing';
import { useDateFormatItems } from '../../../hooks/useDateFormat';
import { SequenceCardStyle } from '../styles.css';
import { useTranslation } from 'react-i18next';

// 支持的语言列表
const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'zh', name: 'Chinese', nativeName: '中文' },
  { code: 'de', name: 'German', nativeName: 'Deutsch' }
];

type LanguageSelectorProps = {
  disabled?: boolean;
};

function LanguageSelector({ disabled }: LanguageSelectorProps) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return SUPPORTED_LANGUAGES.find(
      (lang) => lang.code === i18n.language
    ) || SUPPORTED_LANGUAGES.find(
      (lang) => lang.code.startsWith(i18n.language.split('_')[0])
    ) || SUPPORTED_LANGUAGES[0];
  });
  const buttonRef = useRef<HTMLButtonElement>(null);

  // 监听语言变化
  useEffect(() => {
    const newCurrentLanguage = SUPPORTED_LANGUAGES.find(
      (lang) => lang.code === i18n.language
    ) || SUPPORTED_LANGUAGES.find(
      (lang) => lang.code.startsWith(i18n.language.split('_')[0])
    ) || SUPPORTED_LANGUAGES[0];

    setCurrentLanguage(newCurrentLanguage);
  }, [i18n.language]);

  // 处理菜单打开/关闭
  const handleMenuToggle: MouseEventHandler<HTMLButtonElement> = (evt) => {
    evt.stopPropagation();
    setIsOpen(!isOpen);
  };

  // 处理语言选择
  const handleLanguageSelect = (languageCode: string) => {
    setIsOpen(false);
    i18n.changeLanguage(languageCode).catch((error) => {
      console.error('Language change failed:', error);
    });
  };

  // 处理点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <Box style={{ position: 'relative' }}>
      <Button
        ref={buttonRef}
        size="300"
        variant="Primary"
        outlined
        fill="Soft"
        radii="300"
        disabled={disabled}
        onClick={handleMenuToggle}
        onMouseDown={(e) => e.stopPropagation()}
        after={<Icon size="300" src={Icons.ChevronBottom} />}
      >
        <Text size="T300">{currentLanguage.nativeName}</Text>
      </Button>

      {isOpen && (
        <Box
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            marginTop: '4px',
          }}
        >
          <Menu>
            <Box direction="Column" gap="100" style={{ padding: config.space.S100 }}>
              {SUPPORTED_LANGUAGES.map((language) => (
                <MenuItem
                  key={language.code}
                  size="300"
                  variant={language.code === currentLanguage.code ? 'Primary' : 'Surface'}
                  radii="300"
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleLanguageSelect(language.code);
                  }}
                >
                  <Text size="T300">{language.nativeName}</Text>
                </MenuItem>
              ))}
            </Box>
          </Menu>
        </Box>
      )}
    </Box>
  );
}

type ThemeSelectorProps = {
  themeNames: Record<string, string>;
  themes: Theme[];
  selected: Theme;
  onSelect: (theme: Theme) => void;
};
const ThemeSelector = as<'div', ThemeSelectorProps>(
  ({ themeNames, themes, selected, onSelect, ...props }, ref) => (
    <Menu {...props} ref={ref}>
      <Box direction="Column" gap="100" style={{ padding: config.space.S100 }}>
        {themes.map((theme) => (
          <MenuItem
            key={theme.id}
            size="300"
            variant={theme.id === selected.id ? 'Primary' : 'Surface'}
            radii="300"
            onClick={() => onSelect(theme)}
          >
            <Text size="T300">{themeNames[theme.id] ?? theme.id}</Text>
          </MenuItem>
        ))}
      </Box>
    </Menu>
  )
);

function SelectTheme({ disabled }: { disabled?: boolean }) {
  const themes = useThemes();
  const themeNames = useThemeNames();
  const [themeId, setThemeId] = useSetting(settingsAtom, 'themeId');
  const [menuCords, setMenuCords] = useState<RectCords>();
  const selectedTheme = themes.find((theme) => theme.id === themeId) ?? LightTheme;

  const handleThemeMenu: MouseEventHandler<HTMLButtonElement> = (evt) => {
    setMenuCords(evt.currentTarget.getBoundingClientRect());
  };

  const handleThemeSelect = (theme: Theme) => {
    setThemeId(theme.id);
    setMenuCords(undefined);
  };

  return (
    <>
      <Button
        size="300"
        variant="Primary"
        outlined
        fill="Soft"
        radii="300"
        after={<Icon size="300" src={Icons.ChevronBottom} />}
        onClick={disabled ? undefined : handleThemeMenu}
        aria-disabled={disabled}
      >
        <Text size="T300">{themeNames[selectedTheme.id] ?? selectedTheme.id}</Text>
      </Button>
      <PopOut
        anchor={menuCords}
        offset={5}
        position="Bottom"
        align="End"
        content={
          <FocusTrap
            focusTrapOptions={{
              initialFocus: false,
              onDeactivate: () => setMenuCords(undefined),
              clickOutsideDeactivates: true,
              isKeyForward: (evt: KeyboardEvent) =>
                evt.key === 'ArrowDown' || evt.key === 'ArrowRight',
              isKeyBackward: (evt: KeyboardEvent) =>
                evt.key === 'ArrowUp' || evt.key === 'ArrowLeft',
              escapeDeactivates: stopPropagation,
            }}
          >
            <ThemeSelector
              themeNames={themeNames}
              themes={themes}
              selected={selectedTheme}
              onSelect={handleThemeSelect}
            />
          </FocusTrap>
        }
      />
    </>
  );
}

function SystemThemePreferences() {
  const { t } = useTranslation();
  const themeKind = useSystemThemeKind();
  const themeNames = useThemeNames();
  const themes = useThemes();
  const [lightThemeId, setLightThemeId] = useSetting(settingsAtom, 'lightThemeId');
  const [darkThemeId, setDarkThemeId] = useSetting(settingsAtom, 'darkThemeId');

  const lightThemes = themes.filter((theme) => theme.kind === ThemeKind.Light);
  const darkThemes = themes.filter((theme) => theme.kind === ThemeKind.Dark);

  const selectedLightTheme = lightThemes.find((theme) => theme.id === lightThemeId) ?? LightTheme;
  const selectedDarkTheme = darkThemes.find((theme) => theme.id === darkThemeId) ?? DarkTheme;

  const [ltCords, setLTCords] = useState<RectCords>();
  const [dtCords, setDTCords] = useState<RectCords>();

  const handleLightThemeMenu: MouseEventHandler<HTMLButtonElement> = (evt) => {
    setLTCords(evt.currentTarget.getBoundingClientRect());
  };
  const handleDarkThemeMenu: MouseEventHandler<HTMLButtonElement> = (evt) => {
    setDTCords(evt.currentTarget.getBoundingClientRect());
  };

  const handleLightThemeSelect = (theme: Theme) => {
    setLightThemeId(theme.id);
    setLTCords(undefined);
  };

  const handleDarkThemeSelect = (theme: Theme) => {
    setDarkThemeId(theme.id);
    setDTCords(undefined);
  };

  return (
    <Box wrap="Wrap" gap="400">
      <SettingTile
        title={t('settings.appearance.lightThemeTitle')}
        after={
          <Chip
            variant={themeKind === ThemeKind.Light ? 'Primary' : 'Secondary'}
            outlined={themeKind === ThemeKind.Light}
            radii="Pill"
            after={<Icon size="200" src={Icons.ChevronBottom} />}
            onClick={handleLightThemeMenu}
          >
            <Text size="B300">{themeNames[selectedLightTheme.id] ?? selectedLightTheme.id}</Text>
          </Chip>
        }
      />
      <PopOut
        anchor={ltCords}
        offset={5}
        position="Bottom"
        align="End"
        content={
          <FocusTrap
            focusTrapOptions={{
              initialFocus: false,
              onDeactivate: () => setLTCords(undefined),
              clickOutsideDeactivates: true,
              isKeyForward: (evt: KeyboardEvent) =>
                evt.key === 'ArrowDown' || evt.key === 'ArrowRight',
              isKeyBackward: (evt: KeyboardEvent) =>
                evt.key === 'ArrowUp' || evt.key === 'ArrowLeft',
              escapeDeactivates: stopPropagation,
            }}
          >
            <ThemeSelector
              themeNames={themeNames}
              themes={lightThemes}
              selected={selectedLightTheme}
              onSelect={handleLightThemeSelect}
            />
          </FocusTrap>
        }
      />
      <SettingTile
        title={t('settings.appearance.darkThemeTitle')}
        after={
          <Chip
            variant={themeKind === ThemeKind.Dark ? 'Primary' : 'Secondary'}
            outlined={themeKind === ThemeKind.Dark}
            radii="Pill"
            after={<Icon size="200" src={Icons.ChevronBottom} />}
            onClick={handleDarkThemeMenu}
          >
            <Text size="B300">{themeNames[selectedDarkTheme.id] ?? selectedDarkTheme.id}</Text>
          </Chip>
        }
      />
      <PopOut
        anchor={dtCords}
        offset={5}
        position="Bottom"
        align="End"
        content={
          <FocusTrap
            focusTrapOptions={{
              initialFocus: false,
              onDeactivate: () => setDTCords(undefined),
              clickOutsideDeactivates: true,
              isKeyForward: (evt: KeyboardEvent) =>
                evt.key === 'ArrowDown' || evt.key === 'ArrowRight',
              isKeyBackward: (evt: KeyboardEvent) =>
                evt.key === 'ArrowUp' || evt.key === 'ArrowLeft',
              escapeDeactivates: stopPropagation,
            }}
          >
            <ThemeSelector
              themeNames={themeNames}
              themes={darkThemes}
              selected={selectedDarkTheme}
              onSelect={handleDarkThemeSelect}
            />
          </FocusTrap>
        }
      />
    </Box>
  );
}

function PageZoomInput() {
  const [pageZoom, setPageZoom] = useSetting(settingsAtom, 'pageZoom');
  const [currentZoom, setCurrentZoom] = useState(`${pageZoom}`);

  const handleZoomChange: ChangeEventHandler<HTMLInputElement> = (evt) => {
    setCurrentZoom(evt.target.value);
  };

  const handleZoomEnter: KeyboardEventHandler<HTMLInputElement> = (evt) => {
    if (isKeyHotkey('escape', evt)) {
      evt.stopPropagation();
      setCurrentZoom(pageZoom.toString());
    }
    if (
      isKeyHotkey('enter', evt) &&
      'value' in evt.target &&
      typeof evt.target.value === 'string'
    ) {
      const newZoom = parseInt(evt.target.value, 10);
      if (Number.isNaN(newZoom)) return;
      const safeZoom = Math.max(Math.min(newZoom, 150), 75);
      setPageZoom(safeZoom);
      setCurrentZoom(safeZoom.toString());
    }
  };

  return (
    <Input
      style={{ width: toRem(100) }}
      variant={pageZoom === parseInt(currentZoom, 10) ? 'Secondary' : 'Success'}
      size="300"
      radii="300"
      type="number"
      min="75"
      max="150"
      value={currentZoom}
      onChange={handleZoomChange}
      onKeyDown={handleZoomEnter}
      after={<Text size="T300">%</Text>}
      outlined
    />
  );
}

function Appearance() {
  const { t } = useTranslation();
  const [systemTheme, setSystemTheme] = useSetting(settingsAtom, 'useSystemTheme');
  const [twitterEmoji, setTwitterEmoji] = useSetting(settingsAtom, 'twitterEmoji');

  return (
    <Box direction="Column" gap="100">
      <Text size="L400">{t('settings.appearance.title')}</Text>

      <SequenceCard className={SequenceCardStyle} variant="SurfaceVariant" direction="Column">
        <SettingTile
          title={t('settings.general.language')}
          description={t('settings.general.languageDescription')}
          after={<LanguageSelector />}
        />
      </SequenceCard>

      <SequenceCard
        className={SequenceCardStyle}
        variant="SurfaceVariant"
        direction="Column"
        gap="400"
      >
        <SettingTile
          title={t('settings.appearance.systemTheme.title')}
          description={t('settings.appearance.systemTheme.description')}
          after={<Switch variant="Primary" value={systemTheme} onChange={setSystemTheme} />}
        />
        {systemTheme && <SystemThemePreferences />}
      </SequenceCard>

      <SequenceCard className={SequenceCardStyle} variant="SurfaceVariant" direction="Column">
        <SettingTile
          title={t('settings.appearance.theme.title')}
          description={t('settings.appearance.theme.description')}
          after={<SelectTheme disabled={systemTheme} />}
        />
      </SequenceCard>

      <SequenceCard className={SequenceCardStyle} variant="SurfaceVariant" direction="Column">
        <SettingTile
          title={t('settings.appearance.twitterEmoji.title')}
          after={<Switch variant="Primary" value={twitterEmoji} onChange={setTwitterEmoji} />}
        />
      </SequenceCard>

      <SequenceCard className={SequenceCardStyle} variant="SurfaceVariant" direction="Column">
        <SettingTile title={t('settings.appearance.pageZoom.title')} after={<PageZoomInput />} />
      </SequenceCard>
    </Box>
  );
}

type DateHintProps = {
  hasChanges: boolean;
  handleReset: () => void;
};
function DateHint({ hasChanges, handleReset }: DateHintProps) {
  const { t } = useTranslation();
  const [anchor, setAnchor] = useState<RectCords>();
  const categoryPadding = { padding: config.space.S200, paddingTop: 0 };

  const handleOpenMenu: MouseEventHandler<HTMLElement> = (evt) => {
    setAnchor(evt.currentTarget.getBoundingClientRect());
  };
  return (
    <PopOut
      anchor={anchor}
      position="Top"
      align="End"
      content={
        <FocusTrap
          focusTrapOptions={{
            initialFocus: false,
            onDeactivate: () => setAnchor(undefined),
            clickOutsideDeactivates: true,
            escapeDeactivates: stopPropagation,
          }}
        >
          <Menu style={{ maxHeight: '85vh', overflowY: 'auto' }}>
            <Header size="300" style={{ padding: `0 ${config.space.S200}` }}>
              <Text size="L400">{t('settings.dateAndTime.formatting')}</Text>
            </Header>

            <Box direction="Column">
              <Box style={categoryPadding} direction="Column">
                <Header size="300">
                  <Text size="L400">{t('settings.dateAndTime.year')}</Text>
                </Header>
                <Box direction="Column" tabIndex={0} gap="100">
                  <Text size="T300">
                    YY
                    <Text as="span" size="Inherit" priority="300">
                      {': '}
                      {t('settings.dateAndTime.twoDigitYear')}
                    </Text>{' '}
                  </Text>
                  <Text size="T300">
                    YYYY
                    <Text as="span" size="Inherit" priority="300">
                      {': '}{t('settings.dateAndTime.fourDigitYear')}
                    </Text>
                  </Text>
                </Box>
              </Box>

              <Box style={categoryPadding} direction="Column">
                <Header size="300">
                  <Text size="L400">{t('settings.dateAndTime.month')}</Text>
                </Header>
                <Box direction="Column" tabIndex={0} gap="100">
                  <Text size="T300">
                    M
                    <Text as="span" size="Inherit" priority="300">
                      {': '}{t('settings.dateAndTime.theMonth')}
                    </Text>
                  </Text>
                  <Text size="T300">
                    MM
                    <Text as="span" size="Inherit" priority="300">
                      {': '}{t('settings.dateAndTime.twoDigitMonth')}
                    </Text>{' '}
                  </Text>
                  <Text size="T300">
                    MMM
                    <Text as="span" size="Inherit" priority="300">
                      {': '}{t('settings.dateAndTime.shortMonthName')}
                    </Text>
                  </Text>
                  <Text size="T300">
                    MMMM
                    <Text as="span" size="Inherit" priority="300">
                      {': '}{t('settings.dateAndTime.fullMonthName')}
                    </Text>
                  </Text>
                </Box>
              </Box>

              <Box style={categoryPadding} direction="Column">
                <Header size="300">
                  <Text size="L400">{t('settings.dateAndTime.dayOfMonth')}</Text>
                </Header>
                <Box direction="Column" tabIndex={0} gap="100">
                  <Text size="T300">
                    D
                    <Text as="span" size="Inherit" priority="300">
                      {': '}{t('settings.dateAndTime.dayOfMonthDesc')}
                    </Text>
                  </Text>
                  <Text size="T300">
                    DD
                    <Text as="span" size="Inherit" priority="300">
                      {': '}{t('settings.dateAndTime.twoDigitDayOfMonth')}
                    </Text>
                  </Text>
                </Box>
              </Box>
              <Box style={categoryPadding} direction="Column">
                <Header size="300">
                  <Text size="L400">{t('settings.dateAndTime.dayOfWeek')}</Text>
                </Header>
                <Box direction="Column" tabIndex={0} gap="100">
                  <Text size="T300">
                    d
                    <Text as="span" size="Inherit" priority="300">
                      {': '}{t('settings.dateAndTime.dayOfWeekDesc')}
                    </Text>
                  </Text>
                  <Text size="T300">
                    dd
                    <Text as="span" size="Inherit" priority="300">
                      {': '}{t('settings.dateAndTime.twoLetterDayName')}
                    </Text>
                  </Text>
                  <Text size="T300">
                    ddd
                    <Text as="span" size="Inherit" priority="300">
                      {': '}{t('settings.dateAndTime.shortDayName')}
                    </Text>
                  </Text>
                  <Text size="T300">
                    dddd
                    <Text as="span" size="Inherit" priority="300">
                      {': '}{t('settings.dateAndTime.fullDayName')}
                    </Text>
                  </Text>
                </Box>
              </Box>
            </Box>
          </Menu>
        </FocusTrap>
      }
    >
      {hasChanges ? (
        <IconButton
          tabIndex={-1}
          onClick={handleReset}
          type="reset"
          variant="Secondary"
          size="300"
          radii="300"
        >
          <Icon src={Icons.Cross} size="100" />
        </IconButton>
      ) : (
        <IconButton
          tabIndex={-1}
          onClick={handleOpenMenu}
          type="button"
          variant="Secondary"
          size="300"
          radii="300"
          aria-pressed={!!anchor}
        >
          <Icon style={{ opacity: config.opacity.P300 }} size="100" src={Icons.Info} />
        </IconButton>
      )}
    </PopOut>
  );
}

type CustomDateFormatProps = {
  value: string;
  onChange: (format: string) => void;
};
function CustomDateFormat({ value, onChange }: CustomDateFormatProps) {
  const { t } = useTranslation();
  const [dateFormatCustom, setDateFormatCustom] = useState(value);

  useEffect(() => {
    setDateFormatCustom(value);
  }, [value]);

  const handleChange: ChangeEventHandler<HTMLInputElement> = (evt) => {
    const format = evt.currentTarget.value;
    setDateFormatCustom(format);
  };

  const handleReset = () => {
    setDateFormatCustom(value);
  };

  const handleSubmit: FormEventHandler<HTMLFormElement> = (evt) => {
    evt.preventDefault();

    const target = evt.target as HTMLFormElement | undefined;
    const customDateFormatInput = target?.customDateFormatInput as HTMLInputElement | undefined;
    const format = customDateFormatInput?.value;
    if (!format) return;

    onChange(format);
  };

  const hasChanges = dateFormatCustom !== value;
  return (
    <SettingTile>
      <Box as="form" onSubmit={handleSubmit} gap="200">
        <Box grow="Yes" direction="Column">
          <Input
            required
            name="customDateFormatInput"
            value={dateFormatCustom}
            onChange={handleChange}
            maxLength={16}
            autoComplete="off"
            variant="Secondary"
            radii="300"
            style={{ paddingRight: config.space.S200 }}
            after={<DateHint hasChanges={hasChanges} handleReset={handleReset} />}
          />
        </Box>
        <Button
          size="400"
          variant={hasChanges ? 'Success' : 'Secondary'}
          fill={hasChanges ? 'Solid' : 'Soft'}
          outlined
          radii="300"
          disabled={!hasChanges}
          type="submit"
        >
          <Text size="B400">{t('common.save')}</Text>
        </Button>
      </Box>
    </SettingTile>
  );
}

type PresetDateFormatProps = {
  value: string;
  onChange: (format: string) => void;
};
function PresetDateFormat({ value, onChange }: PresetDateFormatProps) {
  const [menuCords, setMenuCords] = useState<RectCords>();
  const dateFormatItems = useDateFormatItems();

  const { t } = useTranslation();
  const getDisplayDate = (format: string): string =>
    format !== '' ? dayjs().format(format) : t('settings.dateAndTime.custom');

  const handleMenu: MouseEventHandler<HTMLButtonElement> = (evt) => {
    setMenuCords(evt.currentTarget.getBoundingClientRect());
  };

  const handleSelect = (format: DateFormat) => {
    onChange(format);
    setMenuCords(undefined);
  };

  return (
    <>
      <Button
        size="300"
        variant="Secondary"
        outlined
        fill="Soft"
        radii="300"
        after={<Icon size="300" src={Icons.ChevronBottom} />}
        onClick={handleMenu}
      >
        <Text size="T300">
          {getDisplayDate(dateFormatItems.find((i) => i.format === value)?.format ?? value)}
        </Text>
      </Button>
      <PopOut
        anchor={menuCords}
        offset={5}
        position="Bottom"
        align="End"
        content={
          <FocusTrap
            focusTrapOptions={{
              initialFocus: false,
              onDeactivate: () => setMenuCords(undefined),
              clickOutsideDeactivates: true,
              isKeyForward: (evt: KeyboardEvent) =>
                evt.key === 'ArrowDown' || evt.key === 'ArrowRight',
              isKeyBackward: (evt: KeyboardEvent) =>
                evt.key === 'ArrowUp' || evt.key === 'ArrowLeft',
              escapeDeactivates: stopPropagation,
            }}
          >
            <Menu>
              <Box direction="Column" gap="100" style={{ padding: config.space.S100 }}>
                {dateFormatItems.map((item) => (
                  <MenuItem
                    key={item.format}
                    size="300"
                    variant={value === item.format ? 'Primary' : 'Surface'}
                    radii="300"
                    onClick={() => handleSelect(item.format)}
                  >
                    <Text size="T300">{getDisplayDate(item.format)}</Text>
                  </MenuItem>
                ))}
              </Box>
            </Menu>
          </FocusTrap>
        }
      />
    </>
  );
}

function SelectDateFormat() {
  const { t } = useTranslation();
  const [dateFormatString, setDateFormatString] = useSetting(settingsAtom, 'dateFormatString');
  const [selectedDateFormat, setSelectedDateFormat] = useState(dateFormatString);
  const customDateFormat = selectedDateFormat === '';

  const handlePresetChange = (format: string) => {
    setSelectedDateFormat(format);
    if (format !== '') {
      setDateFormatString(format);
    }
  };

  return (
    <>
      <SettingTile
        title={t('settings.dateAndTime.dateFormat')}
        description={customDateFormat ? dayjs().format(dateFormatString) : ''}
        after={<PresetDateFormat value={selectedDateFormat} onChange={handlePresetChange} />}
      />
      {customDateFormat && (
        <CustomDateFormat value={dateFormatString} onChange={setDateFormatString} />
      )}
    </>
  );
}

function DateAndTime() {
  const { t } = useTranslation();
  const [hour24Clock, setHour24Clock] = useSetting(settingsAtom, 'hour24Clock');

  return (
    <Box direction="Column" gap="100">
      <Text size="L400">{t('settings.dateAndTime.title')}</Text>
      <SequenceCard className={SequenceCardStyle} variant="SurfaceVariant" direction="Column">
        <SettingTile
          title={t('settings.dateAndTime.hour24Format')}
          after={<Switch variant="Primary" value={hour24Clock} onChange={setHour24Clock} />}
        />
      </SequenceCard>

      <SequenceCard className={SequenceCardStyle} variant="SurfaceVariant" direction="Column">
        <SelectDateFormat />
      </SequenceCard>
    </Box>
  );
}

function Editor() {
  const { t } = useTranslation();
  const [enterForNewline, setEnterForNewline] = useSetting(settingsAtom, 'enterForNewline');
  const [isMarkdown, setIsMarkdown] = useSetting(settingsAtom, 'isMarkdown');
  const [hideActivity, setHideActivity] = useSetting(settingsAtom, 'hideActivity');

  return (
    <Box direction="Column" gap="100">
      <Text size="L400">{t('settings.editor.title')}</Text>
      <SequenceCard className={SequenceCardStyle} variant="SurfaceVariant" direction="Column">
        <SettingTile
          title={t('settings.editor.enterForNewline')}
          description={t('settings.editor.enterForNewlineDescription', {
            key: isMacOS() ? KeySymbol.Command : 'Ctrl'
          })}
          after={<Switch variant="Primary" value={enterForNewline} onChange={setEnterForNewline} />}
        />
      </SequenceCard>
      <SequenceCard className={SequenceCardStyle} variant="SurfaceVariant" direction="Column">
        <SettingTile
          title={t('settings.editor.markdownFormatting')}
          after={<Switch variant="Primary" value={isMarkdown} onChange={setIsMarkdown} />}
        />
      </SequenceCard>
      <SequenceCard className={SequenceCardStyle} variant="SurfaceVariant" direction="Column">
        <SettingTile
          title={t('settings.editor.hideTypingReadReceipts')}
          description={t('settings.editor.hideTypingReadReceiptsDescription')}
          after={<Switch variant="Primary" value={hideActivity} onChange={setHideActivity} />}
        />
      </SequenceCard>
    </Box>
  );
}

function SelectMessageLayout() {
  const [menuCords, setMenuCords] = useState<RectCords>();
  const [messageLayout, setMessageLayout] = useSetting(settingsAtom, 'messageLayout');
  const messageLayoutItems = useMessageLayoutItems();

  const handleMenu: MouseEventHandler<HTMLButtonElement> = (evt) => {
    setMenuCords(evt.currentTarget.getBoundingClientRect());
  };

  const handleSelect = (layout: MessageLayout) => {
    setMessageLayout(layout);
    setMenuCords(undefined);
  };

  return (
    <>
      <Button
        size="300"
        variant="Secondary"
        outlined
        fill="Soft"
        radii="300"
        after={<Icon size="300" src={Icons.ChevronBottom} />}
        onClick={handleMenu}
      >
        <Text size="T300">
          {messageLayoutItems.find((i) => i.layout === messageLayout)?.name ?? messageLayout}
        </Text>
      </Button>
      <PopOut
        anchor={menuCords}
        offset={5}
        position="Bottom"
        align="End"
        content={
          <FocusTrap
            focusTrapOptions={{
              initialFocus: false,
              onDeactivate: () => setMenuCords(undefined),
              clickOutsideDeactivates: true,
              isKeyForward: (evt: KeyboardEvent) =>
                evt.key === 'ArrowDown' || evt.key === 'ArrowRight',
              isKeyBackward: (evt: KeyboardEvent) =>
                evt.key === 'ArrowUp' || evt.key === 'ArrowLeft',
              escapeDeactivates: stopPropagation,
            }}
          >
            <Menu>
              <Box direction="Column" gap="100" style={{ padding: config.space.S100 }}>
                {messageLayoutItems.map((item) => (
                  <MenuItem
                    key={item.layout}
                    size="300"
                    variant={messageLayout === item.layout ? 'Primary' : 'Surface'}
                    radii="300"
                    onClick={() => handleSelect(item.layout)}
                  >
                    <Text size="T300">{item.name}</Text>
                  </MenuItem>
                ))}
              </Box>
            </Menu>
          </FocusTrap>
        }
      />
    </>
  );
}

function SelectMessageSpacing() {
  const [menuCords, setMenuCords] = useState<RectCords>();
  const [messageSpacing, setMessageSpacing] = useSetting(settingsAtom, 'messageSpacing');
  const messageSpacingItems = useMessageSpacingItems();

  const handleMenu: MouseEventHandler<HTMLButtonElement> = (evt) => {
    setMenuCords(evt.currentTarget.getBoundingClientRect());
  };

  const handleSelect = (layout: MessageSpacing) => {
    setMessageSpacing(layout);
    setMenuCords(undefined);
  };

  return (
    <>
      <Button
        size="300"
        variant="Secondary"
        outlined
        fill="Soft"
        radii="300"
        after={<Icon size="300" src={Icons.ChevronBottom} />}
        onClick={handleMenu}
      >
        <Text size="T300">
          {messageSpacingItems.find((i) => i.spacing === messageSpacing)?.name ?? messageSpacing}
        </Text>
      </Button>
      <PopOut
        anchor={menuCords}
        offset={5}
        position="Bottom"
        align="End"
        content={
          <FocusTrap
            focusTrapOptions={{
              initialFocus: false,
              onDeactivate: () => setMenuCords(undefined),
              clickOutsideDeactivates: true,
              isKeyForward: (evt: KeyboardEvent) =>
                evt.key === 'ArrowDown' || evt.key === 'ArrowRight',
              isKeyBackward: (evt: KeyboardEvent) =>
                evt.key === 'ArrowUp' || evt.key === 'ArrowLeft',
              escapeDeactivates: stopPropagation,
            }}
          >
            <Menu>
              <Box direction="Column" gap="100" style={{ padding: config.space.S100 }}>
                {messageSpacingItems.map((item) => (
                  <MenuItem
                    key={item.spacing}
                    size="300"
                    variant={messageSpacing === item.spacing ? 'Primary' : 'Surface'}
                    radii="300"
                    onClick={() => handleSelect(item.spacing)}
                  >
                    <Text size="T300">{item.name}</Text>
                  </MenuItem>
                ))}
              </Box>
            </Menu>
          </FocusTrap>
        }
      />
    </>
  );
}

function Messages() {
  const { t } = useTranslation();
  const [legacyUsernameColor, setLegacyUsernameColor] = useSetting(
    settingsAtom,
    'legacyUsernameColor'
  );
  const [hideMembershipEvents, setHideMembershipEvents] = useSetting(
    settingsAtom,
    'hideMembershipEvents'
  );
  const [hideNickAvatarEvents, setHideNickAvatarEvents] = useSetting(
    settingsAtom,
    'hideNickAvatarEvents'
  );
  const [mediaAutoLoad, setMediaAutoLoad] = useSetting(settingsAtom, 'mediaAutoLoad');
  const [urlPreview, setUrlPreview] = useSetting(settingsAtom, 'urlPreview');
  const [encUrlPreview, setEncUrlPreview] = useSetting(settingsAtom, 'encUrlPreview');
  const [showHiddenEvents, setShowHiddenEvents] = useSetting(settingsAtom, 'showHiddenEvents');

  return (
    <Box direction="Column" gap="100">
      <Text size="L400">{t('settings.messages.title')}</Text>
      <SequenceCard className={SequenceCardStyle} variant="SurfaceVariant" direction="Column">
        <SettingTile title={t('settings.messages.messageLayout')} after={<SelectMessageLayout />} />
      </SequenceCard>
      <SequenceCard className={SequenceCardStyle} variant="SurfaceVariant" direction="Column">
        <SettingTile title={t('settings.messages.messageSpacing')} after={<SelectMessageSpacing />} />
      </SequenceCard>
      <SequenceCard className={SequenceCardStyle} variant="SurfaceVariant" direction="Column">
        <SettingTile
          title={t('settings.messages.legacyUsernameColor')}
          after={
            <Switch
              variant="Primary"
              value={legacyUsernameColor}
              onChange={setLegacyUsernameColor}
            />
          }
        />
      </SequenceCard>
      <SequenceCard className={SequenceCardStyle} variant="SurfaceVariant" direction="Column">
        <SettingTile
          title={t('settings.messages.hideMembershipChange')}
          after={
            <Switch
              variant="Primary"
              value={hideMembershipEvents}
              onChange={setHideMembershipEvents}
            />
          }
        />
      </SequenceCard>
      <SequenceCard className={SequenceCardStyle} variant="SurfaceVariant" direction="Column">
        <SettingTile
          title={t('settings.messages.hideProfileChange')}
          after={
            <Switch
              variant="Primary"
              value={hideNickAvatarEvents}
              onChange={setHideNickAvatarEvents}
            />
          }
        />
      </SequenceCard>
      <SequenceCard className={SequenceCardStyle} variant="SurfaceVariant" direction="Column">
        <SettingTile
          title={t('settings.messages.disableMediaAutoLoad')}
          after={
            <Switch
              variant="Primary"
              value={!mediaAutoLoad}
              onChange={(v) => setMediaAutoLoad(!v)}
            />
          }
        />
      </SequenceCard>
      <SequenceCard className={SequenceCardStyle} variant="SurfaceVariant" direction="Column">
        <SettingTile
          title={t('settings.messages.urlPreview')}
          after={<Switch variant="Primary" value={urlPreview} onChange={setUrlPreview} />}
        />
      </SequenceCard>
      <SequenceCard className={SequenceCardStyle} variant="SurfaceVariant" direction="Column">
        <SettingTile
          title={t('settings.messages.urlPreviewEncrypted')}
          after={<Switch variant="Primary" value={encUrlPreview} onChange={setEncUrlPreview} />}
        />
      </SequenceCard>
      <SequenceCard className={SequenceCardStyle} variant="SurfaceVariant" direction="Column">
        <SettingTile
          title={t('settings.messages.showHiddenEvents')}
          after={
            <Switch variant="Primary" value={showHiddenEvents} onChange={setShowHiddenEvents} />
          }
        />
      </SequenceCard>
    </Box>
  );
}

type GeneralProps = {
  requestClose: () => void;
};
export function General({ requestClose }: GeneralProps) {
  const { t } = useTranslation();
  return (
    <Page>
      <PageHeader outlined={false}>
        <Box grow="Yes" gap="200">
          <Box grow="Yes" alignItems="Center" gap="200">
            <Text size="H3" truncate>
              {t('settings.general.title')}
            </Text>
          </Box>
          <Box shrink="No">
            <IconButton onClick={requestClose} variant="Surface">
              <Icon src={Icons.Cross} />
            </IconButton>
          </Box>
        </Box>
      </PageHeader>
      <Box grow="Yes">
        <Scroll hideTrack visibility="Hover">
          <PageContent>
            <Box direction="Column" gap="700">
              <Appearance />
              <DateAndTime />
              <Editor />
              <Messages />
            </Box>
          </PageContent>
        </Scroll>
      </Box>
    </Page>
  );
}
