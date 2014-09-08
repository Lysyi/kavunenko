Step 1: Install Node.js


Step 2: Install Grunt

	Install Grunt using the Node package manager:
	
	$ npm install -g grunt
	$ npm install -g grunt-cli
	
	Providing -g installs the package globally.


Step 3: Create a Gruntfile.js
	
	module.exports = function(grunt) {
	  grunt.initConfig({
	    less: {
	      development: {
	        options: {
	          compress: true,
	          yuicompress: true,
	          optimization: 2
	        },
	        files: {
	          // target.css file: source.less file
	          "css/main.css": "less/main.less"
	        }
	      }
	    },
	    watch: {
	      styles: {
	        files: ['less/**/*.less'], // which files to watch
	        tasks: ['less'],
	        options: {
	          nospawn: true
	        }
	      }
	    }
	  });

	  grunt.loadNpmTasks('grunt-contrib-less');
	  grunt.loadNpmTasks('grunt-contrib-watch');

	  grunt.registerTask('default', ['watch']);
	};

	Note that supplying /**/ in the watch path will watch files recursively under that directory.


Step 4: Configure the package file

	If you do not have an existing package.json file in your project directory, create one:

	$ cd YOUR_PROJECT_DIRECTORY
	$ npm init

	Or valid example

	{
	  "name": "Compile LESS Files with Grunt",
	  "description": "",
	  "version": "",
	  "keywords": [
	    "web"
	  ],
	  "homepage": "",
	  "author": "Lysyi",
	  "scripts": {
	    "test": "grunt test"
	  },
	  "style": "css/style.css",
	  "less": "less/style.less",
	  "repository": {
	    "type": "git",
	    "url": "https://github.com/Lysyi/remit-test"
	  },
	  "devDependencies": {
	    "grunt": "~0.4.5",
	    "grunt-contrib-less": "~0.11.0",
	    "grunt-contrib-watch": "~0.6.1"
	  },
	  "engines": {
	    "node": "~0.10.1"
	  }
	}

	Then install the package dependencies:

	$ npm install


Step 5: Start Grunt
	
	$ grunt
