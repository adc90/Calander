/* 
    Title: Calendar WIDGET
    Author: Aaron Clevenger
    DESC: Calendar widget for use in planning
    Goals:
        [%5] 1) Move away from reliance on bootstrap for layout
        [%0] 2) Server side date loading, mock up a loading type for this
        [%0] 3) Make the interface friendly to Knockout, Angular, Ember, React and other MVC frameworks
        [%0] 4) Try to limit dependencies to Jquery and Collections (maybe delete dependency on collections)
        [%0] 5) Ability to create date ranges
        [%0] 6) Sensible defaults, but allow users to feed the table JSON and customize the look
        [%0] 7) Make events bubble up through the DOM, (On month change, date change, etc)
        [%0] 8) Set dates that cannot be chosen, ability to create ranges that cannot overlap.
        [%0] 9) Further create rules that are easy to set up in JSON where one date range cannot overlap with another, but can with another
        [%0] 10) Create calendar in such a way that it's mobile friendly, or atleast has scroll bars
        [%0] 11) Make interactive with the keyboard. Ex: Shift click to set a date range
        [%0] 12) Similar to 11 make the widget work well with mobile devices.
        [%0] 13) Try to limit as much as possible sub windows and modals as design choices.
        [%0] 14) Use font icons, probably going to rely on font awesome, see about packaging inline, or even using unicode
        [%0] 15) Try to integrate a time componenet into this. I.E. double click on the date and see some information
    Notes: 
        * For loading information, we only have to keep in memory information that is relavant, so if we're given a date range 5-10-2015 - 5-15-2015 we only need to store the start and end date
        and redraw it as a range, rather than keep a date object with the range attached for each entry

*/
$(document).on('ready', function () {
    if (!String.format) {
        String.format = function (format) {
            var args = Array.prototype.slice.call(arguments, 1);
            return format.replace(/{(\d+)}/g, function (match, number) {
                return typeof args[number] != 'undefined'
                ? args[number]
                : match;
            });
        }
    }

    if (!Object.getKeyByValue) {
        Object.getKeyByValue = function (object, value) {
            for (var prop in object) { // If Object is not type of object throw error
                if (object.hasOwnProperty(prop)) {
                    if (object[prop] == value)
                        return prop;
                }
            }
        }
    }

    if (!Array.chunk) {
        Array.chunk = function (array, chunk) {
            var chunks = [];
            var i = 0;
            var n = array.length;
            while (i < n) {
                chunks.push(array.slice(i, i += chunk));
            }
            return chunks;
        }
    }

    //Months 'enum'
    var Months = {
        'January': 0,
        'Febuary': 1,
        'March': 2,
        'April': 3,
        'May': 4,
        'June': 5,
        'July': 6,
        'August': 7,
        'September': 8,
        'October': 9,
        'November': 10,
        'December': 11
    };

    //Days 'enum'
    var Days = {
        'Sunday': 0,
        'Monday': 1,
        'Tuesday': 2,
        'Wendesday': 3,
        'Thursday': 4,
        'Friday': 5,
        'Saturday': 6,
    };

    var ObjectDefinitions = {
        DateRange: ['id', 'startDate', 'endDate'],
    }

    function CalendarService() { };

    CalendarService.prototype.getNumberOfDaysInMonth = function (month, year) {
        return new Date(year, ++month, 0).getDate();
    }

    CalendarService.prototype.getFirstDayInMonth = function (month, year) {
        return Object.getKeyByValue(Days, new Date(year, month, 1).getDay());
    }

    CalendarService.prototype.dateToString = function (date) {
        if (date instanceof Date) {
            var month = date.getMonth() == 11 ? 0 : date.getMonth() + 1;
            return String.format("{0}-{1}-{2}", date.getFullYear(), month, date.getDate());
        }
        else {
            throw new Error(String.format("{0} is not a valid date", date));
        }
    };
    CalendarService.prototype.getCalendarArray = function (month, year) {
        var monthArray = [];                                        //Main array for the month
        var daysInMonth = this.getNumberOfDaysInMonth(month, year); //Days in the current month
        var firstDayOfMonth = this.getFirstDayInMonth(month, year); //First day of the month (Friday -> 6)
        var firstDateOfMonth = Days[firstDayOfMonth];               //First date of the month (6 -> Friday)
        var startDatePreviousMonth = undefined;                     //Days to subtract from the begining of the month;
        var daysInPreviousMonth = undefined;                        //Number of days in the previous month (month - 1)

        var yearOfPreviousMonth = month == 0
            ? yearOfPreviousMonth = (parseInt(year) - 1).toString()
            : year;
        var previousMonth = month == 0
            ? 11
            : month - 1;
        var subsequentMonth = month == 11
            ? 1
            : month + 1;
        var subsequentYear = month == 11
            ? (parseInt(year) + 1).toString()
            : year;

        daysInPreviousMonth = _calendarSvc.getNumberOfDaysInMonth((previousMonth), yearOfPreviousMonth);
        startDatePreviousMonth = firstDateOfMonth == 0
            ? (daysInPreviousMonth - 6)
            : daysInPreviousMonth - (firstDateOfMonth - 1);

        for (var i = startDatePreviousMonth; i <= daysInPreviousMonth ; i++) {
            monthArray.push(String.format("{0}-{1}-{2}", yearOfPreviousMonth, (previousMonth + 1), i));
        }
        for (var i = 1; i <= daysInMonth; i++) {
            monthArray.push(String.format("{0}-{1}-{2}", year, (month + 1), i));
        }
        var remainingDays = 42 - monthArray.length;
        for (var i = 1; i <= remainingDays; i++) {
            monthArray.push(String.format("{0}-{1}-{2}", subsequentYear, (subsequentMonth), i));
        }

        return Array.chunk(monthArray, 7);
    };

    CalendarService.prototype.dateRangesOverlap = function (rangeA, rangeB) {
        rangeA = new Date(rangeA);
        rangeB = new Date(rangeB);
    };

    CalendarService.prototype.dateInRange = function (range, date) {

    };

    var _calendarSvc = new CalendarService();

    function CalendarEventStore() {
        this.Events = undefined;
    };

    //We go through the event ranges and store those in the month array, 
    //so when we go through and check we know if the month has any active events, if not we skip any extra redrawing
    CalendarEventStore.prototype.setEvents = function (events) {
        var dateRanges = events.dateRanges;
        console.log(dateRanges);
        var events = [];
        for (var i = 0; i < dateRanges.length; i++) {
            var startDt = new Date(dateRanges[i].startDate);
            var endDt = new Date(dateRanges[i].endDate);
            startDt.setDate(1);
            endDt.setDate(1);
        }
    };

    CalendarEventStore.prototype.checkEventStore = function (date) {

    }

    var _eventStore = new CalendarEventStore();

    var calendar = function Calendar(element, options) {
        console.log(options);
        this.options = options;
        _eventStore.setEvents(options);
        this.currentDate = new Date(options.startDate);
        this.selectedDate = new Date(options.startDate);
        this.dateRanges = options.dateRanges;
        this.datesDisabled = options.datesDisabled;
        this.$calendar = $(element);
        this.init(options);
    };

    //Ref goal #6
    calendar.DEFAULT_OPTIONS = {
        height: 500,
        width: 500,
        highlightCurrentDate: false,
        onClickCell: function (e, cell, idx) {
            console.log(arguments);
            cell.toggleClass('calendar-cell-selected');
            //console.log('You selected: ' + new Date(idx));
        },
    };

    //Make private
    calendar.prototype.init = function (options) {
        var self = this;
        this.initilizeContainer(options.startDate, this.$calendar);
        this.redrawCalendar();
    };

    calendar.prototype.redrawCalendar = function () {
        var currentMonth = Object.getKeyByValue(Months, this.currentDate.getMonth());
        $('#month-title').text(currentMonth + " " + this.currentDate.getFullYear());
        var calendarArray = _calendarSvc.getCalendarArray(this.currentDate.getMonth(), this.currentDate.getFullYear());
        calendarArray = [].concat.apply([], calendarArray); //Concat into a new array.
        var dateCells = $('.seven-cols .calendar-cell:not(".seven-cols:first-child .calendar-cell")'); //Get all the calendar-cells except the first row, which are the dates
        $.each(dateCells, function (i, v) {
            var $cell = $(v);
            _eventStore.checkEventStore(calendarArray[i]);
            $cell.data('date', calendarArray[i]);
            $cell.text(calendarArray[i].split('-')[2]);
        });
    }

    calendar.prototype.nextMonth = function () {
        var nextMonth = this.currentDate.getMonth() + 1;
        this.currentDate.setMonth(nextMonth);
        this.redrawCalendar();
    }

    calendar.prototype.previousMonth = function () {
        var previousMonth = this.currentDate.getMonth() - 1;
        this.currentDate.setMonth(previousMonth);
        this.redrawCalendar();
    }

    //TODO: This should ONLY be responsible for drawing the container, nothing else any subsequent styles should be handled through a redraw
    calendar.prototype.initilizeContainer = function (startDate, $calendar) {
        startDate = new Date(startDate);

        var currentMonth = Object.getKeyByValue(Months, startDate.getMonth());
        var calendarArray = _calendarSvc.getCalendarArray(startDate.getMonth(), startDate.getFullYear().toString());

        var html = [];
        html.push('<div>');
        html.push(String.format('<div class="col-md-offset-6"><b id="month-title">{0} {1}</b></div>', currentMonth, this.currentDate.getFullYear()));
        html.push('</div>');
        html.push('<div class="calendar-container">');
        html.push('<div class="seven-cols">');
        for (var i in Days) {
            html.push(String.format('<span class="col-md-1 calendar-cell">{0}</span>', i));
        }
        html.push('</div>');
        Collections.ToCollection(calendarArray)
            .ForEach(function (idx, val) {
                html.push('<div class="seven-cols">');
                for (var i = 0; i < val.length; i++) {
                    html.push(
                        String.format('<span class="col-md-1 calendar-cell" data-date="{0}">{1}</span>',
                            val[i],
                            new Date(val[i]).getDate()
                        )
                    );
                }
                html.push('</div>');
            });
        html.push('</div>');
        $calendar.append(html.join(''));
    }

    $.fn.calendar = function (options) {
        var bsCalendar = new calendar(this, options);
        //Return the interface for intereacting with the calendar here.

        return bsCalendar;
    };

    //methods
    //Change date
    //Change month
    //Change year
    //Set disabled
    //Set enabled
    //Foward a month, back a month
    //Set date event (where does this live?)
    //Feed in list of holidays

    $(document).on('click', '.calendar-cell', function (event) {
        calendar.DEFAULT_OPTIONS.onClickCell(event, $(this), $(this).data('date'));
    });

});
