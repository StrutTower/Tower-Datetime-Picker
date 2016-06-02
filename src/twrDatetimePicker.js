(function () {
    'use strict';

    angular
        .module('twrDatetimePicker', [])
        .directive('twrDatetime', twrDatetime);

    twrDatetime.$inject = ['$document'];

    function twrDatetime($document) {
        return {
            restrict: 'E',
            templateUrl: 'twrDatetimePicker.html',
            transclude: true,
            scope: {
                ngModel: '=',
                minDate: '=',
                maxDate: '='
            },
            link: function (scope, element, attrs) {
                scope.weeks = [];
                scope.date = {};
                scope.monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                scope.days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
                scope.settings = {
                    isVisible: false,
                    isHovering: false,
                    defaultView: 'month',
                    currentView: '',
                    datePicker: true,
                    timePicker: true,
                    showClearButton: false,
                    autoClose: false,
                    minDate: undefined,
                    maxDate: undefined
                };

                $document.on('click', documentClick);
                element.on('click', elementClick);


                getArgumentSettings();

                if (scope.ngModel) {
                    scope.date.selected = new Date(scope.ngModel);
                    scope.date.display = new Date(scope.ngModel);
                }

                //#region Scope Functions
                scope.transcludeClicked = transcludeClicked;
                scope.previous = previousRange;
                scope.next = nextRange;
                scope.selectDate = selectDate;
                scope.selectMonth = selectMonth;
                scope.previousView = previousViewType;
                scope.clearModel = clearModel;
                scope.minDateCompare = minDateCompare;
                scope.maxDateCompare = maxDateCompare;

                scope.nextHour = nextHour;
                scope.previousHour = previousHour;
                scope.nextMinute = nextMinute;
                scope.previousMinute = previousMinute;
                //#endregion

                //#region Time Picker Functions
                function nextHour() {
                    if (scope.date.hour === 23) {
                        scope.date.hour = 0;
                    }
                    else {
                        scope.date.hour++;
                    }
                }

                function previousHour() {
                    if (scope.date.hour === 0) {
                        scope.date.hour = 23;
                    }
                    else {
                        scope.date.hour--;
                    }
                }

                function nextMinute() {
                    if (scope.date.minute >= 0 && scope.date.minute < 15) {
                        scope.date.minute = 15;
                    }
                    else if (scope.date.minute >= 15 && scope.date.minute < 30) {
                        scope.date.minute = 30;
                    }
                    else if (scope.date.minute >= 30 && scope.date.minute < 45) {
                        scope.date.minute = 45;
                    }
                    else if (scope.date.minute >= 45) {
                        if (scope.date.hour < 23) {
                            scope.date.hour = scope.date.hour + 1;
                        }
                        else {
                            scope.date.hour = 0;
                        }
                        scope.date.minute = 0;
                    }
                }

                function previousMinute() {
                    if (scope.date.minute > 0 && scope.date.minute <= 15) {
                        scope.date.minute = 0;
                    }
                    else if (scope.date.minute > 15 && scope.date.minute <= 30) {
                        scope.date.minute = 15;
                    }
                    else if (scope.date.minute > 30 && scope.date.minute <= 45) {
                        scope.date.minute = 30;
                    }
                    else if (scope.date.minute === 0 || scope.date.minute > 45) {
                        if (scope.date.hour > 0) {
                            scope.date.hour = scope.date.hour - 1;
                        }
                        else {
                            scope.date.hour = 23;
                        }
                        scope.date.minute = 45;
                    }
                }

                scope.$watch('date.hour', function (newValue) {
                    var date = scope.date.selected;
                    if (newValue >= 0 && newValue < 24 && date) {
                        if (!scope.date.minute) {
                            scope.date.minute = 0;
                            scope.date.displayMinute = '00';
                        }
                        scope.date.selected = new Date(date.getFullYear(), date.getMonth(), date.getDate(),
                            scope.date.hour, scope.date.minute);

                        updateNgModel();
                    }
                });

                scope.$watch('date.minute', function (newValue) {
                    var date = scope.date.selected;
                    if (newValue >= 0 && newValue < 60 && date) {
                        if (!scope.date.hour) {
                            scope.date.hour = 0;
                        }
                        scope.date.selected = new Date(date.getFullYear(), date.getMonth(), date.getDate(),
                            scope.date.hour, scope.date.minute);

                        var minuteString = scope.date.minute.toString();
                        if (minuteString.length === 1) {
                            minuteString = '0' + minuteString;
                        }

                        scope.date.displayMinute = minuteString;

                        updateNgModel();
                    }
                });

                scope.$watch('date.displayMinute', function (newValue) {
                    var date = scope.date.selected;
                    var parsedMinute = parseInt(newValue);
                    if (parsedMinute && parsedMinute >= 0 && parsedMinute < 60) {
                        if (!scope.date.hour) {
                            scope.date.hour = 0;
                        }

                        scope.date.selected = new Date(date.getFullYear(), date.getMonth(), date.getDate(),
                            scope.date.hour, parsedMinute);

                        var minuteString = parsedMinute.toString();
                        if (minuteString.length === 1 && newValue.length === 2) {
                            minuteString = '0' + minuteString;
                        }

                        scope.date.displayMinute = minuteString;

                        updateNgModel();
                    }
                });
                //#endregion

                //#region Show/Hide Picker
                function transcludeClicked() {
                    scope.settings.currentView = scope.settings.defaultView;
                    showPicker();
                }

                function showPicker() {
                    if (!scope.date.display) {
                        scope.date.display = new Date();

                        if (scope.date.display < scope.minDate || scope.date.display > scope.maxDate) {
                            if (scope.minDate) {
                                scope.date.display = scope.minDate;
                            }
                            else if (scope.maxDate) {
                                scope.date.display = scope.maxDate;
                            }
                        }
                    }
                    generateCurrentView();
                    if (!scope.settings.isVisible) {
                        scope.settings.isVisible = true;
                    }
                }

                function hidePicker() {
                    scope.settings.isVisible = false;
                }

                var elementClicked = false;
                function documentClick(event) {
                    if (scope.settings.isVisible && !elementClicked) {
                        hidePicker();
                        scope.$digest();
                    }
                    elementClicked = false;
                }

                function elementClick(event) {
                    elementClicked = true;
                }
                //#endregion

                //#region Change Views
                function previousRange() {
                    var display = scope.date.display;
                    if (scope.settings.currentView === 'month') {
                        scope.date.display = new Date(display.getFullYear(), display.getMonth() - 1, display.getDate());
                    }
                    else if (scope.settings.currentView === 'year') {
                        scope.date.display = new Date(display.getFullYear() - 1, display.getMonth(), display.getDate());
                    }
                    generateCurrentView();
                }

                function nextRange() {
                    var display = scope.date.display;
                    if (scope.settings.currentView === 'month') {
                        scope.date.display = new Date(display.getFullYear(), display.getMonth() + 1, display.getDate());
                    }
                    else if (scope.settings.currentView === 'year') {
                        scope.date.display = new Date(display.getFullYear() + 1, display.getMonth(), display.getDate());
                    }
                    generateCurrentView();
                }

                function previousViewType() {
                    if (scope.settings.currentView === 'time' && scope.settings.datePicker) {
                        scope.settings.currentView = 'month';
                        generateCurrentView();
                    }
                    else if (scope.settings.currentView === 'month') {
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
                    if (minDateCompare(date) || maxDateCompare(date)) {
                        return;
                    }

                    if (scope.date.selected) {
                        var previousDate = scope.date.selected;
                        scope.date.selected = new Date(
                            date.getFullYear(),
                            date.getMonth(),
                            date.getDate(),
                            previousDate.getHours(),
                            previousDate.getMinutes());
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

                    if (scope.settings.currentView === 'year') {
                        generateYearView(date);
                    }
                    else if (scope.settings.currentView === 'month') {
                        generateMonthView(date);
                    }
                    else if (scope.settings.currentView === 'time') {
                        generateTimeView(date);
                    }
                }

                function generateTimeView(date) {
                    if (!scope.settings.timePicker) {
                        return;
                    }

                    if (!scope.date.selected) {
                        var now = new Date();
                        scope.date.selected = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0);
                    }
                    scope.date.hour = scope.date.selected.getHours();
                    scope.date.minute = scope.date.selected.getMinutes();
                }

                function generateMonthView(date) {
                    scope.weeks = [];
                    var days = [];
                    var i;
                    var firstDateInMonth = new Date(date.getFullYear(), date.getMonth(), 1);
                    var numberOfDaysInMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
                    var workingDate;
                    var startingDay = firstDateInMonth.getDay();
                    var counter = 1;

                    //#region Get dates before current month
                    if (startingDay > 0) {
                        workingDate = new Date(firstDateInMonth);
                        workingDate.setDate(firstDateInMonth.getDate() - startingDay);

                        for (i = 0; i < startingDay; i++) {

                            if (counter > 7) {
                                counter = 1;
                                scope.weeks.push(days);
                                days = [];
                            }

                            days.push({
                                date: new Date(workingDate),
                                day: workingDate.getDate(),
                                otherMonth: true,
                                now: matchingDates(workingDate, new Date()),
                                selected: matchingDates(workingDate, scope.date.selected)
                            });
                            counter++;
                            workingDate.setDate(workingDate.getDate() + 1);
                        }
                    }
                    //#endregion

                    //#region Get dates in current month
                    workingDate = firstDateInMonth;
                    for (i = 0; i < numberOfDaysInMonth; i++) {

                        if (counter > 7) {
                            counter = 1;
                            scope.weeks.push(days);
                            days = [];
                        }

                        days.push({
                            date: new Date(workingDate),
                            day: workingDate.getDate(),
                            otherMonth: false,
                            now: matchingDates(workingDate, new Date()),
                            selected: matchingDates(workingDate, scope.date.selected)
                        });
                        counter++;
                        workingDate.setDate(workingDate.getDate() + 1);
                    }
                    //#endregion

                    //#region Get dates after current month
                    var endOfMonth = new Date(workingDate);
                    endOfMonth.setDate(workingDate.getDate() - 1);

                    if (endOfMonth.getDay() < 7) {
                        for (i = endOfMonth.getDay() ; i < 6 ; i++) {

                            days.push({
                                date: new Date(workingDate),
                                day: workingDate.getDate(),
                                otherMonth: true,
                                now: matchingDates(workingDate, new Date()),
                                selected: matchingDates(workingDate, scope.date.selected)
                            });
                            workingDate.setDate(workingDate.getDate() + 1);
                        }
                    }
                    //#endregion

                    scope.weeks.push(days);
                }

                function generateYearView(date) {
                    var counter = 0;
                    scope.months = [];
                    var monthGroup = [];
                    var now = new Date();

                    angular.forEach(scope.monthNames, function (month, $index) {

                        var isNow = false;
                        if (now.getFullYear() === date.getFullYear() && now.getMonth() === $index) {
                            isNow = true;
                        }

                        var isSelected = false;
                        if (scope.date.selected &&
                            scope.date.selected.getFullYear() === date.getFullYear() &&
                            scope.date.selected.getMonth() === $index) {
                            isSelected = true;
                        }

                        var monthObject = {
                            name: month,
                            number: $index,
                            year: date.getFullYear(),
                            now: isNow,
                            selected: isSelected
                        };

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

                //#region Process directive settings
                function getArgumentSettings() {
                    // Disable TimePicker
                    var dateOnly = attrs['dateOnly'];
                    if (dateOnly !== undefined) {
                        scope.settings.timePicker = false;
                    }

                    // Disable DatePicker
                    var timeOnly = attrs['timeOnly'];
                    if (timeOnly !== undefined) {
                        scope.settings.datePicker = false;
                    }

                    if (!scope.settings.timePicker && !scope.settings.datePicker) {
                        throw 'tower-datetime-picker: The date picker and time picker cannot both be deactivated.';
                    }
                    else if (scope.settings.timePicker && !scope.settings.datePicker) {
                        scope.settings.defaultView = 'time';
                    }

                    // Show Clear Model Button
                    var showClearButton = attrs['showClearButton'];
                    if (showClearButton !== undefined) {
                        scope.settings.showClearButton = true;
                    }

                    // AutoClose
                    var autoClose = attrs['dateAutoclose'];
                    if (autoClose !== undefined) {
                        scope.settings.autoClose = true;
                    }
                }

                //#region Watch min and max dates
                scope.$watch('minDate', function () {
                    var minDateTest = Date.parse(scope.minDate);
                    if (!isNaN(minDateTest)) {
                        scope.settings.minDate = new Date(scope.minDate);
                        if (minDateCompare(scope.ngModel)) {
                            scope.ngModel = undefined;
                        }
                    }
                    else {
                        scope.settings.minDate = undefined;
                    }
                });

                scope.$watch('maxDate', function () {
                    var maxDateTest = Date.parse(scope.maxDate);
                    if (!isNaN(maxDateTest)) {
                        scope.settings.maxDate = new Date(scope.maxDate);
                        if (maxDateCompare(scope.ngModel)) {
                            scope.ngModel = undefined;
                        }
                    }
                    else {
                        scope.settings.maxDate = undefined;
                    }
                });
                //#endregion
                //#endregion

                function updateNgModel() {
                    scope.ngModel = scope.date.selected;
                }

                function clearModel() {
                    scope.date.selected = undefined;
                    updateNgModel();
                    hidePicker();
                }

                //Checks if dates match while ignoring time
                function matchingDates(date1, date2) {
                    if (date1 && date2) {
                        if (date1.getFullYear() === date2.getFullYear() &&
                            date1.getMonth() === date2.getMonth() &&
                            date1.getDate() === date2.getDate()) {
                            return true;
                        }
                    }
                    return false;
                }

                function minDateCompare(date) {
                    if (!scope.minDate) {
                        return false;
                    }
                    var minDate = new Date(scope.minDate.getFullYear(), scope.minDate.getMonth(), scope.minDate.getDate() - 1, 23, 59, 59);
                    if (date < minDate) {
                        return true;
                    }
                    return false;
                }

                function maxDateCompare(date) {
                    if (!scope.maxDate) {
                        return false;
                    }
                    var maxDate = new Date(scope.maxDate.getFullYear(), scope.maxDate.getMonth(), scope.maxDate.getDate(), 23, 59, 59);
                    if (date > maxDate) {
                        return true;
                    }
                    return false;
                }
            }
        };
    }

    //=include templates.js
    // @ifdef DEVELOPMENT
    angular
        .module('twrDatetimePicker')
        .run(addTemplate);

    addTemplate.$inject = ['$templateCache', '$http'];

    function addTemplate($templateCache, $http) {
        $templateCache.put('twrDatetimePicker.html', $http.get('../src/twrDatetimePicker.html'));
    }
    // @endif
})();