'use strict';
(function () {
    angular
        .module('twrDatetimePicker', [])
        .directive('twrDatetimePicker', twrDatetimePicker);

    twrDatetimePicker.$inject = ['$compile', '$document', '$templateCache', '$http', '$window'];

    function twrDatetimePicker($compile, $document, $templateCache, $http, $window) {
        return {
            restrict: 'A',
            require: 'ngModel',
            templateUrl: 'templates/twrDatePicker.html',
            replace: true,
            scope: {
                ngModel: '='
            },
            link: function (scope, element, attrs, ngModel) {
                scope.weeks = [];
                scope.date = {};
                scope.monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                scope.days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
                scope.settings = {
                    isVisible: false,
                    currentView: 'month',
                    datePicker: true,
                    timePicker: true,
                    showClearButton: false,
                    autoClose: false
                }
                
                setDynamicStyling()
                getArgumentSettings();
                
                if (scope.ngModel) {
                    scope.date.selected = new Date(scope.ngModel);
                    scope.date.display = new Date(scope.ngModel);
                }

                //#region Scope Functions
                scope.previous = previousRange;
                scope.next = nextRange;
                scope.selectDate = selectDate;
                scope.selectMonth = selectMonth;
                scope.previousView = previousViewType;
                scope.clearModel = clearModel;
                //#endregion

                //#region Time Picker Functions
                scope.nextHour = function () {
                    var intHour = parseInt(scope.date.hour);
                    if (intHour == 23) {
                        scope.date.hour = '00';
                    }
                    else {
                        intHour++;
                        if (intHour.toString().length == 1) {
                            scope.date.hour = '0' + intHour;
                        }
                        else {
                            scope.date.hour = intHour;
                        }
                    }
                }

                scope.previousHour = function () {
                    var intHour = parseInt(scope.date.hour);
                    if (intHour == 0) {
                        scope.date.hour = '23';
                    }
                    else {
                        intHour = intHour - 1
                        if (intHour.toString().length == 1) {
                            scope.date.hour = '0' + intHour;
                        }
                        else {
                            scope.date.hour = intHour;
                        }
                    }
                }

                scope.nextMinute = function () {
                    if (scope.date.minute >= 0 && scope.date.minute < 15) {
                        scope.date.minute = '15';
                    }
                    else if (scope.date.minute >= 15 && scope.date.minute < 30) {
                        scope.date.minute = '30';
                    }
                    else if (scope.date.minute >= 30 && scope.date.minute < 45) {
                        scope.date.minute = '45';
                    }
                    else if (scope.date.minute >= 45) {
                        scope.date.minute = '00';
                    }
                }

                scope.previousMinute = function () {
                    if (scope.date.minute > 0 && scope.date.minute <= 15) {
                        scope.date.minute = '00';
                    }
                    else if (scope.date.minute > 15 && scope.date.minute <= 30) {
                        scope.date.minute = '15';
                    }
                    else if (scope.date.minute > 30 && scope.date.minute <= 45) {
                        scope.date.minute = '30';
                    }
                    else if (scope.date.minute == 0 || scope.date.minute > 45) {
                        scope.date.minute = '45';
                    }
                }

                scope.$watch('date.hour', function (newValue) {
                    var date = scope.date.selected;
                    if (newValue >= 0 && newValue < 24) {
                        if (!scope.date.minute) {
                            scope.date.minute = '00';
                        }
                        scope.date.selected = new Date(date.getFullYear(), date.getMonth(), date.getDate(),
                            scope.date.hour, scope.date.minute);

                        updateNgModel();
                    }
                });

                scope.$watch('date.minute', function (newValue) {
                    var date = scope.date.selected;
                    if (newValue >= 0 && newValue < 60) {
                        if (!scope.date.hour) {
                            scope.date.hour = '00';
                        }
                        scope.date.selected = new Date(date.getFullYear(), date.getMonth(), date.getDate(),
                            scope.date.hour, scope.date.minute);

                        updateNgModel();
                    }
                });
                //#endregion

                //#region Show/Hide Picker
                scope.twrDateInputClick = function () {
                    scope.settings.currentView = 'month';
                    showPicker();
                }

                element.bind('mouseover', hoverPicker);
                element.bind('mouseout', hoverOutPicker);

                function showPicker() {
                    if (!scope.date.display) {
                        scope.date.display = new Date();
                    }
                    generateCurrentView();
                    if (!scope.settings.isVisible) {
                        element.removeClass('hide-picker');
                    }
                    $document.bind('click', checkHover);
                }

                function hidePicker() {
                    element.addClass('hide-picker');
                    scope.settings.isVisible = false;
                }

                function checkHover() {
                    if (!scope.hovering) {
                        hidePicker();
                    }
                }

                function hoverPicker() {
                    scope.hovering = true;
                }

                function hoverOutPicker() {
                    scope.hovering = false;
                }
                //#endregion

                //#region Change Views
                function previousRange() {
                    var display = scope.date.display;
                    if (scope.settings.currentView == 'month') {
                        scope.date.display = new Date(display.getFullYear(), display.getMonth() - 1, display.getDate());
                    }
                    else if (scope.settings.currentView == 'year') {
                        scope.date.display = new Date(display.getFullYear() - 1, display.getMonth(), display.getDate());
                    }
                    generateCurrentView();
                }

                function nextRange() {
                    var display = scope.date.display;
                    if (scope.settings.currentView == 'month') {
                        scope.date.display = new Date(display.getFullYear(), display.getMonth() + 1, display.getDate());
                    }
                    else if (scope.settings.currentView == 'year') {
                        scope.date.display = new Date(display.getFullYear() + 1, display.getMonth(), display.getDate());
                    }
                    generateCurrentView();
                }

                function previousViewType() {
                    if (scope.settings.currentView == 'time') {
                        scope.settings.currentView = 'month';
                        generateCurrentView();
                    }
                    else if (scope.settings.currentView == 'month') {
                        scope.settings.currentView = 'year';
                        generateCurrentView();
                    }
                }

                function selectMonth(monthIndex) {
                    var year = scope.date.display.getFullYear();
                    scope.date.display = new Date(year, monthIndex, 1);
                    scope.settings.currentView = 'month';
                    generateCurrentView();
                }

                function selectDate(date) {
                    if (scope.date.selected) {
                        var previousDate = scope.date.selected;
                        scope.date.selected = new Date(date.getFullYear(), date.getMonth(), date.getDate(), previousDate.getHours(), previousDate.getMinutes());
                    }
                    else {
                        scope.date.selected = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12, 0);
                    }
                    scope.date.display = scope.date.selected;

                    updateNgModel();
                    
                    if (scope.settings.timePicker) {
                        scope.settings.currentView = 'time';
                    }
                    else if (scope.settings.autoClose) {
                        hidePicker();
                    }
                    generateCurrentView();
                }
                //#endregion

                //#region Generate Views
                function generateCurrentView() {
                    if (!scope.date.display) {
                        scope.date.display = new Date();
                    }

                    var date = scope.date.display;

                    if (scope.settings.currentView == 'year') {
                        generateYearView(date);
                    }
                    else if (scope.settings.currentView == 'month') {
                        generateMonthView(date);
                    }
                    else if (scope.settings.currentView == 'time') {
                        generateTimeView(date);
                    }
                }

                function generateTimeView(date) {
                    if (!scope.settings.datePicker) {
                        return;
                    }

                    var hour = scope.date.selected.getHours().toString();
                    var minute = scope.date.selected.getMinutes().toString();

                    if (hour.length == 1) {
                        scope.date.hour = '0' + hour;
                    }
                    else {
                        scope.date.hour = hour;
                    }

                    if (minute.length == 1) {
                        scope.date.minute = '0' + minute;
                    }
                    else {
                        scope.date.minute = minute
                    }
                }

                function generateMonthView(date) {
                    scope.weeks = [];
                    var days = [];

                    var firstDateInMonth = new Date(date.getFullYear(), date.getMonth(), 1);
                    var numberOfDaysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

                    var startingDay = firstDateInMonth.getDay();

                    var counter = 1;

                    //Get dates before current month
                    if (startingDay > 0) {
                        var workingDate = moment(firstDateInMonth).subtract(startingDay, 'days').toDate();

                        for (var i = 0; i < startingDay; i++) {

                            if (counter > 7) {
                                counter = 1;
                                scope.weeks.push(days);
                                days = [];
                            }

                            days.push({
                                date: workingDate,
                                day: workingDate.getDate(),
                                otherMonth: true,
                                now: matchingDates(workingDate, new Date()),
                                selected: matchingDates(workingDate, scope.date.selected)
                            });
                            counter++;
                            workingDate = moment(workingDate).add(1, 'days').toDate();
                        }
                    }

                    //Get dates in current month
                    var workingDate = firstDateInMonth;
                    for (var i = 0; i < numberOfDaysInMonth; i++) {

                        if (counter > 7) {
                            counter = 1;
                            scope.weeks.push(days);
                            days = [];
                        }

                        days.push({
                            date: workingDate,
                            day: workingDate.getDate(),
                            otherMonth: false,
                            now: matchingDates(workingDate, new Date()),
                            selected: matchingDates(workingDate, scope.date.selected)
                        });
                        counter++
                        workingDate = moment(workingDate).add(1, 'days').toDate();
                    }

                    var endOfMonth = moment(workingDate).subtract(1, 'days').toDate();
                    //Get dates after current month
                    if (endOfMonth.getDay() < 7) {
                        for (var i = endOfMonth.getDay() ; i < 6 ; i++) {

                            days.push({
                                date: workingDate,
                                day: workingDate.getDate(),
                                otherMonth: true,
                                now: matchingDates(workingDate, new Date()),
                                selected: matchingDates(workingDate, scope.date.selected)
                            });
                            workingDate = moment(workingDate).add(1, 'days').toDate();
                        }
                    }

                    scope.weeks.push(days);
                }

                function generateYearView(date) {
                    var counter = 0;
                    scope.months = [];
                    var monthGroup = [];
                    var now = new Date();

                    angular.forEach(scope.monthNames, function (month, $index) {

                        var isNow = false;
                        if (now.getFullYear() == date.getFullYear() && now.getMonth() == $index) {
                            isNow = true;
                        }

                        var isSelected = false;
                        if (scope.date.selected
                            && scope.date.selected.getFullYear() == date.getFullYear()
                            && scope.date.selected.getMonth() == $index) {
                            isSelected = true;
                        }

                        var monthObject = {
                            name: month,
                            number: $index,
                            year: date.getFullYear(),
                            now: isNow,
                            selected: isSelected
                        }

                        monthGroup.push(monthObject);
                        counter++;
                        if (counter > 3) {
                            scope.months.push(monthGroup);
                            monthGroup = [];
                            counter = 0;
                        }
                    });
                }
                //#endregion

                function setDynamicStyling() {
                    //Get the height of the input and offsets the picker below it
                    var height = element[0].offsetHeight;

                    var picker;
                    angular.forEach(element.children(), function (child) {
                        var angularChild = angular.element(child);
                        if (angularChild.hasClass('twr-date-picker-container')) {
                            picker = angularChild;
                        }
                    });
                    picker.css('margin-top', height + 'px');

                    checkInputSize()
                    angular.element($window).bind('resize', checkInputSize);
                }

                function checkInputSize() {
                    var picker;
                    var input;
                    angular.forEach(element.children(), function (child) {
                        var angularChild = angular.element(child);
                        if (angularChild.hasClass('twr-date-picker-container')) {
                            picker = angularChild;
                        }
                        if (angularChild.hasClass('twr-date-picker-input')) {
                            input = angularChild;
                        }
                    });

                    var screenWidth = window.innerWidth;
                    var inputWidth = input[0].offsetWidth;
                    var inputOffset = input[0].getBoundingClientRect().left;

                    var diff = inputOffset - (inputWidth / 1.2)

                    if (inputOffset > (screenWidth / 2)) {
                        picker.css('left', diff + 'px');
                    }
                    else {
                        picker.css('left', 'auto');
                    }
                }

                function getArgumentSettings() {
                    var timePickerActive = attrs['hideTimePicker'];
                    if (timePickerActive != null) {
                        scope.settings.timePicker = false;
                    }

                    var showClearButton = attrs['showClearButton'];
                    if (showClearButton != null) {
                        scope.settings.showClearButton = true;
                    }

                    var autoClose = attrs['autoClose'];
                    if (autoClose != null) {
                        scope.settings.autoClose = true;
                    }

                    //Check for custom formatting
                    var format = attrs['dateFormat'];
                    if (format) {
                        scope.dateFormat = format;
                    }
                    else {
                        //Default format
                        if (scope.settings.datePicker && scope.settings.timePicker) {
                            scope.dateFormat = 'MM/dd/yyyy HH:mm';
                        }
                        else if (scope.settings.datePicker && !scope.settings.timePicker) {
                            scope.dateFormat = 'MM/dd/yyyy';
                        }
                    }
                }

                function updateNgModel() {
                    scope.$evalAsync(function () {
                        scope.ngModel = scope.date.selected;
                    });
                }

                function clearModel() {
                    scope.date.selected = null;
                    if (scope.settings.autoClose) {
                        hidePicker();
                    }
                    updateNgModel();
                }

                //Checks if dates match while ignoring time
                function matchingDates(date1, date2) {
                    if (date1 && date2) {
                        if (date1.getFullYear() == date2.getFullYear()
                                    && date1.getMonth() == date2.getMonth()
                                    && date1.getDate() == date2.getDate()) {
                            return true;
                        }
                    }
                    return false;
                }
            }
        }
    }

    angular
        .module('twrDatetimePicker')
        .run(addTemplate);

    addTemplate.$inject = ['$templateCache'];

    function addTemplate($templateCache) {
        $templateCache.put('templates/twrDatePicker.html',
        '<div class="twr-date-picker-template hide-picker">' +
            '<div class="twr-date-picker-container">'+
            '    <div class="twr-date-picker-header">'+
            '        <div class="twr-date-picker-header-button-left" data-ng-hide="settings.currentView == \'time\'">'+
            '            <a href="" class="chevrons" data-ng-click="previous()">'+
            '                <i class="fa fa-chevron-left"></i>'+
            '            </a>'+
            ''+
            '        </div>'+
            ''+
            '        <div  class="twr-date-picker-header-button-right" data-ng-hide="settings.currentView == \'time\'">'+
            '            <a href="" class="chevrons" data-ng-click="next()">'+
            '                <i class="fa fa-chevron-right"></i>'+
            '            </a>'+
            '        </div>'+
            ''+
            '        <div class="twr-date-picker-title"'+
            '             data-ng-click="previousView()"'+
            '             data-ng-switch data-on="settings.currentView">'+
            '            <span data-ng-switch-when="time">'+
            '                {{date.display | date: \'MM/dd/yyyy\'}}'+
            '            </span>'+
            '            <span data-ng-switch-when="month">'+
            '                {{date.display | date: \'MMMM\'}} {{date.display | date: \'yyyy\'}}'+
            '            </span>'+
            '            <span data-ng-switch-when="year">'+
            '                {{date.display | date: \'yyyy\'}}'+
            '            </span>'+
            '        </div>'+
            '    </div>'+
            ''+
            '    <div></div>'+
            ''+
            '    <div class="twr-date-picker-body" data-ng-switch data-on="settings.currentView">'+
            '        <div class="twr-time-view" data-ng-switch-when="time">'+
            '            <table>'+
            '                <tbody>'+
            '                    <tr>'+
            '                        <td>'+
            '                            <a href="" class="chevrons" data-ng-click="nextHour()">'+
            '                                <i class="fa fa-chevron-up"></i>'+
            '                            </a>'+
            '                        </td>'+
            '                        <td class="time-spacer-col"></td>'+
            '                        <td>'+
            '                            <a href="" class="chevrons"  data-ng-click="nextMinute()">'+
            '                                <i class="fa fa-chevron-up"></i>'+
            '                            </a>'+
            '                        </td>'+
            '                    </tr>'+
            '                    <tr>'+
            '                        <td><input type="text" max="23" data-ng-model="date.hour" /></td>'+
            '                        <td class="time-spacer-col">:</td>'+
            '                        <td><input type="text" max="59" data-ng-model="date.minute" /></td>'+
            '                    </tr>'+
            '                    <tr>'+
            '                        <td>'+
            '                            <a href="" class="chevrons"  data-ng-click="previousHour()">'+
            '                                <i class="fa fa-chevron-down"></i>'+
            '                            </a>'+
            '                        </td>'+
            '                        <td class="time-spacer-col"></td>'+
            '                        <td>'+
            '                            <a href="" class="chevrons" data-ng-click="previousMinute()">'+
            '                                <i class="fa fa-chevron-down"></i>'+
            '                            </a>'+
            '                        </td>'+
            '                    </tr>'+
            '                </tbody>'+
            '            </table>'+
            '        </div>'+
            '        <div class="twr-view-month" data-ng-switch-when="month">'+
            '            <table>'+
            '                <thead>'+
            '                    <tr>'+
            '                        <th data-ng-repeat="day in days">{{day}}</th>'+
            '                    </tr>'+
            '                </thead>'+
            '                <tbody>'+
            '                    <tr data-ng-repeat="week in weeks">'+
            '                        <td data-ng-repeat="day in week"'+
            '                            data-ng-class="{\'other-month\': day.otherMonth, \'now\': day.now, \'selected\': day.selected}"'+
            '                            data-ng-click="selectDate(day.date)">'+
            '                            {{day.day}}'+
            '                        </td>'+
            '                    </tr>'+
            '                </tbody>'+
            '            </table>'+
            '        </div>'+
            '        <div class="twr-view-year" data-ng-switch-when="year">'+
            '            <table>'+
            '                <tbody>'+
            '                    <tr data-ng-repeat="monthGroup in months">'+
            '                        <td data-ng-repeat="month in monthGroup"'+
            '                            data-ng-class="{\'now\': month.now, \'selected\': month.selected}"'+
            '                            data-ng-click="selectMonth(month.number)">'+
            '                            {{month.name}}'+
            '                        </td>'+
            '                    </tr>'+
            '                </tbody>'+
            '            </table>'+
            '        </div>'+
            '        '+
            '    </div>'+
            '    <div class="twr-date-picker-footer">'+
            '        <div class="twr-date-picker-button-panel" data-ng-show="settings.showClearButton">'+
            '            <button type="button" data-ng-click="clearModel()">Clear Date/Time</button>'+
            '        </div>'+
            '    </div>'+
            '</div>' +

            '<input class="twr-date-picker-input" data-ng-click="twrDateInputClick()" value="{{date.selected | date: dateFormat}}" readonly />' +
        '</div>');
    }
})();