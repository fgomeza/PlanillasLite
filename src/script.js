var app = angular.module('app', ['inform', 'inform-exception', 'inform-http-exception', 'ngAnimate']);

app.config(['$provide', 'informProvider', function($provide, informProvider) {
}]);

app.run(function () {
});

app.factory('toast', ['inform', '$log', function (inform, $log) {

    var error = function (text, e) {
        $log.error(text, e);
        inform.add(text, {type:'danger', ttl:-1});
    };

    var primary = function (text) {
        inform.add(text, {type:'primary'});
    };

    var success = function (text) {
        inform.add(text, {type:'success'});
    };

    var info = function (text) {
        inform.add(text, {type:'info', ttl:10000});
    };

    var warning = function (text) {
        $log.error.apply(null, arguments);
        inform.add(text, {type:'warning', ttl:10000});
    };

    var debug = function (text) {
        $log.debug.apply(null, arguments);
        inform.add(text, {ttl:-1});
    };

    return {
        error: error,
        primary: primary,
        success: success,
        info: info,
        warning: warning,
        debug: debug
    };
}]);

app.controller('controller', ['$scope', '$log', 'toast', function ($scope, $log, toast) {
    var nw = require('nw.gui');
    var fs = require('fs');
    var stream = require('stream');
    var os = require('os');
    var moment = require('moment');

    moment.locale('es');

    var openFileDialog = function (save, callback) {

    }

    $scope.openFile = function () {
        var input = $('<input>').attr('type','file');
        input.change(function (event) {
            readFile($(this).val());
        });
        input.trigger('click');
    };

    var readFile = function (filePath) {
        $log.info('Loading file:', filePath);

        //var stream = fs.createReadStream(filePath, { 'encoding': 'utf8' });
        fs.readFile(filePath, 'utf8', function(error, fileContents) {
            if (error) {
                toast.error('Error reading file', error);
            } else {
                $scope.$apply(function () {
                    parseFile(fileContents);
                });
            }
        });
    };

    var parseFile = function (fileContents) {
        var lines = fileContents.split(os.EOL);

        // date
        var dateString = lines[1].split('\t').slice(1).join(' ');
        var date = moment(dateString, 'DD/MM/YYYY HH:mm');
        var when = { 'date': date.format('dddd, MMMM DD YYYY, h:mm A') };

        // headers
        var headers = lines[5].split('\t');
        headers.splice(1, 0, lines[7].split('\t')[1]);
        headers = headers.map(function(header){
            return { 'name':header, 'selected':false };
        });

        // contents
        lines = lines.slice(9);
        var matrix = lines.map(function(line){
            return line.split('\t');
        });

        $scope.headers = headers;
        $scope.matrix = matrix;
        $scope.when = when;

    };

    $scope.exportFile = function () {
        $scope.file = {};
        var input = $('<input>').attr('type','file').attr('nwsaveas','datos_de_planilla.csv');
        input.change(function (event) {
            writeFile($(this).val());
        });
        input.trigger('click');
    };

    var writeFile = function (filePath) {
        $log.info('Writing file:', filePath);
        var csvContents = getCSVcontents();

        fs.writeFile(filePath, csvContents, function(error) {
            $scope.$apply(function () {
                if (error) {
                    toast.error('Error writing file', error);
                } else {
                    toast.success('Success writing file!');
                }
            });
        });
    };

    var getCSVcontents = function () {
        return $scope.matrix.map(function(row) {
            return row.join(',');
        }).join('\n');
    };

    var configureMenu = function () {
        var fileMenu = new nw.Menu();
        fileMenu.append(new nw.MenuItem({ label: 'Item A'}));
        fileMenu.append(new nw.MenuItem({ label: 'Item B'}));
        fileMenu.append(new nw.MenuItem({ type: 'separator'}));
        fileMenu.append(new nw.MenuItem({ label: 'Item C'}));
        fileMenu.append(new nw.MenuItem({
            label: 'Open file',
            click: $scope.openFile
        }));

        var helpMenu = new nw.Menu();

        var menubar = new nw.Menu({ type: 'menubar' });
        menubar.append(new nw.MenuItem({ label: 'File', submenu: fileMenu}));
        menubar.append(new nw.MenuItem({ label: 'About', submenu: helpMenu}));

        var win = nw.Window.get();
        win.menu = menubar;

        win.maximize();
    };

    var filePath = "/home/francisco/Documents/Code/planillas/assets/DATOS%20CMS%20PLANILLA.txt";
    readFile(filePath);
    configureMenu();

}]);
