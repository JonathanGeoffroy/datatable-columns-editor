(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/**
 * Filters is a component that manages a list of filters object inside
 * a datatable header row.
 *
 * This constructor binds listeners to various datatable events.
 *
 * @param settings {Object} settings object used to create the datatable
 */
var ColumnsEditor = function (settings) {
    this.tableAPI = new $.fn.dataTable.Api(settings);
    this.$header = $(this.tableAPI.table().header());

    var editors = settings.aoColumns.filter(function (column) {
        return column.editor;
    })
    .map(function (param) {
        var options = $.extend({
            column: param.idx,
            property: param.data
        }, param.editor);

        return this.builders[param.editor.type](options);
    }, this);

    if(editors.length > 0) {
        this.editors = editors;
        this.tableAPI.on('init', this.onDataTableInit.bind(this));
    }
};

$.extend(ColumnsEditor.prototype, {

    /**
     * Array of filter constructor function. Each function
     * takes a setting object as its single parameter
     */
    builders: {},

    /**
     * Initializes the header HTML elements that will be used to hold the filters.
     * It also registers the main event handler that will react to the filters'
     * value changes.
     *
     * The event name is <b>filterChange</b>. This event must be triggered by the
     * filters when their value is modified by the user (or any other event that
     * should trigger a datatable filter).
     *
     * @returns {Filters}
     */
    setupHeaderRow: function () {
        this.editors.forEach(function (editor) {
            editor.init($(this.tableAPI.column(editor.column).header()));
            editor.register($.proxy(this.transformValues, this));
        }, this);

        return this;
    },

    /**
     * Redraws the datatable
     *
     * @returns {Filters}
     */
    drawTable: function () {
        this.tableAPI.draw();

        return this;
    },

    /**
     * Actions to execute when the datatable is done initializing.
     * Creates the filter header row, registers ajax listeners and
     * renders filters
     *
     * @returns {Filters}
     */
    onDataTableInit: function () {
        this.setupHeaderRow();

        return this;
    },

    transformValues: function (event, params) {
        var newValues = params.editor.transformValues(this.tableAPI.data().toArray());
        this.tableAPI.clear().rows.add(newValues);
        this.drawTable();

        return this;
    }
});

$(document).on('preInit.dt', function (e, settings) {
    new ColumnsEditor(settings);
});

module.exports = ColumnsEditor;

},{}],2:[function(require,module,exports){
(function (global){
'use strict';

var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);

var BaseEditor = {
    init: function ($header) {
        var self = this;
        this.$dom = $header;

        var editButton = $('<button/>', {
            'class': 'btn btn-link pull-right columns-edit-button'
        });
        editButton.append($('<img/>', $.extend({
                src: '../img/edit.png'
            }, this.editButtonAttrs)
        ));

        var editor = this.create();

        this.$dom
            .append(editButton)
            .append(editor);

        editButton.click(function (e) {
            e.preventDefault();
            e.stopPropagation();
            self.open();
            self.notifyOpen();
        });
    },

    create: function () {},

    open: function () {
        $('.columns-edit-button', this.$dom).hide();
        $('.columns-editor', this.$dom).show();
    },

    close: function () {
        $('.columns-editor', this.$dom).hide();
        $('.columns-edit-button', this.$dom).show();
    },

    notifyOpen: function () {},

    notifyChange: function () {
        this.onValueChanged();
        this.close();
        this.$dom.trigger('update.editors.dt', {
            editor: this
        });
    },

    onValueChanged: function () {},

    register: function (callback) {
        this.$dom.on('update.editors.dt', callback);
    },

    transformValue: function (oldValue, cell, cellIndex) {
        return oldValue;
    }
};

module.exports = BaseEditor;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],3:[function(require,module,exports){
(function (global){
'use strict';

var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
var BaseEditor = require('./baseEditor')
var ColumnsEditor = require('../columnsEditor');

var ButtonEditor = $.extend({}, BaseEditor, {

    create: function () {
        var $button = $('<button/>', $.extend({
            'class': 'btn btn-default columns-editor-button',
            'text': 'click-me',
        }, this.buttonAttrs));

        // FIXME: Code duplication
        var $editor = $('<span/>', {
            'class': 'pull-right columns-editor'
        })
        .append($button)
        .hide();

        var label = this.$dom.text();
        this.$dom.html($('<span/>', {
            class: 'columns-header-label',
            text: label
        }))
        .append($editor);

        return this;
    },

    notifyOpen: function () {
        var self = this;

        $('.columns-editor-button', this.$dom)
            .one('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                this.onClick();
            }.bind(this));
    },

    onClick: function () {
        this.notifyChange();
    }
});

ColumnsEditor.prototype.builders.button = function(settings) {
  return $.extend({}, ButtonEditor, settings);
};

module.exports = ButtonEditor;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../columnsEditor":1,"./baseEditor":2}],4:[function(require,module,exports){
(function (global){
'use strict';

var $ = (typeof window !== "undefined" ? window['$'] : typeof global !== "undefined" ? global['$'] : null);
var BaseEditor = require('./baseEditor')
var ColumnsEditor = require('../columnsEditor');

var InputEditor = $.extend({}, BaseEditor, {

    create: function () {
        var $editorInput = $('<input/>', $.extend({
                'class': 'columns-editor-input'
            }, this.inputAttrs)
        );

        var $editorButton = $('<button/>', $.extend({
                'class': 'btn btn-default columns-editor-inputbutton',
                'text': 'OK'
            }, this.validateButtonAttrs)
        );

        var $editor = $('<span/>', {
            'class': 'pull-right columns-editor'
        })
        .append($editorInput)
        .append($editorButton)
        .hide();

        var label = this.$dom.text();
        this.$dom.html($('<span/>', {
            class: 'columns-header-label',
            text: label
        }))
        .append($editor);

        return this;
    },

    notifyOpen: function () {
        this.$editorInput = $('.columns-editor-input', this.$dom)
            // Prevent from sorting column when user clicks on input
            .click(function(event) {
                event.stopPropagation();
            })
            .keypress(function (event) {
                event.stopPropagation();
                switch (event.key) {
                    case 'Escape':
                        this.close();
                        break;
                    case 'Enter':
                        this.notifyChange();
                        break;
                }
            }.bind(this))
            .focus();

        $('.columns-editor-inputbutton', this.$dom)
            .one('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                this.notifyChange();
            }.bind(this));
    },

    transformValues: function (dataRows) {
        var newValue = this.$dom.find(':input').val();

        return dataRows.map(function (row, index) {
            if(this.canChangeValue(row[this.property], index, row)) {
                row[this.property] = newValue;
            }

            return row;
        }.bind(this));
    },

    canChangeValue: function (value, columnIndex, row) {
        return true;
    }
});

ColumnsEditor.prototype.builders.input = function(settings) {
  return $.extend({}, InputEditor, settings);
};

module.exports = InputEditor;

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{"../columnsEditor":1,"./baseEditor":2}],5:[function(require,module,exports){
'use strict';

require('./editor/baseEditor');
require('./editor/input');
require('./editor/button');
require('./columnsEditor');

},{"./columnsEditor":1,"./editor/baseEditor":2,"./editor/button":3,"./editor/input":4}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9jb2x1bW5zRWRpdG9yLmpzIiwianMvZWRpdG9yL2Jhc2VFZGl0b3IuanMiLCJqcy9lZGl0b3IvYnV0dG9uLmpzIiwianMvZWRpdG9yL2lucHV0LmpzIiwianMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDbEdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNqRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0JztcclxuXHJcbi8qKlxyXG4gKiBGaWx0ZXJzIGlzIGEgY29tcG9uZW50IHRoYXQgbWFuYWdlcyBhIGxpc3Qgb2YgZmlsdGVycyBvYmplY3QgaW5zaWRlXHJcbiAqIGEgZGF0YXRhYmxlIGhlYWRlciByb3cuXHJcbiAqXHJcbiAqIFRoaXMgY29uc3RydWN0b3IgYmluZHMgbGlzdGVuZXJzIHRvIHZhcmlvdXMgZGF0YXRhYmxlIGV2ZW50cy5cclxuICpcclxuICogQHBhcmFtIHNldHRpbmdzIHtPYmplY3R9IHNldHRpbmdzIG9iamVjdCB1c2VkIHRvIGNyZWF0ZSB0aGUgZGF0YXRhYmxlXHJcbiAqL1xyXG52YXIgQ29sdW1uc0VkaXRvciA9IGZ1bmN0aW9uIChzZXR0aW5ncykge1xyXG4gICAgdGhpcy50YWJsZUFQSSA9IG5ldyAkLmZuLmRhdGFUYWJsZS5BcGkoc2V0dGluZ3MpO1xyXG4gICAgdGhpcy4kaGVhZGVyID0gJCh0aGlzLnRhYmxlQVBJLnRhYmxlKCkuaGVhZGVyKCkpO1xyXG5cclxuICAgIHZhciBlZGl0b3JzID0gc2V0dGluZ3MuYW9Db2x1bW5zLmZpbHRlcihmdW5jdGlvbiAoY29sdW1uKSB7XG4gICAgICAgIHJldHVybiBjb2x1bW4uZWRpdG9yO1xuICAgIH0pXG4gICAgLm1hcChmdW5jdGlvbiAocGFyYW0pIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSAkLmV4dGVuZCh7XHJcbiAgICAgICAgICAgIGNvbHVtbjogcGFyYW0uaWR4LFxyXG4gICAgICAgICAgICBwcm9wZXJ0eTogcGFyYW0uZGF0YVxyXG4gICAgICAgIH0sIHBhcmFtLmVkaXRvcik7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzLmJ1aWxkZXJzW3BhcmFtLmVkaXRvci50eXBlXShvcHRpb25zKTtcclxuICAgIH0sIHRoaXMpO1xyXG5cclxuICAgIGlmKGVkaXRvcnMubGVuZ3RoID4gMCkge1xyXG4gICAgICAgIHRoaXMuZWRpdG9ycyA9IGVkaXRvcnM7XHJcbiAgICAgICAgdGhpcy50YWJsZUFQSS5vbignaW5pdCcsIHRoaXMub25EYXRhVGFibGVJbml0LmJpbmQodGhpcykpO1xyXG4gICAgfVxyXG59O1xyXG5cclxuJC5leHRlbmQoQ29sdW1uc0VkaXRvci5wcm90b3R5cGUsIHtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEFycmF5IG9mIGZpbHRlciBjb25zdHJ1Y3RvciBmdW5jdGlvbi4gRWFjaCBmdW5jdGlvblxyXG4gICAgICogdGFrZXMgYSBzZXR0aW5nIG9iamVjdCBhcyBpdHMgc2luZ2xlIHBhcmFtZXRlclxyXG4gICAgICovXHJcbiAgICBidWlsZGVyczoge30sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBJbml0aWFsaXplcyB0aGUgaGVhZGVyIEhUTUwgZWxlbWVudHMgdGhhdCB3aWxsIGJlIHVzZWQgdG8gaG9sZCB0aGUgZmlsdGVycy5cclxuICAgICAqIEl0IGFsc28gcmVnaXN0ZXJzIHRoZSBtYWluIGV2ZW50IGhhbmRsZXIgdGhhdCB3aWxsIHJlYWN0IHRvIHRoZSBmaWx0ZXJzJ1xyXG4gICAgICogdmFsdWUgY2hhbmdlcy5cclxuICAgICAqXHJcbiAgICAgKiBUaGUgZXZlbnQgbmFtZSBpcyA8Yj5maWx0ZXJDaGFuZ2U8L2I+LiBUaGlzIGV2ZW50IG11c3QgYmUgdHJpZ2dlcmVkIGJ5IHRoZVxyXG4gICAgICogZmlsdGVycyB3aGVuIHRoZWlyIHZhbHVlIGlzIG1vZGlmaWVkIGJ5IHRoZSB1c2VyIChvciBhbnkgb3RoZXIgZXZlbnQgdGhhdFxyXG4gICAgICogc2hvdWxkIHRyaWdnZXIgYSBkYXRhdGFibGUgZmlsdGVyKS5cclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7RmlsdGVyc31cclxuICAgICAqL1xyXG4gICAgc2V0dXBIZWFkZXJSb3c6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLmVkaXRvcnMuZm9yRWFjaChmdW5jdGlvbiAoZWRpdG9yKSB7XHJcbiAgICAgICAgICAgIGVkaXRvci5pbml0KCQodGhpcy50YWJsZUFQSS5jb2x1bW4oZWRpdG9yLmNvbHVtbikuaGVhZGVyKCkpKTtcclxuICAgICAgICAgICAgZWRpdG9yLnJlZ2lzdGVyKCQucHJveHkodGhpcy50cmFuc2Zvcm1WYWx1ZXMsIHRoaXMpKTtcclxuICAgICAgICB9LCB0aGlzKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogUmVkcmF3cyB0aGUgZGF0YXRhYmxlXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge0ZpbHRlcnN9XHJcbiAgICAgKi9cclxuICAgIGRyYXdUYWJsZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMudGFibGVBUEkuZHJhdygpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBY3Rpb25zIHRvIGV4ZWN1dGUgd2hlbiB0aGUgZGF0YXRhYmxlIGlzIGRvbmUgaW5pdGlhbGl6aW5nLlxyXG4gICAgICogQ3JlYXRlcyB0aGUgZmlsdGVyIGhlYWRlciByb3csIHJlZ2lzdGVycyBhamF4IGxpc3RlbmVycyBhbmRcclxuICAgICAqIHJlbmRlcnMgZmlsdGVyc1xyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtGaWx0ZXJzfVxyXG4gICAgICovXHJcbiAgICBvbkRhdGFUYWJsZUluaXQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnNldHVwSGVhZGVyUm93KCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuXHJcbiAgICB0cmFuc2Zvcm1WYWx1ZXM6IGZ1bmN0aW9uIChldmVudCwgcGFyYW1zKSB7XG4gICAgICAgIHZhciBuZXdWYWx1ZXMgPSBwYXJhbXMuZWRpdG9yLnRyYW5zZm9ybVZhbHVlcyh0aGlzLnRhYmxlQVBJLmRhdGEoKS50b0FycmF5KCkpO1xyXG4gICAgICAgIHRoaXMudGFibGVBUEkuY2xlYXIoKS5yb3dzLmFkZChuZXdWYWx1ZXMpO1xyXG4gICAgICAgIHRoaXMuZHJhd1RhYmxlKCk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfVxyXG59KTtcclxuXHJcbiQoZG9jdW1lbnQpLm9uKCdwcmVJbml0LmR0JywgZnVuY3Rpb24gKGUsIHNldHRpbmdzKSB7XHJcbiAgICBuZXcgQ29sdW1uc0VkaXRvcihzZXR0aW5ncyk7XHJcbn0pO1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBDb2x1bW5zRWRpdG9yO1xyXG4iLCIndXNlIHN0cmljdCc7XHJcblxyXG52YXIgJCA9ICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93WyckJ10gOiB0eXBlb2YgZ2xvYmFsICE9PSBcInVuZGVmaW5lZFwiID8gZ2xvYmFsWyckJ10gOiBudWxsKTtcclxuXHJcbnZhciBCYXNlRWRpdG9yID0ge1xyXG4gICAgaW5pdDogZnVuY3Rpb24gKCRoZWFkZXIpIHtcclxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XHJcbiAgICAgICAgdGhpcy4kZG9tID0gJGhlYWRlcjtcclxuXHJcbiAgICAgICAgdmFyIGVkaXRCdXR0b24gPSAkKCc8YnV0dG9uLz4nLCB7XHJcbiAgICAgICAgICAgICdjbGFzcyc6ICdidG4gYnRuLWxpbmsgcHVsbC1yaWdodCBjb2x1bW5zLWVkaXQtYnV0dG9uJ1xyXG4gICAgICAgIH0pO1xyXG4gICAgICAgIGVkaXRCdXR0b24uYXBwZW5kKCQoJzxpbWcvPicsICQuZXh0ZW5kKHtcclxuICAgICAgICAgICAgICAgIHNyYzogJy4uL2ltZy9lZGl0LnBuZydcclxuICAgICAgICAgICAgfSwgdGhpcy5lZGl0QnV0dG9uQXR0cnMpXHJcbiAgICAgICAgKSk7XHJcblxyXG4gICAgICAgIHZhciBlZGl0b3IgPSB0aGlzLmNyZWF0ZSgpO1xyXG5cclxuICAgICAgICB0aGlzLiRkb21cclxuICAgICAgICAgICAgLmFwcGVuZChlZGl0QnV0dG9uKVxyXG4gICAgICAgICAgICAuYXBwZW5kKGVkaXRvcik7XHJcblxyXG4gICAgICAgIGVkaXRCdXR0b24uY2xpY2soZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICBzZWxmLm9wZW4oKTtcclxuICAgICAgICAgICAgc2VsZi5ub3RpZnlPcGVuKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGNyZWF0ZTogZnVuY3Rpb24gKCkge30sXHJcblxyXG4gICAgb3BlbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICQoJy5jb2x1bW5zLWVkaXQtYnV0dG9uJywgdGhpcy4kZG9tKS5oaWRlKCk7XHJcbiAgICAgICAgJCgnLmNvbHVtbnMtZWRpdG9yJywgdGhpcy4kZG9tKS5zaG93KCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGNsb3NlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJCgnLmNvbHVtbnMtZWRpdG9yJywgdGhpcy4kZG9tKS5oaWRlKCk7XHJcbiAgICAgICAgJCgnLmNvbHVtbnMtZWRpdC1idXR0b24nLCB0aGlzLiRkb20pLnNob3coKTtcclxuICAgIH0sXHJcblxyXG4gICAgbm90aWZ5T3BlbjogZnVuY3Rpb24gKCkge30sXHJcblxyXG4gICAgbm90aWZ5Q2hhbmdlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5vblZhbHVlQ2hhbmdlZCgpO1xyXG4gICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICB0aGlzLiRkb20udHJpZ2dlcigndXBkYXRlLmVkaXRvcnMuZHQnLCB7XHJcbiAgICAgICAgICAgIGVkaXRvcjogdGhpc1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICBvblZhbHVlQ2hhbmdlZDogZnVuY3Rpb24gKCkge30sXHJcblxyXG4gICAgcmVnaXN0ZXI6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xyXG4gICAgICAgIHRoaXMuJGRvbS5vbigndXBkYXRlLmVkaXRvcnMuZHQnLCBjYWxsYmFjayk7XHJcbiAgICB9LFxyXG5cclxuICAgIHRyYW5zZm9ybVZhbHVlOiBmdW5jdGlvbiAob2xkVmFsdWUsIGNlbGwsIGNlbGxJbmRleCkge1xyXG4gICAgICAgIHJldHVybiBvbGRWYWx1ZTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmFzZUVkaXRvcjtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XHJcbnZhciBCYXNlRWRpdG9yID0gcmVxdWlyZSgnLi9iYXNlRWRpdG9yJylcclxudmFyIENvbHVtbnNFZGl0b3IgPSByZXF1aXJlKCcuLi9jb2x1bW5zRWRpdG9yJyk7XHJcblxyXG52YXIgQnV0dG9uRWRpdG9yID0gJC5leHRlbmQoe30sIEJhc2VFZGl0b3IsIHtcclxuXHJcbiAgICBjcmVhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgJGJ1dHRvbiA9ICQoJzxidXR0b24vPicsICQuZXh0ZW5kKHtcclxuICAgICAgICAgICAgJ2NsYXNzJzogJ2J0biBidG4tZGVmYXVsdCBjb2x1bW5zLWVkaXRvci1idXR0b24nLFxyXG4gICAgICAgICAgICAndGV4dCc6ICdjbGljay1tZScsXHJcbiAgICAgICAgfSwgdGhpcy5idXR0b25BdHRycykpO1xyXG5cclxuICAgICAgICAvLyBGSVhNRTogQ29kZSBkdXBsaWNhdGlvblxyXG4gICAgICAgIHZhciAkZWRpdG9yID0gJCgnPHNwYW4vPicsIHtcclxuICAgICAgICAgICAgJ2NsYXNzJzogJ3B1bGwtcmlnaHQgY29sdW1ucy1lZGl0b3InXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuYXBwZW5kKCRidXR0b24pXHJcbiAgICAgICAgLmhpZGUoKTtcclxuXHJcbiAgICAgICAgdmFyIGxhYmVsID0gdGhpcy4kZG9tLnRleHQoKTtcclxuICAgICAgICB0aGlzLiRkb20uaHRtbCgkKCc8c3Bhbi8+Jywge1xyXG4gICAgICAgICAgICBjbGFzczogJ2NvbHVtbnMtaGVhZGVyLWxhYmVsJyxcclxuICAgICAgICAgICAgdGV4dDogbGFiZWxcclxuICAgICAgICB9KSlcclxuICAgICAgICAuYXBwZW5kKCRlZGl0b3IpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcblxyXG4gICAgbm90aWZ5T3BlbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuXHJcbiAgICAgICAgJCgnLmNvbHVtbnMtZWRpdG9yLWJ1dHRvbicsIHRoaXMuJGRvbSlcclxuICAgICAgICAgICAgLm9uZSgnY2xpY2snLCBmdW5jdGlvbiAoZSkge1xyXG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xyXG4gICAgICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIHRoaXMub25DbGljaygpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfSxcclxuXHJcbiAgICBvbkNsaWNrOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5ub3RpZnlDaGFuZ2UoKTtcclxuICAgIH1cclxufSk7XHJcblxyXG5Db2x1bW5zRWRpdG9yLnByb3RvdHlwZS5idWlsZGVycy5idXR0b24gPSBmdW5jdGlvbihzZXR0aW5ncykge1xyXG4gIHJldHVybiAkLmV4dGVuZCh7fSwgQnV0dG9uRWRpdG9yLCBzZXR0aW5ncyk7XHJcbn07XHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IEJ1dHRvbkVkaXRvcjtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XHJcbnZhciBCYXNlRWRpdG9yID0gcmVxdWlyZSgnLi9iYXNlRWRpdG9yJylcclxudmFyIENvbHVtbnNFZGl0b3IgPSByZXF1aXJlKCcuLi9jb2x1bW5zRWRpdG9yJyk7XHJcblxyXG52YXIgSW5wdXRFZGl0b3IgPSAkLmV4dGVuZCh7fSwgQmFzZUVkaXRvciwge1xyXG5cclxuICAgIGNyZWF0ZTogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciAkZWRpdG9ySW5wdXQgPSAkKCc8aW5wdXQvPicsICQuZXh0ZW5kKHtcclxuICAgICAgICAgICAgICAgICdjbGFzcyc6ICdjb2x1bW5zLWVkaXRvci1pbnB1dCdcclxuICAgICAgICAgICAgfSwgdGhpcy5pbnB1dEF0dHJzKVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHZhciAkZWRpdG9yQnV0dG9uID0gJCgnPGJ1dHRvbi8+JywgJC5leHRlbmQoe1xyXG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ2J0biBidG4tZGVmYXVsdCBjb2x1bW5zLWVkaXRvci1pbnB1dGJ1dHRvbicsXHJcbiAgICAgICAgICAgICAgICAndGV4dCc6ICdPSydcclxuICAgICAgICAgICAgfSwgdGhpcy52YWxpZGF0ZUJ1dHRvbkF0dHJzKVxyXG4gICAgICAgICk7XHJcblxyXG4gICAgICAgIHZhciAkZWRpdG9yID0gJCgnPHNwYW4vPicsIHtcclxuICAgICAgICAgICAgJ2NsYXNzJzogJ3B1bGwtcmlnaHQgY29sdW1ucy1lZGl0b3InXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuYXBwZW5kKCRlZGl0b3JJbnB1dClcclxuICAgICAgICAuYXBwZW5kKCRlZGl0b3JCdXR0b24pXHJcbiAgICAgICAgLmhpZGUoKTtcclxuXHJcbiAgICAgICAgdmFyIGxhYmVsID0gdGhpcy4kZG9tLnRleHQoKTtcclxuICAgICAgICB0aGlzLiRkb20uaHRtbCgkKCc8c3Bhbi8+Jywge1xyXG4gICAgICAgICAgICBjbGFzczogJ2NvbHVtbnMtaGVhZGVyLWxhYmVsJyxcclxuICAgICAgICAgICAgdGV4dDogbGFiZWxcclxuICAgICAgICB9KSlcclxuICAgICAgICAuYXBwZW5kKCRlZGl0b3IpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcblxyXG4gICAgbm90aWZ5T3BlbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHRoaXMuJGVkaXRvcklucHV0ID0gJCgnLmNvbHVtbnMtZWRpdG9yLWlucHV0JywgdGhpcy4kZG9tKVxyXG4gICAgICAgICAgICAvLyBQcmV2ZW50IGZyb20gc29ydGluZyBjb2x1bW4gd2hlbiB1c2VyIGNsaWNrcyBvbiBpbnB1dFxyXG4gICAgICAgICAgICAuY2xpY2soZnVuY3Rpb24oZXZlbnQpIHtcclxuICAgICAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICB9KVxyXG4gICAgICAgICAgICAua2V5cHJlc3MoZnVuY3Rpb24gKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgICAgIHN3aXRjaCAoZXZlbnQua2V5KSB7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnRXNjYXBlJzpcclxuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5jbG9zZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgICAgICBjYXNlICdFbnRlcic6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMubm90aWZ5Q2hhbmdlKCk7XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9LmJpbmQodGhpcykpXHJcbiAgICAgICAgICAgIC5mb2N1cygpO1xyXG5cclxuICAgICAgICAkKCcuY29sdW1ucy1lZGl0b3ItaW5wdXRidXR0b24nLCB0aGlzLiRkb20pXHJcbiAgICAgICAgICAgIC5vbmUoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICB0aGlzLm5vdGlmeUNoYW5nZSgpO1xyXG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xyXG4gICAgfSxcclxuXHJcbiAgICB0cmFuc2Zvcm1WYWx1ZXM6IGZ1bmN0aW9uIChkYXRhUm93cykge1xyXG4gICAgICAgIHZhciBuZXdWYWx1ZSA9IHRoaXMuJGRvbS5maW5kKCc6aW5wdXQnKS52YWwoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIGRhdGFSb3dzLm1hcChmdW5jdGlvbiAocm93LCBpbmRleCkge1xyXG4gICAgICAgICAgICBpZih0aGlzLmNhbkNoYW5nZVZhbHVlKHJvd1t0aGlzLnByb3BlcnR5XSwgaW5kZXgsIHJvdykpIHtcclxuICAgICAgICAgICAgICAgIHJvd1t0aGlzLnByb3BlcnR5XSA9IG5ld1ZhbHVlO1xyXG4gICAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgICByZXR1cm4gcm93O1xyXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGNhbkNoYW5nZVZhbHVlOiBmdW5jdGlvbiAodmFsdWUsIGNvbHVtbkluZGV4LCByb3cpIHtcclxuICAgICAgICByZXR1cm4gdHJ1ZTtcclxuICAgIH1cclxufSk7XHJcblxyXG5Db2x1bW5zRWRpdG9yLnByb3RvdHlwZS5idWlsZGVycy5pbnB1dCA9IGZ1bmN0aW9uKHNldHRpbmdzKSB7XHJcbiAgcmV0dXJuICQuZXh0ZW5kKHt9LCBJbnB1dEVkaXRvciwgc2V0dGluZ3MpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBJbnB1dEVkaXRvcjtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxucmVxdWlyZSgnLi9lZGl0b3IvYmFzZUVkaXRvcicpO1xyXG5yZXF1aXJlKCcuL2VkaXRvci9pbnB1dCcpO1xyXG5yZXF1aXJlKCcuL2VkaXRvci9idXR0b24nKTtcclxucmVxdWlyZSgnLi9jb2x1bW5zRWRpdG9yJyk7XHJcbiJdfQ==
