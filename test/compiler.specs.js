const {compileScripts, compileStyles} = require('../src/compiler');
const fs = require('fs');
const assert = require('assert');
const cp= require('child_process');
const Promise = require('bluebird');

const exec = Promise.promisify(cp.exec);

describe('compiler specs', function() {

  beforeEach((done)=> {

    exec('rm -rf ./test/tmp')
      .then(()=> done())
      .catch(done)
  })

  describe('scripts', function() {

    it('should compile a jsx file', function(done) {

      compileScripts({
        sources: ['./test.jsx'],
        destination: './test/tmp',
        cwd: './test/stubs'
      })
        .then(() => {

          assert(fs.existsSync('./test/tmp/test.js'))
          done();
        })
        .catch(done)
    });

    it('should use the client loader', function(done) {

      compileScripts({
        sources: ['./parent/index.jsx'],
        destination: './test/tmp',
        cwd: './test/stubs'
      })
        .then(() => {

          assert(fs.existsSync('./test/tmp/parent/index.js'))
          done();
        })
        .catch(done)
    })

    it('should compile using globbing', function(done) {

      compileScripts({
        sources: ['./**/*.jsx'],
        destination: './test/tmp',
        cwd: './test/stubs'
      })
        .then(() => {

          assert(fs.existsSync('./test/tmp/parent/index.js'));
          assert(fs.existsSync('./test/tmp/child/index.js'));
          assert(fs.existsSync('./test/tmp/test.js'));
          done();
        })
        .catch(done)
    })

    it('should watch files for changes', function(done) {

      compileScripts({
        watch: true,
        sources: ['./*.jsx'],
        destination: './test/tmp',
        cwd: './test/stubs'
      })
        .then((instance)=> {

          assert(fs.existsSync('./test/tmp/test.js'));

          replaceInFile('./test/stubs/test.jsx', 'test', 'changed');

          return timeout(1000)
            .then(()=> {

              assert(/changed/.test(fs.readFileSync('./test/stubs/test.jsx', 'utf8')));

              replaceInFile('./test/stubs/test.jsx', 'changed', 'test');

              return timeout(1000)
                .then(()=> {

                  assert(/test/.test(fs.readFileSync('./test/stubs/test.jsx', 'utf8')));

                  return instance.close();
                })

            })
        })
        .then(()=> done())
        .catch(done)

    })
  })

  describe('styles', function() {

    it('should compile a .styl file', function(done) {

      compileStyles({
        sources: ['./test.styl'],
        destination: './test/tmp',
        cwd: './test/stubs'
      })
        .then(()=> {

          assert(fs.existsSync('./test/tmp/test.css'));
          done()
        })
        .catch(done)
    })

    it('should compile a glob', function(done) {

      compileStyles({
        sources: ['./**/*.styl'],
        destination: './test/tmp',
        cwd: './test/stubs'
      })
        .then(()=> {

          assert(fs.existsSync('./test/tmp/test.css'));
          assert(fs.existsSync('./test/tmp/parent/styles.css'));
          assert(fs.existsSync('./test/tmp/child/styles.css'));
          done()
        })
        .catch(done)
    })

    it('should include child component styles', (done)=> {

      compileStyles({
        sources: ['./parent/styles.styl'],
        destination: './test/tmp',
        cwd: './test/stubs'
      })
        .then(()=> {

          assert(/\.child/.test(fs.readFileSync('./test/tmp/parent/styles.css')))

          done()
        })
        .catch(done)
    })

    it('should inlude base styles', (done)=> {

      compileStyles({

        includes: ['./vars.styl'],
        sources: ['./main.styl'],
        destination: './test/tmp',
        cwd: './test/stubs'
      })
        .then(()=> {

          assert(/#f00/.test(fs.readFileSync('./test/tmp/main.css')))
          done();
        })
        .catch(done)
    })
  })
})


function replaceInFile(file, from, to) {

  const content = fs.readFileSync(file, 'utf8');

  fs.writeFileSync(file, content.replace(from, to));
}

function timeout(delay) {

  return Promise.resolve().timeout(delay);
}