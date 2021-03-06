﻿    //Simple library for doing array based operations on list of javascript objects, draws a lot from LINQ
    var Collections = function(array) {
        this.collection = array;
    };

    //Adding this to the array prototype breaks bootstrap table. 
    Collections.ToCollection = function (array) {
        return new Collections(array);
    };

    Collections.prototype.Collect = function () {
        return this.collection;
    };

    Collections.prototype.Where = function (predicate) {
        var results = [];
        for (var i = 0; i < this.collection.length; i++) {
            if (predicate(this.collection[i])) {
                results.push(this.collection[i]);
            }
        }
        this.collection = results;
        return this;
    };

    Collections.prototype.First = function (predicate) {
        if (predicate === undefined) {
            return this.collection[0];
        }
        for (var i = 0; i < this.collection.length; i++) {
            if (predicate(this.collection[i])) {
                return this.collection[i];
            }
        }
        return null;
    };

    //javascripts map does the same thing more or less
    Collections.prototype.Select = function (valueSelector) {
        var result = [];
        for (var i = 0; i < this.collection.length; i++) {
            result.push(valueSelector(this.collection[i]));
        }
        this.collection = result;
        return this;
    };

    Collections.prototype.Count = function (predicate) {
        if (predicate === undefined) {
            return this.collection.length;
        }
        var cnt = 0;
        for (var i = 0; i < this.collection.length; i++) {
            if (predicate(this.collection[i])) {
                cnt++;
            }
        }
        return cnt;
    };

    Collections.prototype.All = function (predicate) {
        for (var i = 0; i < this.collection.length; i++) {
            if (!predicate(this.collection[i])) {
                return false;
            }
        }
        return true;
    };

    Collections.prototype.Any = function (predicate) {
        for (var i = 0; i < this.collection.length; i++) {
            if (predicate(this.collection[i])) {
                return true;
            }
        }
        return false;
    };

    Collections.prototype.GroupBy = function (keyFunction) {
        var groups = {};
        for (var i = 0; i < this.collection.length; i++) {
            var key = keyFunction(this.collection[i]);
            if (key in groups === false) {
                groups[key] = [];
            }
            groups[key].push(this.collection[i]);

        }
        this.collection = Object.keys(groups).map(function (key) {
            return {
                key: key,
                values: groups[key]
            };
        });
        return this;
    };

    Collections.prototype.OrderBy = function (orderSelector) {
        this.collection = this.collection.sort(function (a, b) {
            return orderSelector(a) > orderSelector(b);
        });
        return this;
    };

    Collections.prototype.OrderByDescending = function (orderSelector) {
        this.collection = this.collection.sort(function (a, b) {
            return orderSelector(a) < orderSelector(b);
        });
        return this;
    };

    Collections.prototype.Join = function (collection2, compareFunction) {

    };


    Collections.prototype.Without = function (predicate) {
        var result = [];
        for (var i = 0; i < this.collection.length; i++) {
            if (!predicate(this.collection[i])) {
                result.push(this.collection[i]);
            }
        }
        this.collection = result;
        return this;
    };

    Collections.prototype.Distinct = function (valueSelector) {
        var result = [];

        return this;
    };

    Collections.prototype.Sum = function (valueSelector) {
        var sum = 0;
        for (var i = 0; i < this.collection.length; i++) {
            sum += valueSelector(this.collection[i]);
        }
        return sum;
    };

    Collections.prototype.Min = function (valueSelector) {
        var len = this.collection.length;
        var min = Infinity;

        while (len--) {
            if (Number(valueSelector(this.collection[len])) < min) {
                min = Number(valueSelector(this.collection[len]));
            }
        }
        return min;
    };

    Collections.prototype.ForEach = function (action) {
        for (var i = 0; i < this.collection.length; i++) {
            action(i, this.collection[i]);
        }
    };

    Collections.prototype.Max = function (valueSelector) {
        var len = this.collection.length;
        var max = -Infinity;
        while (len--) {
            if (Number(valueSelector(this.collection[len])) > max) {
                max = Number(valueSelector(this.collection[len]));
            }
        }
        return max;
    };

    Collections.prototype.Skip = function (times) {
        return this.collection.slice(times);
    };

    Collections.prototype.Contains = function (item) {
        this.collection.indexOf(item) > -1;
    };

    /* Static methods not refering to the interal collection */
    Collections.Do = function (times, action) {
        if (typeof action !== 'function') {
            throw new Error('The predicate must be passed a function that returns a boolean');
        }
        for (var i = 0; i < times; i++) {
            action();
        }
    };

    Collections.Range = function (min, max, step) {
        step = step === undefined ? 1 : step;
        var array = [];
        for (var i = min; i <= max; i += step) {
            array.push(i);
        }
        return array;
    };

    Collections.Flatten = function (array) {
        return [].concat.apply([], array);
    }

    Collections.Remove = function (array, itm) {
        var index = array.indexOf(itm);
        array.splice(index);
        return array;
    };