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

    var editors = [];
    settings.aoColumns.forEach(function (param, col) {
        if (param.editor) {
            var options = $.extend({
                column: col,
            }, param.editor);

            var editor = this.builders[param.editor.type](options);
            editors.push(editor);
        }
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
        this.tableAPI.cells(undefined, params.editor.column).every(function (index) {
            this.data(params.editor.transformValue(this.data(), this.node(), index));
        });
        this.tableAPI.draw(false);

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
                src: '../../img/edit.png'
            }, this.editButtonAttrs)
        ));

        var editor = this.create();

        this.$dom
            .append(editButton)
            .append(editor);

        editButton.click(function (e) {
            e.preventDefault();
            e.stopPropagation();
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
            'class': 'btn btn-default columns-editor-button'
        }, this.buttAttrs));

        // FIXME: Code duplication
        var label = this.$dom.text();
        this.$dom.html($('<span/>', {
            class: 'columns-header-label',
            text: label
        }))
        .append($button);

        return this;
    },

    notifyOpen: function () {
        var self = this;
        this.open();

        $('.columns-editor-button', this.$dom)
            .one('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                self.notifyChange();
                self.notifyClose();
            });
    },

    transformValue: function (value) {
        return value;
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
        var $editorInput = $('<input/>', {
            'class': 'columns-editor-input'
        });
        var $editorButton = $('<button/>',$.extend({
                'class': 'btn btn-default columns-editor-button',
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
        var self = this;
        this.open();
        this.$editorInput = $('.columns-editor-input', this.$dom)
            // Prevent from sorting column when user clicks on input
            .click(function(event) {
                event.stopPropagation();
            })
            .keypress(function (event) {
                event.stopPropagation();
                switch (event.key) {
                    case 'Escape':
                        self.close();
                        break;
                    case 'Enter':
                        self.notifyChange();
                        break;
                }
            })
            .focus();

        $('.columns-editor-button', this.$dom)
            .one('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
                self.notifyChange();
            });
    },

    transformValue: function (oldValue, cell, cellIndex) {
        return this.changeValue(oldValue, cell, cellIndex) ? this.$editorInput.val() : oldValue;
    },

    changeValue: function (oldValue, cell, cellIndex) {
        return $(cell).find('input').length > 0;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJqcy9jb2x1bW5zRWRpdG9yLmpzIiwianMvZWRpdG9yL2Jhc2VFZGl0b3IuanMiLCJqcy9lZGl0b3IvYnV0dG9uLmpzIiwianMvZWRpdG9yL2lucHV0LmpzIiwianMvbWFpbi5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7QUNuR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7QUNoRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7Ozs7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxuLyoqXHJcbiAqIEZpbHRlcnMgaXMgYSBjb21wb25lbnQgdGhhdCBtYW5hZ2VzIGEgbGlzdCBvZiBmaWx0ZXJzIG9iamVjdCBpbnNpZGVcclxuICogYSBkYXRhdGFibGUgaGVhZGVyIHJvdy5cclxuICpcclxuICogVGhpcyBjb25zdHJ1Y3RvciBiaW5kcyBsaXN0ZW5lcnMgdG8gdmFyaW91cyBkYXRhdGFibGUgZXZlbnRzLlxyXG4gKlxyXG4gKiBAcGFyYW0gc2V0dGluZ3Mge09iamVjdH0gc2V0dGluZ3Mgb2JqZWN0IHVzZWQgdG8gY3JlYXRlIHRoZSBkYXRhdGFibGVcclxuICovXHJcbnZhciBDb2x1bW5zRWRpdG9yID0gZnVuY3Rpb24gKHNldHRpbmdzKSB7XHJcbiAgICB0aGlzLnRhYmxlQVBJID0gbmV3ICQuZm4uZGF0YVRhYmxlLkFwaShzZXR0aW5ncyk7XHJcbiAgICB0aGlzLiRoZWFkZXIgPSAkKHRoaXMudGFibGVBUEkudGFibGUoKS5oZWFkZXIoKSk7XHJcblxyXG4gICAgdmFyIGVkaXRvcnMgPSBbXTtcclxuICAgIHNldHRpbmdzLmFvQ29sdW1ucy5mb3JFYWNoKGZ1bmN0aW9uIChwYXJhbSwgY29sKSB7XHJcbiAgICAgICAgaWYgKHBhcmFtLmVkaXRvcikge1xyXG4gICAgICAgICAgICB2YXIgb3B0aW9ucyA9ICQuZXh0ZW5kKHtcclxuICAgICAgICAgICAgICAgIGNvbHVtbjogY29sLFxyXG4gICAgICAgICAgICB9LCBwYXJhbS5lZGl0b3IpO1xyXG5cclxuICAgICAgICAgICAgdmFyIGVkaXRvciA9IHRoaXMuYnVpbGRlcnNbcGFyYW0uZWRpdG9yLnR5cGVdKG9wdGlvbnMpO1xyXG4gICAgICAgICAgICBlZGl0b3JzLnB1c2goZWRpdG9yKTtcclxuICAgICAgICB9XHJcbiAgICB9LCB0aGlzKTtcclxuXHJcbiAgICBpZihlZGl0b3JzLmxlbmd0aCA+IDApIHtcclxuICAgICAgICB0aGlzLmVkaXRvcnMgPSBlZGl0b3JzO1xyXG4gICAgICAgIHRoaXMudGFibGVBUEkub24oJ2luaXQnLCB0aGlzLm9uRGF0YVRhYmxlSW5pdC5iaW5kKHRoaXMpKTtcclxuICAgIH1cclxufTtcclxuXHJcbiQuZXh0ZW5kKENvbHVtbnNFZGl0b3IucHJvdG90eXBlLCB7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBBcnJheSBvZiBmaWx0ZXIgY29uc3RydWN0b3IgZnVuY3Rpb24uIEVhY2ggZnVuY3Rpb25cclxuICAgICAqIHRha2VzIGEgc2V0dGluZyBvYmplY3QgYXMgaXRzIHNpbmdsZSBwYXJhbWV0ZXJcclxuICAgICAqL1xyXG4gICAgYnVpbGRlcnM6IHt9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogSW5pdGlhbGl6ZXMgdGhlIGhlYWRlciBIVE1MIGVsZW1lbnRzIHRoYXQgd2lsbCBiZSB1c2VkIHRvIGhvbGQgdGhlIGZpbHRlcnMuXHJcbiAgICAgKiBJdCBhbHNvIHJlZ2lzdGVycyB0aGUgbWFpbiBldmVudCBoYW5kbGVyIHRoYXQgd2lsbCByZWFjdCB0byB0aGUgZmlsdGVycydcclxuICAgICAqIHZhbHVlIGNoYW5nZXMuXHJcbiAgICAgKlxyXG4gICAgICogVGhlIGV2ZW50IG5hbWUgaXMgPGI+ZmlsdGVyQ2hhbmdlPC9iPi4gVGhpcyBldmVudCBtdXN0IGJlIHRyaWdnZXJlZCBieSB0aGVcclxuICAgICAqIGZpbHRlcnMgd2hlbiB0aGVpciB2YWx1ZSBpcyBtb2RpZmllZCBieSB0aGUgdXNlciAob3IgYW55IG90aGVyIGV2ZW50IHRoYXRcclxuICAgICAqIHNob3VsZCB0cmlnZ2VyIGEgZGF0YXRhYmxlIGZpbHRlcikuXHJcbiAgICAgKlxyXG4gICAgICogQHJldHVybnMge0ZpbHRlcnN9XHJcbiAgICAgKi9cclxuICAgIHNldHVwSGVhZGVyUm93OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5lZGl0b3JzLmZvckVhY2goZnVuY3Rpb24gKGVkaXRvcikge1xyXG4gICAgICAgICAgICBlZGl0b3IuaW5pdCgkKHRoaXMudGFibGVBUEkuY29sdW1uKGVkaXRvci5jb2x1bW4pLmhlYWRlcigpKSk7XHJcbiAgICAgICAgICAgIGVkaXRvci5yZWdpc3RlcigkLnByb3h5KHRoaXMudHJhbnNmb3JtVmFsdWVzLCB0aGlzKSk7XHJcbiAgICAgICAgfSwgdGhpcyk7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuXHJcbiAgICAvKipcclxuICAgICAqIFJlZHJhd3MgdGhlIGRhdGF0YWJsZVxyXG4gICAgICpcclxuICAgICAqIEByZXR1cm5zIHtGaWx0ZXJzfVxyXG4gICAgICovXHJcbiAgICBkcmF3VGFibGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB0aGlzLnRhYmxlQVBJLmRyYXcoKTtcclxuXHJcbiAgICAgICAgcmV0dXJuIHRoaXM7XHJcbiAgICB9LFxyXG5cclxuICAgIC8qKlxyXG4gICAgICogQWN0aW9ucyB0byBleGVjdXRlIHdoZW4gdGhlIGRhdGF0YWJsZSBpcyBkb25lIGluaXRpYWxpemluZy5cclxuICAgICAqIENyZWF0ZXMgdGhlIGZpbHRlciBoZWFkZXIgcm93LCByZWdpc3RlcnMgYWpheCBsaXN0ZW5lcnMgYW5kXHJcbiAgICAgKiByZW5kZXJzIGZpbHRlcnNcclxuICAgICAqXHJcbiAgICAgKiBAcmV0dXJucyB7RmlsdGVyc31cclxuICAgICAqL1xyXG4gICAgb25EYXRhVGFibGVJbml0OiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5zZXR1cEhlYWRlclJvdygpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcblxyXG4gICAgdHJhbnNmb3JtVmFsdWVzOiBmdW5jdGlvbiAoZXZlbnQsIHBhcmFtcykge1xyXG4gICAgICAgIHRoaXMudGFibGVBUEkuY2VsbHModW5kZWZpbmVkLCBwYXJhbXMuZWRpdG9yLmNvbHVtbikuZXZlcnkoZnVuY3Rpb24gKGluZGV4KSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGF0YShwYXJhbXMuZWRpdG9yLnRyYW5zZm9ybVZhbHVlKHRoaXMuZGF0YSgpLCB0aGlzLm5vZGUoKSwgaW5kZXgpKTtcclxuICAgICAgICB9KTtcclxuICAgICAgICB0aGlzLnRhYmxlQVBJLmRyYXcoZmFsc2UpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH1cclxufSk7XHJcblxyXG4kKGRvY3VtZW50KS5vbigncHJlSW5pdC5kdCcsIGZ1bmN0aW9uIChlLCBzZXR0aW5ncykge1xyXG4gICAgbmV3IENvbHVtbnNFZGl0b3Ioc2V0dGluZ3MpO1xyXG59KTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQ29sdW1uc0VkaXRvcjtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XHJcblxyXG52YXIgQmFzZUVkaXRvciA9IHtcclxuICAgIGluaXQ6IGZ1bmN0aW9uICgkaGVhZGVyKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMuJGRvbSA9ICRoZWFkZXI7XHJcblxyXG4gICAgICAgIHZhciBlZGl0QnV0dG9uID0gJCgnPGJ1dHRvbi8+Jywge1xyXG4gICAgICAgICAgICAnY2xhc3MnOiAnYnRuIGJ0bi1saW5rIHB1bGwtcmlnaHQgY29sdW1ucy1lZGl0LWJ1dHRvbidcclxuICAgICAgICB9KTtcclxuICAgICAgICBlZGl0QnV0dG9uLmFwcGVuZCgkKCc8aW1nLz4nLCAkLmV4dGVuZCh7XHJcbiAgICAgICAgICAgICAgICBzcmM6ICcuLi8uLi9pbWcvZWRpdC5wbmcnXHJcbiAgICAgICAgICAgIH0sIHRoaXMuZWRpdEJ1dHRvbkF0dHJzKVxyXG4gICAgICAgICkpO1xyXG5cclxuICAgICAgICB2YXIgZWRpdG9yID0gdGhpcy5jcmVhdGUoKTtcclxuXHJcbiAgICAgICAgdGhpcy4kZG9tXHJcbiAgICAgICAgICAgIC5hcHBlbmQoZWRpdEJ1dHRvbilcclxuICAgICAgICAgICAgLmFwcGVuZChlZGl0b3IpO1xyXG5cclxuICAgICAgICBlZGl0QnV0dG9uLmNsaWNrKGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgc2VsZi5ub3RpZnlPcGVuKCk7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIGNyZWF0ZTogZnVuY3Rpb24gKCkge30sXHJcblxyXG4gICAgb3BlbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgICQoJy5jb2x1bW5zLWVkaXQtYnV0dG9uJywgdGhpcy4kZG9tKS5oaWRlKCk7XHJcbiAgICAgICAgJCgnLmNvbHVtbnMtZWRpdG9yJywgdGhpcy4kZG9tKS5zaG93KCk7XHJcbiAgICB9LFxyXG5cclxuICAgIGNsb3NlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgJCgnLmNvbHVtbnMtZWRpdG9yJywgdGhpcy4kZG9tKS5oaWRlKCk7XHJcbiAgICAgICAgJCgnLmNvbHVtbnMtZWRpdC1idXR0b24nLCB0aGlzLiRkb20pLnNob3coKTtcclxuICAgIH0sXHJcblxyXG4gICAgbm90aWZ5T3BlbjogZnVuY3Rpb24gKCkge30sXHJcblxyXG4gICAgbm90aWZ5Q2hhbmdlOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdGhpcy5vblZhbHVlQ2hhbmdlZCgpO1xyXG4gICAgICAgIHRoaXMuY2xvc2UoKTtcclxuICAgICAgICB0aGlzLiRkb20udHJpZ2dlcigndXBkYXRlLmVkaXRvcnMuZHQnLCB7XHJcbiAgICAgICAgICAgIGVkaXRvcjogdGhpc1xyXG4gICAgICAgIH0pO1xyXG4gICAgfSxcclxuXHJcbiAgICBvblZhbHVlQ2hhbmdlZDogZnVuY3Rpb24gKCkge30sXHJcblxyXG4gICAgcmVnaXN0ZXI6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xyXG4gICAgICAgIHRoaXMuJGRvbS5vbigndXBkYXRlLmVkaXRvcnMuZHQnLCBjYWxsYmFjayk7XHJcbiAgICB9LFxyXG5cclxuICAgIHRyYW5zZm9ybVZhbHVlOiBmdW5jdGlvbiAob2xkVmFsdWUsIGNlbGwsIGNlbGxJbmRleCkge1xyXG4gICAgICAgIHJldHVybiBvbGRWYWx1ZTtcclxuICAgIH1cclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gQmFzZUVkaXRvcjtcclxuIiwiJ3VzZSBzdHJpY3QnO1xyXG5cclxudmFyICQgPSAodHlwZW9mIHdpbmRvdyAhPT0gXCJ1bmRlZmluZWRcIiA/IHdpbmRvd1snJCddIDogdHlwZW9mIGdsb2JhbCAhPT0gXCJ1bmRlZmluZWRcIiA/IGdsb2JhbFsnJCddIDogbnVsbCk7XHJcbnZhciBCYXNlRWRpdG9yID0gcmVxdWlyZSgnLi9iYXNlRWRpdG9yJylcclxudmFyIENvbHVtbnNFZGl0b3IgPSByZXF1aXJlKCcuLi9jb2x1bW5zRWRpdG9yJyk7XHJcblxyXG52YXIgQnV0dG9uRWRpdG9yID0gJC5leHRlbmQoe30sIEJhc2VFZGl0b3IsIHtcclxuXHJcbiAgICBjcmVhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgJGJ1dHRvbiA9ICQoJzxidXR0b24vPicsICQuZXh0ZW5kKHtcclxuICAgICAgICAgICAgJ2NsYXNzJzogJ2J0biBidG4tZGVmYXVsdCBjb2x1bW5zLWVkaXRvci1idXR0b24nXHJcbiAgICAgICAgfSwgdGhpcy5idXR0QXR0cnMpKTtcclxuXHJcbiAgICAgICAgLy8gRklYTUU6IENvZGUgZHVwbGljYXRpb25cclxuICAgICAgICB2YXIgbGFiZWwgPSB0aGlzLiRkb20udGV4dCgpO1xyXG4gICAgICAgIHRoaXMuJGRvbS5odG1sKCQoJzxzcGFuLz4nLCB7XHJcbiAgICAgICAgICAgIGNsYXNzOiAnY29sdW1ucy1oZWFkZXItbGFiZWwnLFxyXG4gICAgICAgICAgICB0ZXh0OiBsYWJlbFxyXG4gICAgICAgIH0pKVxyXG4gICAgICAgIC5hcHBlbmQoJGJ1dHRvbik7XHJcblxyXG4gICAgICAgIHJldHVybiB0aGlzO1xyXG4gICAgfSxcclxuXHJcbiAgICBub3RpZnlPcGVuOiBmdW5jdGlvbiAoKSB7XHJcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xyXG4gICAgICAgIHRoaXMub3BlbigpO1xyXG5cclxuICAgICAgICAkKCcuY29sdW1ucy1lZGl0b3ItYnV0dG9uJywgdGhpcy4kZG9tKVxyXG4gICAgICAgICAgICAub25lKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XHJcbiAgICAgICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XHJcbiAgICAgICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xyXG4gICAgICAgICAgICAgICAgc2VsZi5ub3RpZnlDaGFuZ2UoKTtcclxuICAgICAgICAgICAgICAgIHNlbGYubm90aWZ5Q2xvc2UoKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICB9LFxyXG5cclxuICAgIHRyYW5zZm9ybVZhbHVlOiBmdW5jdGlvbiAodmFsdWUpIHtcclxuICAgICAgICByZXR1cm4gdmFsdWU7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuQ29sdW1uc0VkaXRvci5wcm90b3R5cGUuYnVpbGRlcnMuYnV0dG9uID0gZnVuY3Rpb24oc2V0dGluZ3MpIHtcclxuICByZXR1cm4gJC5leHRlbmQoe30sIEJ1dHRvbkVkaXRvciwgc2V0dGluZ3MpO1xyXG59O1xyXG5cclxubW9kdWxlLmV4cG9ydHMgPSBCdXR0b25FZGl0b3I7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnZhciAkID0gKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3dbJyQnXSA6IHR5cGVvZiBnbG9iYWwgIT09IFwidW5kZWZpbmVkXCIgPyBnbG9iYWxbJyQnXSA6IG51bGwpO1xyXG52YXIgQmFzZUVkaXRvciA9IHJlcXVpcmUoJy4vYmFzZUVkaXRvcicpXHJcbnZhciBDb2x1bW5zRWRpdG9yID0gcmVxdWlyZSgnLi4vY29sdW1uc0VkaXRvcicpO1xyXG5cclxudmFyIElucHV0RWRpdG9yID0gJC5leHRlbmQoe30sIEJhc2VFZGl0b3IsIHtcclxuXHJcbiAgICBjcmVhdGU6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICB2YXIgJGVkaXRvcklucHV0ID0gJCgnPGlucHV0Lz4nLCB7XHJcbiAgICAgICAgICAgICdjbGFzcyc6ICdjb2x1bW5zLWVkaXRvci1pbnB1dCdcclxuICAgICAgICB9KTtcclxuICAgICAgICB2YXIgJGVkaXRvckJ1dHRvbiA9ICQoJzxidXR0b24vPicsJC5leHRlbmQoe1xyXG4gICAgICAgICAgICAgICAgJ2NsYXNzJzogJ2J0biBidG4tZGVmYXVsdCBjb2x1bW5zLWVkaXRvci1idXR0b24nLFxyXG4gICAgICAgICAgICAgICAgJ3RleHQnOiAnT0snXHJcbiAgICAgICAgICAgIH0sIHRoaXMudmFsaWRhdGVCdXR0b25BdHRycylcclxuICAgICAgICApO1xyXG4gICAgICAgIHZhciAkZWRpdG9yID0gJCgnPHNwYW4vPicsIHtcclxuICAgICAgICAgICAgJ2NsYXNzJzogJ3B1bGwtcmlnaHQgY29sdW1ucy1lZGl0b3InXHJcbiAgICAgICAgfSlcclxuICAgICAgICAuYXBwZW5kKCRlZGl0b3JJbnB1dClcclxuICAgICAgICAuYXBwZW5kKCRlZGl0b3JCdXR0b24pXHJcbiAgICAgICAgLmhpZGUoKTtcclxuXHJcbiAgICAgICAgdmFyIGxhYmVsID0gdGhpcy4kZG9tLnRleHQoKTtcclxuICAgICAgICB0aGlzLiRkb20uaHRtbCgkKCc8c3Bhbi8+Jywge1xyXG4gICAgICAgICAgICBjbGFzczogJ2NvbHVtbnMtaGVhZGVyLWxhYmVsJyxcclxuICAgICAgICAgICAgdGV4dDogbGFiZWxcclxuICAgICAgICB9KSlcclxuICAgICAgICAuYXBwZW5kKCRlZGl0b3IpO1xyXG5cclxuICAgICAgICByZXR1cm4gdGhpcztcclxuICAgIH0sXHJcblxyXG4gICAgbm90aWZ5T3BlbjogZnVuY3Rpb24gKCkge1xyXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcclxuICAgICAgICB0aGlzLm9wZW4oKTtcclxuICAgICAgICB0aGlzLiRlZGl0b3JJbnB1dCA9ICQoJy5jb2x1bW5zLWVkaXRvci1pbnB1dCcsIHRoaXMuJGRvbSlcclxuICAgICAgICAgICAgLy8gUHJldmVudCBmcm9tIHNvcnRpbmcgY29sdW1uIHdoZW4gdXNlciBjbGlja3Mgb24gaW5wdXRcclxuICAgICAgICAgICAgLmNsaWNrKGZ1bmN0aW9uKGV2ZW50KSB7XHJcbiAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmtleXByZXNzKGZ1bmN0aW9uIChldmVudCkge1xyXG4gICAgICAgICAgICAgICAgZXZlbnQuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICBzd2l0Y2ggKGV2ZW50LmtleSkge1xyXG4gICAgICAgICAgICAgICAgICAgIGNhc2UgJ0VzY2FwZSc6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbGYuY2xvc2UoKTtcclxuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgICAgICAgICAgICAgY2FzZSAnRW50ZXInOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICBzZWxmLm5vdGlmeUNoYW5nZSgpO1xyXG4gICAgICAgICAgICAgICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfSlcclxuICAgICAgICAgICAgLmZvY3VzKCk7XHJcblxyXG4gICAgICAgICQoJy5jb2x1bW5zLWVkaXRvci1idXR0b24nLCB0aGlzLiRkb20pXHJcbiAgICAgICAgICAgIC5vbmUoJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcclxuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcclxuICAgICAgICAgICAgICAgIGUuc3RvcFByb3BhZ2F0aW9uKCk7XHJcbiAgICAgICAgICAgICAgICBzZWxmLm5vdGlmeUNoYW5nZSgpO1xyXG4gICAgICAgICAgICB9KTtcclxuICAgIH0sXHJcblxyXG4gICAgdHJhbnNmb3JtVmFsdWU6IGZ1bmN0aW9uIChvbGRWYWx1ZSwgY2VsbCwgY2VsbEluZGV4KSB7XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuY2hhbmdlVmFsdWUob2xkVmFsdWUsIGNlbGwsIGNlbGxJbmRleCkgPyB0aGlzLiRlZGl0b3JJbnB1dC52YWwoKSA6IG9sZFZhbHVlO1xyXG4gICAgfSxcclxuXHJcbiAgICBjaGFuZ2VWYWx1ZTogZnVuY3Rpb24gKG9sZFZhbHVlLCBjZWxsLCBjZWxsSW5kZXgpIHtcclxuICAgICAgICByZXR1cm4gJChjZWxsKS5maW5kKCdpbnB1dCcpLmxlbmd0aCA+IDA7XHJcbiAgICB9XHJcbn0pO1xyXG5cclxuQ29sdW1uc0VkaXRvci5wcm90b3R5cGUuYnVpbGRlcnMuaW5wdXQgPSBmdW5jdGlvbihzZXR0aW5ncykge1xyXG4gIHJldHVybiAkLmV4dGVuZCh7fSwgSW5wdXRFZGl0b3IsIHNldHRpbmdzKTtcclxufTtcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gSW5wdXRFZGl0b3I7XHJcbiIsIid1c2Ugc3RyaWN0JztcclxuXHJcbnJlcXVpcmUoJy4vZWRpdG9yL2Jhc2VFZGl0b3InKTtcclxucmVxdWlyZSgnLi9lZGl0b3IvaW5wdXQnKTtcclxucmVxdWlyZSgnLi9lZGl0b3IvYnV0dG9uJyk7XHJcbnJlcXVpcmUoJy4vY29sdW1uc0VkaXRvcicpO1xyXG4iXX0=
