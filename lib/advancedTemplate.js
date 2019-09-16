const ivm = require("isolated-vm");

module.exports = async (message, template) => {
    if (template.language !== "js") {
        throw new Error("Only 'js' is supported as a language.");
    }

    isolate = new ivm.Isolate();

    var context = await isolate.createContext();
    await context.global.set("_message", new ivm.Reference(message));

    let bootstrap = await isolate.compileScript("new " + function() {
        message = _message.copySync();

        delete _message;

        module = { exports: null };
    });

    await bootstrap.run(context);

    let script = await isolate.compileScript(template.script);
    let res = await script.run(context, {release: true, timeout: 5000});
    let module = await context.global.getSync("module").copy();

    context.release();
    isolate.dispose();

    return module.exports;
};
