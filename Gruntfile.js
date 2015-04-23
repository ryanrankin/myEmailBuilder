/*global module:false*/

module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
            '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
            '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
            '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
            ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
        // Task configuration.
        sass: {
            compile: {
                files: {
                    'tmp/styles/main.css': 'src/styles/main.scss'
                    //, 'tmp/styles/mediaQueries.css': 'src/styles/mediaQueries.scss'
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
            src: {
                files: [{
                    expand: true,
                    cwd: "src",
                    src: ["*.html"],
                    dest: "tmp"
                }]
            }
        },
        'compile-handlebars': {
            email: {
                template: 'src/views/index.handlebars',
                templateData: 'src/data/data.json',
                output: 'tmp/index.html'
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
            }
        },
        connect: {
            server: {
                options: {
                    port: 8000,
                    base: 'tmp/'
                }
            }
        }
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-connect');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-sass');
    grunt.loadNpmTasks('grunt-compile-handlebars');

    // Default task.
    grunt.registerTask('default', ['compile-handlebars:email', 'connect', 'jshint', 'watch']);

};