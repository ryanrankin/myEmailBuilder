/*global module:false*/

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        secrets: grunt.file.readJSON('keys.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        build: {
          current: '<%= grunt.template.today("h") %>_hours_and_<%= grunt.template.today("MM") %>_minutes_in_the_<%= grunt.template.today("TT") %>'
        },
        paths: {
          src: 'src',
          tmp: 'tmp',
          dist: 'dist/<%= grunt.template.today("yyyy-mm-dd") %>'
        },

        shell: {
          makeDir: {
              command: 'mkdir <%= paths.dist %>'
          },
          copyDist: {
            command: 'cp -v <%= paths.dist %>/<%= build.current %>.html dist/index.html'
          }
        },

        // Task configuration.
        sass: {
            compile: {
                options:{
                    debugInfo: false
                },
                files: {
                    'tmp/styles/main.css': 'src/styles/main.scss',
                    'tmp/styles/mediaQueries.css': 'src/styles/mediaQueries.scss'
                }
            }
        },
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                unused: true,
                boss: true,
                eqnull: true,
                browser: true,
                globals: {
                    jQuery: true
                }
            },
            gruntfile: {
                src: 'Gruntfile.js'
            }
        },
        copy: {
            dist: {
                files: [{
                    expand: false,
                    src: ['<%= paths.dist %>/<%= build.current %>.html'],
                    dest: 'dist/index.html'
                }]
            }
        },
        'compile-handlebars': {
            email: {
                template: 'src/views/index.handlebars',
                templateData: 'src/data/data.json',
                output: 'tmp/index.html',
                helpers: 'src/views/helpers/*.js'
            },
        },
        watch: {
            options: {
                livereload: true
            },
            gruntfile: {
                files: '<%= jshint.gruntfile.src %>',
                tasks: ['jshint:gruntfile']
            },
            sassfile: {
                files: 'src/styles/*.scss',
                tasks: ['sass:compile']
            },
            handlebars: {
                files: 'src/**/*.handlebars',
                tasks: ['compile-handlebars:email']
            },
            js: {
                files: 'src/views/helpers/*.js',
                tasks: ['compile-handlebars:email']
            },
            data : {
                files: 'src/data/data.json',
                tasks: ['compile-handlebars:email']
            }
        },
        connect: {
            server: {
                options: {
                    port: 8000,
                    base: 'tmp/'
                }
            }
        },
        htmlSnapshot: {
            all: {
                options: {
                    //that's the path where the snapshots should be placed
                    //it's empty by default which means they will go into the directory
                    //where your Gruntfile.js is placed
                    snapshotPath: 'tmp/',
                    //This should be either the base path to your index.html file
                    //or your base URL. Currently the task does not use it's own
                    //webserver. So if your site needs a webserver to be fully
                    //functional configure it here.
                    sitePath: 'http://localhost:8000',
                    //you can choose a prefix for your snapshots
                    //by default it's 'snapshot_'
                    fileNamePrefix: 'GF_<%= build.current %>',
                    //by default the task waits 500ms before fetching the html.
                    //this is to give the page enough time to to assemble itself.
                    //if your page needs more time, tweak here.
                    msWaitForPages: 1000,
                    //sanitize function to be used for filenames. Converts '#!/' to '_' as default
                    //has a filename argument, must have a return that is a sanitized string
                    sanitize: function(requestUri) {
                        //returns 'index.html' if the url is '/', otherwise a prefix
                        if (/\/$/.test(requestUri)) {
                            return 'index.html';
                        } else {
                            return requestUri.replace(/\//g, 'prefix-');
                        }
                    },
                    //if you would rather not keep the script tags in the html snapshots
                    //set `removeScripts` to true. It's false by default
                    removeScripts: true,
                    //set `removeLinkTags` to true. It's false by default
                    removeLinkTags: true,
                    //set `removeMetaTags` to true. It's false by default
                    removeMetaTags: true,
                    //Replace arbitrary parts of the html
                    replaceStrings: [],
                    // allow to add a custom attribute to the body
                    //bodyAttr: 'data-prerendered',
                    //here goes the list of all urls that should be fetched
                    urls: [
                        ''
                    ],
                    // a list of cookies to be put into the phantomjs cookies jar for the visited page
                    cookies: [{
                        "path": "/",
                        "domain": "localhost",
                        "name": "lang",
                        "value": "en-gb"
                    }],
                    // options for phantomJs' page object
                    // see http://phantomjs.org/api/webpage/ for available options
                    pageOptions: {
                        viewportSize: {
                            width: 1200,
                            height: 1200
                        }
                    }
                }
            }
        },
        processhtml: {
            options: {},
            dist: {
                files: {
                    'tmp/index.html': ['tmp/index.html']
                }
            }
        },
        premailer: {
            simple: {
                options: {
                    preserveStyles: true,
                    removeScripts: true
                },
                files: {
                    '<%= paths.dist %>/<%= build.current %>.html': ['tmp/index.html']
                }
            }
        },


        // Use Mailgun option if you want to email the design to your inbox or to something like Litmus
        // grunt send
        mailgun: {
          mailer: {
            options: {
              key: '<%= secrets.mailgun.api_key %>', // Create keys.json or replace this with your own key
              sender: '<%= secrets.mailgun.sender %>', // Create keys.json or replace this with your preferred sender
              recipient: '<%= secrets.mailgun.recipient %>', // Create keys.json or replace this with your preferred recipient
              subject: 'Global Forum Invite: Test - <%= grunt.template.today("yyyy-mm-dd") %>-<%= build.current %>'
            },
            src: ['dist/index.html']
          }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-shell');
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-compile-handlebars');

    grunt.loadNpmTasks('grunt-html-snapshot');
    grunt.loadNpmTasks('grunt-processhtml');
    grunt.loadNpmTasks('grunt-premailer');

    grunt.loadNpmTasks('grunt-mailgun');

    // Default task.
    grunt.registerTask('default', ['compile-handlebars:email', 'connect', 'jshint', 'watch']);

    grunt.registerTask('new', ['shell:makeDir']);

    // build task
    grunt.registerTask('build', ['compile-handlebars:email', 'jshint', 'htmlSnapshot', 'processhtml', 'premailer:simple', 'shell:copyDist']);

    // send test email task.
    grunt.registerTask('send', ['mailgun']);
};
