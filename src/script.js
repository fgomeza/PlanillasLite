var app = angular.module('app', []);

app.run(function () {
});

app.controller('controller', ['$scope', '$log', function ($scope, $log) {
    var nw = require('nw.gui');
    var fs = require('fs');
    var stream = require('stream');
    var os = require('os');

    $scope.str = 'Hello World!';

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
                    //$log.info('File contents:\n', fileContents);
                    parseFile(fileContents);
                });
            }
        });
    };

    var parseFile = function (fileContents) {
        var lines = fileContents.split(os.EOL);
        lines = lines.slice(9);
        var matrix = lines.map(function(line){
            return line.split('\t');
        });
        $log.debug(matrix);
        $scope.matrix = matrix;
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
    configureMenu();

}]);
