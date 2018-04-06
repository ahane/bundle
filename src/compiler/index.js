const path = require('path');
const glob = require('glob');
const compileScripts = require('./scripts');
const compileStyles = require('./styles');

/**
 * Compile anything
 * @param options
 */
function compile(options) {

  let {sources, cwd, watch} = options;

  let scripts = [];
  let styles = [];

  cwd = path.resolve(cwd);

  sources.forEach((source) => {

    source = path.resolve(cwd, source);

    const files = glob.hasMagic(source) ? glob.sync(source): [source];

    files.forEach((file)=> {

      const {ext} = path.parse(file);
      const relativePath = path.relative(cwd, file)

      if(ext === '.jsx' || ext === '.js') {

        return scripts.push(relativePath);
      }

      if(ext === '.styl') {

        return styles.push(relativePath);
      }

    })
  })

  let scriptsPromise = compileScripts(Object.assign({}, options, {sources: scripts}));
  let stylesPromise = compileStyles(Object.assign({}, options, {sources: styles}));

  return Promise.all([scriptsPromise, stylesPromise])
    .then((results)=> {

      if(!watch) {

        return results;
      }

      const instance = proxyMethods(['onChange', 'removeChangeListener', 'close'], results);

      createFilesHasChangedPromise(instance);

      return instance;
    })
}


function proxyMethods(methods, instances) {

  const instance = {};

  methods.forEach((method)=> {

    instance[method] = (arg)=> {

      instances.forEach((i) => i[method](arg))
    }
  })

  return instance;
}

function createFilesHasChangedPromise(instance) {

  instance.filesHasChanged = new Promise((resolve) => {

    instance.onChange(listener);

    function listener() {

      instance.removeChangeListener(listener);

      process.nextTick(()=> createFilesHasChangedPromise(instance));
      resolve();
    }
  })
}


module.exports = {

  compile,
  compileScripts,
  compileStyles,
}
