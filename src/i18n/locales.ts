export const LOCALES = {
  en: {
    'ribbon.tooltip': 'On this day',
    'command.name': 'Show Notes from This Day in History',
    'modal.title': 'Notes from This Day in History',
    'notice.no_notes': 'No historical notes found for today',
    'note.created_at': 'Created at: ',
    'settings.title': 'Settings',
    'settings.language.name': 'Language',
    'settings.language.desc': 'Choose display language',
    'settings.searchFolder.name': 'Search folder',
    'settings.searchFolder.desc': 'Choose the folder to search (root directory by default)',
    'settings.searchFolder.placeholder': '/',
    'settings.language.auto': 'Auto',
    'notice.daily_reminder': 'Today is a historical day, do you want to see the notes?',
  },
  'zh-CN': {
    'ribbon.tooltip': '历史上的今天',
    'command.name': '显示历史上的今天的笔记',
    'modal.title': '历史上的今天',
    'notice.no_notes': '没有找到历史上今天的笔记',
    'note.created_at': '创建于: ',
    'settings.title': '设置',
    'settings.language.name': '语言',
    'settings.language.desc': '选择显示语言',
    'settings.searchFolder.name': '搜索文件夹',
    'settings.searchFolder.desc': '选择要搜索的文件夹（默认为根目录）',
    'settings.searchFolder.placeholder': '/',
    'settings.language.auto': '自动',
    'notice.daily_reminder': '今天是个特别的日子，要查看历史上的今天的笔记吗？',
  },
} as const;

export type LocaleKey = keyof typeof LOCALES;
export type TranslationKey = keyof (typeof LOCALES)['en'];
