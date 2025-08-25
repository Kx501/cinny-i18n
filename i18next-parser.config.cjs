module.exports = {
    locales: ['en', 'zh-CN', 'de'],
    defaultNamespace: 'features',
    namespaceSeparator: ':',
    keySeparator: '.',
    input: ['src/**/*.{ts,tsx,js,jsx}'],
    output: 'public/locales/$LOCALE/$NAMESPACE.json',
    createOldCatalogs: false,
    keepRemoved: true,
    sort: true,
    lexers: {
        js: ['JsxLexer', 'JavascriptLexer'],
        jsx: ['JsxLexer'],
        ts: ['JsxLexer', 'TypescriptLexer'],
        tsx: ['JsxLexer'],
    },
    func: {
        list: ['t', 'i18n.t'],
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
    },
    trans: {
        component: 'Trans',
        i18nKey: 'i18nKey',
        defaultsKey: 'defaults',
        fallbackKey: false,
    },
    pluralSeparator: '_',
    contextSeparator: '_',
    interpolation: { prefix: '{{', suffix: '}}' },
};


