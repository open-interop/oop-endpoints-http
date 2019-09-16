const mustache = require("mustache");

const advancedTemplate = require("./advancedTemplate");

module.exports = (message, template) => {
    var render = val => {
        if (typeof val === "undefined") {
            return "";
        }

        return mustache.render(String(val), message);
    };

    let applyRecursive = async (object, func) => {
        var ret;

        if (Array.isArray(object)) {
            ret = [];

            for (const val of object) {
                ret.push(await applyRecursive(val));
            }
        } else if (typeof object === "object") {
            if ("language" in object && "script" in object) {
                ret = await advancedTemplate(message, object);

                if (typeof ret !== "string") {
                    ret = JSON.stringify(ret);
                }
            } else {
                ret = {};

                for (const [ key, val ] of Object.entries(object)) {
                    ret[key] = await applyRecursive(val);
                }
            }
        } else {
            ret = render(object);
        }

        return ret;
    };

    return applyRecursive(template);
};
