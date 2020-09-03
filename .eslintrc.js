module.exports = {
    env: {
        commonjs: true,
        es6: true,
    },
    extends: ["standard", "prettier", "prettier/standard"],
    globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly"
    },
    parserOptions: {
        ecmaVersion: 2018
    },
    plugins: ["prettier", "ava"],
    rules: {
        indent: ["error", 4, {"SwitchCase": 1}],
        curly: ["error", "all"],
        "standard/no-callback-literal": "off",
        "prettier/prettier": "error",
        "linebreak-style": ["error", "unix"],
        "new-cap": ["error", { "newIsCapExceptionPattern": "^winston\.." }]
    }
};
