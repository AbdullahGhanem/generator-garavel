'use strict';
const Generator = require('yeoman-generator');

module.exports = class extends Generator {
  prompting() {
    const prompts = [
      {
        type: 'input',
        name: 'appName',
        message: "What's the name of your application?",
        default: 'application'
      },
      {
        type: 'input',
        name: 'dbName',
        message: "What's the name of your Database?",
        default: function(previousAnswer) {
          return previousAnswer.appName;
        }
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
        name: 'devPackages',
        message: 'Which laravel frontend preset do you want to use?',
        choices: [
          {
            name: 'barryvdh/laravel-debugbar',
            checked: true
          },
          {
            name: 'doctrine/dbal',
            checked: true
          }
        ]
      },
      {
        type: 'confirm',
        name: 'useApi',
        message: 'your project use API?',
        default: false
      },
      {
        when: answers => {
          return answers.useApi === true;
        },
        type: 'confirm',
        name: 'swagger',
        message: 'are you want install swagger ui?',
        default: true
      },
      {
        when: answers => {
          return answers.useApi === true;
        },
        type: 'confirm',
        name: 'fcm',
        message: 'your Project use Firebase (FCM)?',
        default: true
      },
      {
        when: answers => {
          return answers.useApi === true;
        },
        type: 'list',
        name: 'apiToken',
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
      this.props.appName,
      this.props.version
    ]);
  }

  setApplicationFolder() {
    this.destinationRoot(this.destinationPath(this.props.appName));
  }

  installdevPackages() {
    var packages = this.props.devPackages;
    var arrayLength = this.props.devPackages.length;

    if (arrayLength) {
      for (var i = 0; i < arrayLength; i++) {
        this.spawnCommandSync('composer', ['require', '--dev', packages[i]]);
      }
    }
  }

  // API
  installAPIPackages() {
    if (this.props.useApi) {
      // Jwt
      if (this.props.apiToken === 'jwt') {
        this.spawnCommandSync('composer', ['require', 'tymon/jwt-auth:^1.0']);
        this.spawnCommandSync('php', [
          'artisan',
          'vendor:publish',
          '--provider="TymonJWTAuthProvidersLaravelServiceProvider"'
        ]);
        this.spawnCommandSync('php', ['artisan', 'jwt:secret']);
        // Passport
      } else if (this.props.apiToken === 'passport') {
        this.spawnCommandSync('composer', ['require', 'laravel/passport']);
        this.spawnCommandSync('php', ['artisan', 'vendor:publish']);
      }
      // Swagger
      if (this.props.swagger) {
        this.spawnCommandSync('composer', [
          'require',
          'darkaonline/l5-swagger:' + this.props.version
        ]);
        this.spawnCommandSync('php', [
          'artisan',
          'vendor:publish',
          '--provider',
          '"L5SwaggerL5SwaggerServiceProvider"'
        ]);
      }

      // Fcm
      if (this.props.fcm) {
        this.spawnCommandSync('composer', ['require', 'brozot/laravel-fcm']);
      }
    }
  }
};
