'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');

module.exports = class extends Generator {
  prompting() {

    const prompts = [
      {
        type: 'input',
        name: 'app_name',
        message: "What's the name of your application?",
        default: 'application'
      },
      {
        type: 'input',
        name: 'db_name',
        message: "What's the name of your Database?",
        default: function (previous_answer) { return previous_answer.app_name; },
      },
      {
        type: 'list',
        name: 'version',
        message: 'Which Laravel version do you want to use?',
        choices: ['5.6.*', '5.5.*'],
        default: 0
      },
      {
        type: 'checkbox',
        name: 'dev_packages',
        message: 'Which laravel frontend preset do you want to use?',
        choices: [
            {
                name: "barryvdh/laravel-debugbar",
                checked: true
            },
            {
                name: "doctrine/dbal",
                checked: true
            }
        ],
      },
      {
        type: 'confirm',
        name: 'use_api',
        message: 'your project use API?',
        default: false
      },
      {
        when: answers => {
          return answers.use_api === true;
        },
        type: 'confirm',
        name: 'swagger',
        message: 'are you want install swagger ui?',
        default: true
      },
      {
        when: answers => {
          return answers.use_api === true;
        },
        type: 'confirm',
        name: 'fcm',
        message: 'your Project use Firebase (FCM)?',
        default: true
      },
      {
        when: answers => {
          return answers.use_api === true;
        },
        type: 'list',
        name: 'api_token',
        message: 'Which API Token Authentication use?',
        choices: ['none', 'jwt', 'passport'],
        default: 'none'
      }
    ];

    return this.prompt(prompts).then(props => {
      // To access props later use this.props.someAnswer;
      this.props = props;
    });
  }

  installLaravel() {
    this.spawnCommandSync('composer', [
      'create-project',
      '--prefer-dist',
      'laravel/laravel',
      this.props.app_name,
      this.props.version
    ]);    

    // this.spawnCommandSync('mysql', [
    //   '-u',
    //   'root',
    //   '-e',
    //   '"create database '+ this.props.db_name +'"'
    // ]);

  }

  setApplicationFolder() {
    this.destinationRoot(this.destinationPath(this.props.app_name));
  }

  installdevPackages() {
    var packages = this.props.dev_packages
    var arrayLength = this.props.dev_packages.length;

    if(arrayLength){
      for (var i = 0; i < arrayLength; i++) {
        this.spawnCommandSync('composer', [
          'require',
          '--dev',
           packages[i]
        ]);
      }
    }
  }

  // API 
  installAPIPackages() {
    if(this.props.use_api){
      // jwt
      if(this.props.api_token == 'jwt'){
        this.spawnCommandSync('composer', [
          'require',
          'tymon/jwt-auth:^1.0'
        ]);
        this.spawnCommandSync('php', [
          'artisan',
          'vendor:publish',
          '--provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"',
        ]);      
        this.spawnCommandSync('php', [
          'artisan',
          'jwt:secret',
        ]);
      // passport
      }else if(this.props.api_token == 'passport'){
        this.spawnCommandSync('composer', [
          'require',
          'laravel/passport'
        ]);
        this.spawnCommandSync('php', [
          'artisan',
          'vendor:publish'
        ]);
      }
      //swagger
      if(this.props.swagger){
        this.spawnCommandSync('composer', [
          'require',
          'darkaonline/l5-swagger:'+this.props.version
        ]);
        this.spawnCommandSync('php', [
          'artisan',
          'vendor:publish',
          '--provider',
          '"L5Swagger\L5SwaggerServiceProvider"'
        ]);
      }

      //fcm
      if(this.props.fcm){
        this.spawnCommandSync('composer', [
          'require',
          'brozot/laravel-fcm'
        ]);
      }
    }
  }

};
