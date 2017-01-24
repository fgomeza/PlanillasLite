var app = angular.module('app', []);

app.run(function () {
});

app.controller('controller', ['$scope', '$log', function ($scope, $log) {
    var nw = require('nw.gui');
    var fs = require('fs');
    var stream = require('stream');
    var os = require('os');
    var moment = require('moment');

    moment.locale('es');

    $scope.openFile = function () {
        $scope.file = {};
        var input = $('<input>').attr('type','file');
        input.unbind('change');
        input.change(function (event) {
            readFile($(this).val());
        });
        input.trigger('click');
    };

    var readFile = function (filePath) {
        $log.info('Loading file:', filePath);
        //$scope.file.path;

        //var stream = fs.createReadStream(filePath, { 'encoding': 'utf8' });
        fs.readFile(filePath, 'utf8', function(err, fileContents) {
            if (err) {
                $log.error('Error reading file', err);
                $scope.error = 'Error reading file';
            } else {
                $scope.$apply(function() {
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
        $log.debug('date', date);
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
