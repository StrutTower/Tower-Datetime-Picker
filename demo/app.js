(function () {
    'use strict';

    angular
        .module('DatePickerDemo', ['twrDatetimePicker']);

    angular
        .module('DatePickerDemo')
        .controller('DemoController', demoController);


    function demoController() {
        var vm = this;
        vm.date5 = new Date();
        
        vm.minDate = new Date(2016, 0, 4);
        vm.maxDate = new Date(2016, 0, 15);
    }
})();