import test from "ava";

var advancedTemplate = require("./advancedTemplate");

test("script execution", t => {
    t.plan(1);

    let message = {"test": "foo"};
    let template = {
        "language": "js",
        "script": 'module.exports = message.test + "bar";'
    };

    return advancedTemplate(message, template)
        .then(res => {
            t.is(res, "foobar");
        });
});

test("unsported language rejected", async t => {
    t.plan(1);

    let message = {"test": "foo"};
    let template = {
        "language": "lua",
        "script": '1 + 1;'
    };

    await t.throwsAsync(() => advancedTemplate(message, template));
});
